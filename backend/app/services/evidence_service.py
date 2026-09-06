from pathlib import Path
from typing import Any
from uuid import uuid4
import base64

from fastapi import UploadFile
import httpx
from pypdf import PdfReader
from docx import Document

from app.core.config import BACKEND_DIR, settings
from app.core.database import get_database
from app.utils.helpers import utc_now
from app.utils.serializers import serialize_document


UPLOAD_DIR = BACKEND_DIR / "uploads" / "evidence"
MAX_DATABASE_FILE_BYTES = 8 * 1024 * 1024


async def save_evidence_files(files: list[UploadFile], entity_type: str = "general", entity_id: str = "", user: dict | None = None) -> list[dict[str, Any]]:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    saved = []
    for file in files:
        suffix = Path(file.filename or "").suffix.lower()
        stored_name = f"{uuid4().hex}{suffix}"
        stored_path = UPLOAD_DIR / stored_name
        content = await file.read()
        stored_path.write_bytes(content)
        extracted = await extract_text(stored_path, file.content_type or "")
        database_payload = database_file_payload(content, file.content_type or "")
        document = {
            "evidence_id": f"EVD-{uuid4().hex[:10].upper()}",
            "entity_type": entity_type,
            "entity_id": entity_id,
            "original_name": file.filename,
            "stored_name": stored_name,
            "content_type": file.content_type,
            "size": len(content),
            "path": str(stored_path),
            "stored_in_database": database_payload["stored_in_database"],
            **database_payload["fields"],
            "ocr_text": extracted["text"],
            "ocr_status": extracted["status"],
            "ocr_engine": extracted["engine"],
            "uploaded_by": (user or {}).get("id"),
            "uploaded_at": utc_now(),
        }
        await get_database().evidence.insert_one(document)
        saved.append(serialize_document(document))
    return saved


def database_file_payload(content: bytes, content_type: str) -> dict[str, Any]:
    if len(content) > MAX_DATABASE_FILE_BYTES:
        return {"stored_in_database": False, "fields": {"database_storage_reason": "file_exceeds_database_inline_limit"}}
    encoded = base64.b64encode(content).decode("ascii")
    fields: dict[str, Any] = {
        "file_base64": encoded,
        "file_data_url": f"data:{content_type};base64,{encoded}",
    }
    if content_type.startswith("image/"):
        fields["image_base64"] = encoded
        fields["image_data_url"] = fields["file_data_url"]
    return {"stored_in_database": True, "fields": fields}


async def extract_text(path: Path, content_type: str = "") -> dict[str, str]:
    suffix = path.suffix.lower()
    try:
        if suffix == ".pdf":
            reader = PdfReader(str(path))
            text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
            return {"status": "COMPLETED" if text else "NO_TEXT_FOUND", "engine": "pypdf", "text": text}
        if suffix in {".docx", ".doc"}:
            document = Document(str(path))
            text = "\n".join(paragraph.text for paragraph in document.paragraphs).strip()
            return {"status": "COMPLETED" if text else "NO_TEXT_FOUND", "engine": "python-docx", "text": text}
        if suffix in {".txt", ".csv", ".md"} or content_type.startswith("text/"):
            return {"status": "COMPLETED", "engine": "plain-text", "text": path.read_text(encoding="utf-8", errors="ignore").strip()}
        if content_type.startswith("image/"):
            return await extract_image_text(path, content_type)
    except Exception as exc:
        return {"status": "FAILED", "engine": "extractor", "text": f"Extraction failed: {exc.__class__.__name__}"}
    return {"status": "STORED", "engine": "metadata-only", "text": ""}


async def extract_image_text(path: Path, content_type: str = "") -> dict[str, str]:
    if not settings.huggingface_token:
        return {"status": "PENDING_IMAGE_OCR", "engine": "huggingface-router", "text": ""}
    data_url = f"data:{content_type};base64,{base64.b64encode(path.read_bytes()).decode('ascii')}"
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                "https://router.huggingface.co/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.huggingface_token}", "Content-Type": "application/json"},
                json={
                    "model": settings.hf_ocr_model,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Extract all readable text from this evidence image. Return only the extracted text. If there is no readable text, return an empty string."},
                                {"type": "image_url", "image_url": {"url": data_url}},
                            ],
                        }
                    ],
                    "max_tokens": 700,
                    "temperature": 0,
                },
            )
            response.raise_for_status()
            text = response.json()["choices"][0]["message"]["content"].strip()
            return {"status": "COMPLETED" if text else "NO_TEXT_FOUND", "engine": settings.hf_ocr_model, "text": text}
    except Exception as exc:
        return {"status": "PENDING_IMAGE_OCR", "engine": settings.hf_ocr_model, "text": f"Image OCR pending: {exc.__class__.__name__}"}
