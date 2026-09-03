from typing import Any

from app.core.config import settings
from app.rag.embeddings import generate_embeddings
from app.rag.pipeline import similarity


def thresholds() -> dict[str, float]:
    return {
        "LIKELY_DUPLICATE": settings.duplicate_high_threshold,
        "HIGHLY_SIMILAR": settings.duplicate_possible_threshold,
        "RELATED": 0.70,
    }


def challenge_embedding_text(challenge: dict[str, Any]) -> str:
    return " ".join(
        str(challenge.get(key, ""))
        for key in ["title", "description", "category", "subcategory", "district", "city_or_village", "location"]
    )


async def detect_similar_challenges(challenge: dict[str, Any], existing: list[dict[str, Any]], top_k: int = 5) -> list[dict[str, Any]]:
    if not existing:
        return []
    vectors = generate_embeddings([challenge_embedding_text(challenge), *[challenge_embedding_text(item) for item in existing]])
    query_vector = vectors[0]
    results = []
    for item, vector in zip(existing, vectors[1:]):
        score = round(similarity(query_vector, vector), 4)
        relationship = "NOT_DUPLICATE"
        for name, threshold in thresholds().items():
            if score >= threshold:
                relationship = name
                break
        results.append(
            {
                "challenge_id": item.get("challenge_id", ""),
                "title": item.get("title", ""),
                "category": item.get("category", ""),
                "district": item.get("district", ""),
                "similarity": score,
                "relationship": relationship,
            }
        )
    return sorted(results, key=lambda item: item["similarity"], reverse=True)[:top_k]
