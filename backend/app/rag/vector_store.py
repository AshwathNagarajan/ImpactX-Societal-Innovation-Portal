import json
from pathlib import Path
from typing import Any, Dict, List

import numpy as np

from app.core.config import settings
from app.rag.embeddings import generate_embeddings


class FaissVectorStore:
    def __init__(self, store_path: Path | None = None):
        self.store_path = store_path or settings.vector_store_path
        self.index_path = self.store_path / "impactx.faiss"
        self.meta_path = self.store_path / "impactx_metadata.json"
        self.index = None
        self.metadata: List[Dict[str, Any]] = []

    def _load_faiss(self):
        import faiss

        return faiss

    def build(self, documents: List[Dict[str, Any]]) -> None:
        self.store_path.mkdir(parents=True, exist_ok=True)
        if not documents:
            self.metadata = []
            return
        embeddings = np.array(generate_embeddings([doc["text"] for doc in documents]), dtype="float32")
        faiss = self._load_faiss()
        self.index = faiss.IndexFlatIP(embeddings.shape[1])
        self.index.add(embeddings)
        self.metadata = documents
        faiss.write_index(self.index, str(self.index_path))
        self.meta_path.write_text(json.dumps(self.metadata, ensure_ascii=False, indent=2), encoding="utf-8")

    def load(self) -> bool:
        if not self.index_path.exists() or not self.meta_path.exists():
            return False
        faiss = self._load_faiss()
        self.index = faiss.read_index(str(self.index_path))
        self.metadata = json.loads(self.meta_path.read_text(encoding="utf-8"))
        return True

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if self.index is None and not self.load():
            return []
        query_vector = np.array(generate_embeddings([query]), dtype="float32")
        scores, indexes = self.index.search(query_vector, top_k)
        results = []
        for score, index in zip(scores[0], indexes[0]):
            if index < 0 or index >= len(self.metadata):
                continue
            item = dict(self.metadata[index])
            item["score"] = float(score)
            results.append(item)
        return results


vector_store = FaissVectorStore()
