import asyncio
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from core.security import get_current_user
from db.session import get_db, AsyncSessionLocal
from models.user import User
from models.job import ProcessingJob, ProcessingResult
from models.document import Document
from schemas.schemas import JobOut, ResultOut

router = APIRouter()


@router.get("/", response_model=list[JobOut])
async def list_jobs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ProcessingJob)
        .where(ProcessingJob.user_id == current_user.id)
        .options(selectinload(ProcessingJob.document))
        .order_by(ProcessingJob.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{job_id}", response_model=JobOut)
async def get_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ProcessingJob)
        .where(ProcessingJob.id == job_id, ProcessingJob.user_id == current_user.id)
        .options(selectinload(ProcessingJob.document))
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/{job_id}/result", response_model=ResultOut)
async def get_result(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ProcessingResult)
        .join(ProcessingJob)
        .where(ProcessingJob.id == job_id, ProcessingJob.user_id == current_user.id)
    )
    processing_result = result.scalar_one_or_none()
    if not processing_result:
        raise HTTPException(status_code=404, detail="Result not found")
    return processing_result


@router.get("/{job_id}/stream")
async def stream_job_status(
    job_id: str,
    token: str | None = None,          # EventSource can't send headers
    current_user: User = Depends(get_current_user),
):
    """Server-Sent Events endpoint for real-time job status updates."""

    async def event_generator():
        while True:
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(ProcessingJob).where(
                        ProcessingJob.id == job_id,
                        ProcessingJob.user_id == current_user.id,
                    )
                )
                job = result.scalar_one_or_none()

            if not job:
                yield f"data: {json.dumps({'error': 'Job not found'})}\n\n"
                break

            payload = {
                "job_id": job.id,
                "status": job.status,
                "stage": job.stage,
                "updated_at": job.updated_at.isoformat(),
            }
            yield f"data: {json.dumps(payload)}\n\n"

            if job.status in ("completed", "failed"):
                break

            await asyncio.sleep(2)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
