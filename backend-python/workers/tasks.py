from datetime import datetime, timezone
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from workers.celery_app import celery_app
from core.config import settings
from models.job import ProcessingJob, ProcessingResult, PROCESSING, COMPLETED, FAILED
from services.document_parser import parse_document
from services.ai_pipeline import run_pipeline

# Synchronous engine for Celery workers — avoids asyncio event loop conflicts
_sync_url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://").replace("postgresql://", "postgresql://")
SyncEngine = create_engine(_sync_url, pool_pre_ping=True)
SyncSession = sessionmaker(SyncEngine)


def _update_job(job_id: str, **kwargs):
    with SyncSession() as db:
        job = db.execute(select(ProcessingJob).where(ProcessingJob.id == job_id)).scalar_one_or_none()
        if job:
            for k, v in kwargs.items():
                setattr(job, k, v)
            job.updated_at = datetime.now(timezone.utc)
            db.commit()


def _save_result(job_id: str, ai_result: dict, chunks: list, parsed: dict):
    with SyncSession() as db:
        result = ProcessingResult(
            job_id=job_id,
            summary=ai_result.get("summary"),
            extracted_data=ai_result.get("extracted_data"),
            chunks=chunks[:10],
            doc_metadata={
                "word_count": parsed.get("word_count"),
                "page_count": parsed.get("page_count"),
                "char_count": parsed.get("char_count"),
            },
        )
        db.add(result)
        db.commit()


@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)
def process_document(self, job_id: str, document_id: str, storage_path: str, file_type: str):
    try:
        # Stage 1: parsing
        _update_job(job_id, status=PROCESSING, stage="parsing")
        parsed = parse_document(storage_path, file_type)

        # Stage 2: chunking
        _update_job(job_id, stage="chunking")
        chunks = _chunk_text(parsed["text"])

        # Stage 3: AI extraction & summarization
        _update_job(job_id, stage="analyzing")
        ai_result = run_pipeline(chunks, parsed)

        # Stage 4: persist result
        _save_result(job_id, ai_result, chunks, parsed)
        _update_job(job_id, status=COMPLETED, stage="completed", completed_at=datetime.now(timezone.utc))

    except Exception as exc:
        _update_job(job_id, status=FAILED, stage="failed", error_message=str(exc))
        raise self.retry(exc=exc)


def _chunk_text(text: str, chunk_size: int = 500) -> list[str]:
    words = text.split()
    return [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]
