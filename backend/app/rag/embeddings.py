from functools import lru_cache
from typing import Iterable, List

from app.core.config import settings


@lru_cache
def get_embedding_model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(settings.hf_embedding_model)


def generate_embeddings(texts: Iterable[str]) -> List[List[float]]:
    values = list(texts)
    if not values:
        return []
    model = get_embedding_model()
    vectors = model.encode(values, normalize_embeddings=True)
    return vectors.tolist()
