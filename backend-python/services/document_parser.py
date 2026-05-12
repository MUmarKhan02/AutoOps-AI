"""
Document Parser Service
Extracts raw text and metadata from uploaded files.
Supports reading from Redis (redis:file:<jobId>) or local filesystem.
"""
import base64
import os
import tempfile
from pathlib import Path


def _get_file_bytes(storage_path: str) -> bytes:
    """Resolve file bytes from either a Redis key or a local path."""
    if storage_path.startswith("redis:"):
        import redis as redis_lib
        redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379")
        r = redis_lib.from_url(redis_url)
        redis_key = storage_path[len("redis:"):]  # strip "redis:" prefix
        encoded = r.get(redis_key)
        if encoded is None:
            raise FileNotFoundError(f"File not found in Redis at key: {redis_key}")
        file_bytes = base64.b64decode(encoded)
        # Clean up from Redis after reading
        r.delete(redis_key)
        return file_bytes
    else:
        return Path(storage_path).read_bytes()


def parse_document(storage_path: str, file_type: str) -> dict:
    """
    Parse a document and return extracted text + metadata.

    Returns:
        {
            "text": str,
            "word_count": int,
            "char_count": int,
            "page_count": int | None,
        }
    """
    file_bytes = _get_file_bytes(storage_path)

    # Write to a temp file so existing parsers (pypdf, docx) work unchanged
    suffix = f".{file_type}"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = Path(tmp.name)

    try:
        if file_type == "txt":
            return _parse_txt(tmp_path)
        elif file_type == "pdf":
            return _parse_pdf(tmp_path)
        elif file_type == "docx":
            return _parse_docx(tmp_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
    finally:
        tmp_path.unlink(missing_ok=True)


def _parse_txt(path: Path) -> dict:
    text = path.read_text(encoding="utf-8", errors="replace")
    return _stats(text, page_count=None)


def _parse_pdf(path: Path) -> dict:
    from pypdf import PdfReader
    reader = PdfReader(str(path))
    pages = [page.extract_text() or "" for page in reader.pages]
    text = "\n".join(pages)
    return _stats(text, page_count=len(reader.pages))


def _parse_docx(path: Path) -> dict:
    from docx import Document
    doc = Document(str(path))
    text = "\n".join(p.text for p in doc.paragraphs)
    return _stats(text, page_count=None)


def _stats(text: str, page_count) -> dict:
    return {
        "text": text,
        "word_count": len(text.split()),
        "char_count": len(text),
        "page_count": page_count,
    }