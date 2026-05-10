from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Any


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Documents ──────────────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: str
    filename: str
    original_name: str
    file_type: str
    file_size: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Jobs ──────────────────────────────────────────────────────────────────────

class JobOut(BaseModel):
    id: str
    document_id: str
    status: str
    stage: str
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    document: Optional[DocumentOut]

    model_config = {"from_attributes": True}


class ResultOut(BaseModel):
    id: str
    job_id: str
    summary: Optional[str]
    extracted_data: Optional[dict[str, Any]]
    chunks: Optional[list[Any]]
    doc_metadata: Optional[dict[str, Any]]
    created_at: datetime

    model_config = {"from_attributes": True}
