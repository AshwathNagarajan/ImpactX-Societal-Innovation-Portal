import json
from pathlib import Path
from typing import Any, Dict, Iterable, List

from app.core.config import settings


def load_text_file(path: Path) -> str:
    if path.suffix.lower() == ".json":
        return json.dumps(json.loads(path.read_text(encoding="utf-8")), ensure_ascii=False, indent=2)
    if path.suffix.lower() in {".txt", ".md", ".csv"}:
        return path.read_text(encoding="utf-8")
    if path.suffix.lower() == ".pdf":
        from pypdf import PdfReader

        return "\n".join(page.extract_text() or "" for page in PdfReader(str(path)).pages)
    if path.suffix.lower() == ".docx":
        from docx import Document

        document = Document(str(path))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    return ""


def chunk_text(text: str, chunk_size: int = 720, overlap: int = 100) -> List[str]:
    words = text.split()
    if not words:
        return []
    chunks: List[str] = []
    step = max(1, chunk_size - overlap)
    for start in range(0, len(words), step):
        chunk = " ".join(words[start : start + chunk_size])
        if chunk:
            chunks.append(chunk)
    return chunks


def infer_type(path: Path) -> str:
    parent = path.parent.name
    return parent if parent != settings.knowledge_base_path.name else path.stem


def load_documents(base_path: Path | None = None) -> List[Dict[str, Any]]:
    root = base_path or settings.knowledge_base_path
    documents: List[Dict[str, Any]] = []
    if not root.exists():
        return documents
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in {".txt", ".md", ".json", ".csv", ".pdf", ".docx"}:
            continue
        text = load_text_file(path)
        for index, chunk in enumerate(chunk_text(text)):
            documents.append(
                {
                    "text": chunk,
                    "source": path.name,
                    "path": str(path),
                    "type": infer_type(path),
                    "chunk_index": index,
                }
            )
    return documents
