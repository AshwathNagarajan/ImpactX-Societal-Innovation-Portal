from typing import Any, Dict, List

from app.core.config import settings
from app.rag.embeddings import generate_embeddings
from app.rag.generator import generate_structured_analysis
from app.rag.retriever import retrieve_context
from app.schemas.ai import AIAnalysis
from app.services.challenge_service import calculate_priority_score, priority_level


def initialize_rag() -> None:
    retrieve_context("IMPACTX societal innovation", top_k=1)


def build_challenge_query(challenge: Dict[str, Any]) -> str:
    return " ".join(
        str(challenge.get(key, ""))
        for key in ["title", "description", "category", "district", "location", "expected_impact"]
    )


def similarity(a: List[float], b: List[float]) -> float:
    return float(sum(x * y for x, y in zip(a, b)))


async def find_similar_challenges(challenge: Dict[str, Any], existing: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
    query = f"{challenge.get('title', '')} {challenge.get('description', '')}"
    corpus = [f"{item.get('title', '')} {item.get('description', '')}" for item in existing]
    if not corpus:
        return []
    vectors = generate_embeddings([query, *corpus])
    query_vector, doc_vectors = vectors[0], vectors[1:]
    scored = []
    for item, vector in zip(existing, doc_vectors):
        scored.append(
            {
                "challenge_id": item.get("challenge_id", ""),
                "title": item.get("title", ""),
                "similarity": round(similarity(query_vector, vector), 4),
            }
        )
    return sorted(scored, key=lambda item: item["similarity"], reverse=True)[:top_k]


async def recommend_institutes(challenge: Dict[str, Any], institutes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    query = build_challenge_query(challenge)
    corpus = [" ".join(map(str, [i.get("name", ""), i.get("departments", []), i.get("expertise", []), i.get("research_domains", [])])) for i in institutes]
    if not corpus:
        return []
    vectors = generate_embeddings([query, *corpus])
    results = []
    for institute, vector in zip(institutes, vectors[1:]):
        score = int(max(0, min(100, similarity(vectors[0], vector) * 100)))
        results.append(
            {
                "institute_id": str(institute.get("_id", institute.get("id", ""))),
                "name": institute.get("name", ""),
                "match_score": score,
                "matching_expertise": institute.get("expertise", [])[:4],
                "reason": "Semantic match between challenge needs and institute expertise.",
            }
        )
    return sorted(results, key=lambda item: item["match_score"], reverse=True)[:5]


async def recommend_industries(challenge: Dict[str, Any], industries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    query = build_challenge_query(challenge)
    corpus = [" ".join(map(str, [i.get("name", ""), i.get("sector", ""), i.get("expertise", []), i.get("technologies", []), i.get("support_types", [])])) for i in industries]
    if not corpus:
        return []
    vectors = generate_embeddings([query, *corpus])
    results = []
    for industry, vector in zip(industries, vectors[1:]):
        score = int(max(0, min(100, similarity(vectors[0], vector) * 100)))
        results.append(
            {
                "industry_id": str(industry.get("_id", industry.get("id", ""))),
                "name": industry.get("name", ""),
                "match_score": score,
                "support_types": industry.get("support_types", [])[:4],
            }
        )
    return sorted(results, key=lambda item: item["match_score"], reverse=True)[:5]


async def analyze_challenge(challenge: Dict[str, Any], existing: List[Dict[str, Any]], institutes: List[Dict[str, Any]], industries: List[Dict[str, Any]]) -> AIAnalysis:
    context = retrieve_context(build_challenge_query(challenge), top_k=6)
    generated = await generate_structured_analysis(challenge, context)
    score = calculate_priority_score(challenge)
    similar = await find_similar_challenges(challenge, existing)
    generated.update(
        {
            "priority_score": score,
            "priority_level": priority_level(score),
            "impact_score": min(100, max(35, score + 8)),
            "duplicate_probability": similar[0]["similarity"] if similar else 0.0,
            "similar_challenges": similar,
            "recommended_institutes": await recommend_institutes(challenge, institutes),
            "potential_industry_support": generated.get("potential_industry_support", []),
            "rag_sources": [
                {"source": item.get("source", ""), "type": item.get("type", ""), "score": round(item.get("score", 0.0), 4)}
                for item in context
            ],
        }
    )
    return AIAnalysis.model_validate(generated)
