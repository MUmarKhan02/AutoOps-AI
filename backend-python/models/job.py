import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models import Base

# Job states
QUEUED = "queued"
PROCESSING = "processing"
COMPLETED = "completed"
FAILED = "failed"


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String, ForeignKey("documents.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String, default=QUEUED)
    stage: Mapped[str] = mapped_column(String, default="queued")  # human-readable current stage
    celery_task_id: Mapped[str] = mapped_column(String, nullable=True)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    document: Mapped["Document"] = relationship("Document", back_populates="jobs")
    result: Mapped["ProcessingResult"] = relationship("ProcessingResult", back_populates="job", uselist=False, cascade="all, delete-orphan")


class ProcessingResult(Base):
    __tablename__ = "processing_results"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id: Mapped[str] = mapped_column(String, ForeignKey("processing_jobs.id"), unique=True, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    extracted_data: Mapped[dict] = mapped_column(JSON, nullable=True)   # key-value extractions
    chunks: Mapped[list] = mapped_column(JSON, nullable=True)            # text chunks
    doc_metadata: Mapped[dict] = mapped_column(JSON, nullable=True)   # word count, page count, etc.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    job: Mapped["ProcessingJob"] = relationship("ProcessingJob", back_populates="result")
