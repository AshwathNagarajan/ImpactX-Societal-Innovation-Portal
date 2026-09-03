from typing import Any

from app.ai.schemas.recommendation import InstituteRecommendation
from app.rag.embeddings import generate_embeddings
from app.rag.pipeline import build_challenge_query, similarity


def _overlap_score(needles: list[str], haystack: list[str]) -> int:
    text = " ".join(map(str, haystack)).lower()
    if not needles:
        return 0
    matches = sum(1 for item in needles if item.lower() in text)
    return round((matches / max(1, len(needles))) * 100)


async def recommend_institutes_for_challenge(challenge: dict[str, Any], institutes: list[dict[str, Any]], required_expertise: list[str] | None = None) -> list[dict[str, Any]]:
    if not institutes:
        return []
    required_expertise = required_expertise or []
    query = " ".join([build_challenge_query(challenge), " ".join(required_expertise)])
    corpus = [
        " ".join(
            map(
                str,
                [
                    item.get("name", ""),
                    item.get("departments", []),
                    item.get("expertise", []),
                    item.get("research_domains", []),
                    item.get("facilities", []),
                    item.get("previous_projects", []),
                ],
            )
        )
        for item in institutes
    ]
    vectors = generate_embeddings([query, *corpus])
    recommendations = []
    for institute, vector in zip(institutes, vectors[1:]):
        expertise_similarity = max(0, min(100, round(similarity(vectors[0], vector) * 100)))
        department_relevance = _overlap_score(required_expertise, institute.get("departments", []) + institute.get("expertise", []))
        previous_projects = min(100, len(institute.get("previous_projects", [])) * 30)
        facilities = min(100, len(institute.get("facilities", [])) * 30)
        location = 100 if institute.get("district") == challenge.get("district") else 55
        availability = 100 if institute.get("availability", True) else 20
        past_performance = 75
        score = round(
            expertise_similarity * 0.40
            + department_relevance * 0.15
            + previous_projects * 0.15
            + facilities * 0.10
            + location * 0.05
            + availability * 0.10
            + past_performance * 0.05
        )
        expertise = institute.get("expertise", [])[:5]
        recommendation = InstituteRecommendation(
            institute_id=str(institute.get("_id", institute.get("id", ""))),
            name=institute.get("name", ""),
            match_score=max(0, min(100, score)),
            matching_expertise=expertise,
            relevant_departments=institute.get("departments", [])[:4],
            reason=f"Matches challenge needs through {', '.join(expertise[:3]) or 'relevant research capacity'} and available facilities.",
            recommended_role="Primary Solution Development Partner" if score >= 85 else "Solution Development Partner",
            scoring={
                "expertise_similarity": expertise_similarity,
                "department_relevance": department_relevance,
                "previous_projects": previous_projects,
                "facilities": facilities,
                "location": location,
                "availability": availability,
                "past_performance": past_performance,
            },
        )
        recommendations.append(recommendation.model_dump())
    return sorted(recommendations, key=lambda item: item["match_score"], reverse=True)[:5]

