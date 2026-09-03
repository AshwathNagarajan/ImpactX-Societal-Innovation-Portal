from typing import Any, Dict, List

from app.rag.document_loader import load_documents
from app.rag.vector_store import vector_store


def ensure_index() -> None:
    if vector_store.index is not None:
        return
    if vector_store.load():
        return
    documents = load_documents()
    vector_store.build(documents)


def retrieve_context(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    ensure_index()
    return vector_store.search(query, top_k=top_k)
