from typing import Any

from app.ai.schemas.recommendation import IndustryRecommendation
from app.rag.embeddings import generate_embeddings
from app.rag.pipeline import similarity


def project_matching_text(project: dict[str, Any], challenge: dict[str, Any] | None = None) -> str:
    challenge = challenge or {}
    proposal = project.get("proposal") or project.get("institute_solution") or {}
    return " ".join(
        map(
            str,
            [
                project.get("title", ""),
                project.get("status", ""),
                proposal,
                challenge.get("title", ""),
                challenge.get("description", ""),
                challenge.get("category", ""),
                challenge.get("expected_impact", ""),
            ],
        )
    )


async def recommend_industries_for_project(project: dict[str, Any], industries: list[dict[str, Any]], challenge: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    if not industries:
        return []
    query = project_matching_text(project, challenge)
    corpus = [
        " ".join(
            map(
                str,
                [
                    item.get("name", ""),
                    item.get("sector", ""),
                    item.get("expertise", []),
                    item.get("technologies", []),
                    item.get("support_types", []),
                    item.get("csr_domains", []),
                    item.get("previous_projects", []),
                ],
            )
        )
        for item in industries
    ]
    vectors = generate_embeddings([query, *corpus])
    recommendations = []
    for industry, vector in zip(industries, vectors[1:]):
        semantic = max(0, min(100, round(similarity(vectors[0], vector) * 100)))
        support_types = industry.get("support_types", [])[:4]
        stage = str(project.get("status", "PLANNING"))
        stage_bonus = 10 if stage in ("PROTOTYPE", "TESTING", "PILOT") and any("Pilot" in item or "Prototype" in item for item in support_types) else 0
        score = max(0, min(100, semantic + stage_bonus))
        capabilities = (industry.get("technologies", []) + industry.get("expertise", []))[:5]
        recommendation = IndustryRecommendation(
            industry_id=str(industry.get("_id", industry.get("id", ""))),
            name=industry.get("name", ""),
            match_score=score,
            matching_capabilities=capabilities,
            recommended_support=support_types,
            reason=f"Strong fit for {', '.join(support_types[:2]) or 'technical support'} based on sector and technology capability.",
            scoring={"semantic_similarity": semantic, "stage_bonus": stage_bonus},
        )
        recommendations.append(recommendation.model_dump())
    return sorted(recommendations, key=lambda item: item["match_score"], reverse=True)[:5]

