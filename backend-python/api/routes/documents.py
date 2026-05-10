import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.config import settings
from core.security import get_current_user
from db.session import get_db
from models.user import User
from models.document import Document
from models.job import ProcessingJob
from schemas.schemas import DocumentOut, JobOut
from workers.tasks import process_document

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
}


@router.post("/upload", response_model=JobOut, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT.")

    content = await file.read()
    if len(content) > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.max_file_size_mb}MB limit")

    file_type = ALLOWED_TYPES[file.content_type]
    unique_name = f"{uuid.uuid4()}.{file_type}"
    user_dir = Path(settings.upload_dir) / current_user.id
    user_dir.mkdir(parents=True, exist_ok=True)
    storage_path = str(user_dir / unique_name)

    with open(storage_path, "wb") as f:
        f.write(content)

    document = Document(
        user_id=current_user.id,
        filename=unique_name,
        original_name=file.filename,
        file_type=file_type,
        file_size=len(content),
        storage_path=storage_path,
    )
    db.add(document)
    await db.flush()

    job = ProcessingJob(document_id=document.id, user_id=current_user.id)
    db.add(job)
    await db.commit()
    await db.refresh(job)
    await db.refresh(document)

    # Dispatch to Celery
    task = process_document.delay(job.id, document.id, storage_path, file_type)
    job.celery_task_id = task.id
    await db.commit()
    await db.refresh(job)

    # Eager load document for response
    job.document = document
    return job


@router.get("/", response_model=list[DocumentOut])
async def list_documents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Document).where(Document.user_id == current_user.id).order_by(Document.created_at.desc())
    )
    return result.scalars().all()
