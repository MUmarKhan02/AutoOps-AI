"""
Document Parser Service
Extracts raw text and metadata from uploaded files.
"""
from pathlib import Path


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
    path = Path(storage_path)

    if file_type == "txt":
        return _parse_txt(path)
    elif file_type == "pdf":
        return _parse_pdf(path)
    elif file_type == "docx":
        return _parse_docx(path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


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
