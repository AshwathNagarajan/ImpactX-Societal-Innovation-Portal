from typing import Any

from app.ai.analysis.category_classifier import CATEGORY_KEYWORDS, classify_category
from app.ai.analysis.duplicate_detector import detect_similar_challenges
from app.ai.analysis.priority_engine import calculate_priority
from app.ai.analysis.severity_engine import calculate_severity
from app.ai.matching.institute_matcher import recommend_institutes_for_challenge
from app.ai.models.llm import llm_provider
from app.ai.rag.retriever import retrieve_context
from app.ai.schemas.analysis import ChallengeAIAnalysis
from app.ai.solutions.solution_generator import generate_solution_directions
from app.core.config import settings
from app.rag.pipeline import build_challenge_query
from app.utils.helpers import utc_now


EXPERTISE_BY_CATEGORY = {
    "AGRICULTURE": ["AI", "Computer Vision", "Agriculture Technology", "Data Analytics"],
    "DISASTER_MANAGEMENT": ["IoT", "Embedded Systems", "Hydrology", "Communication Systems", "Data Analytics"],
    "WATER_AND_SANITATION": ["Water Management", "Civil Engineering", "IoT", "Environmental Monitoring"],
    "HEALTHCARE": ["Healthcare Systems", "Public Health", "Mobile Platforms", "Data Analytics"],
    "ACCESSIBILITY": ["Assistive Technology", "Human-Centered Design", "Embedded Systems", "Mobile Development"],
    "ENVIRONMENT": ["Environmental Engineering", "Sensor Networks", "Data Analytics", "Community Research"],
    "WASTE_MANAGEMENT": ["Waste Management", "Computer Vision", "IoT", "Operations Research"],
}


TECH_BY_EXPERTISE = {
    "AI": "Machine Learning Models",
    "Computer Vision": "Image Classification",
    "IoT": "IoT Sensors",
    "Embedded Systems": "Low-Power Embedded Boards",
    "Hydrology": "Water-Level Monitoring",
    "Communication Systems": "SMS and Alert Gateway",
    "Data Analytics": "Impact Analytics Dashboard",
    "Mobile Platforms": "Mobile Application",
    "Water Management": "Pipeline Monitoring Sensors",
}


def _sentences(text: str, fallback: str) -> str:
    text = (text or "").strip()
    if not text:
        return fallback
    return text if len(text) <= 220 else f"{text[:217].rsplit(' ', 1)[0]}..."


def _affected_groups(challenge: dict[str, Any]) -> list[str]:
    text = " ".join(str(challenge.get(key, "")) for key in ["title", "description", "expected_impact"]).lower()
    groups = []
    mapping = {
        "farm": "Small farmers",
        "village": "Rural communities",
        "student": "Students",
        "patient": "Patients",
        "disabled": "Persons with disabilities",
        "women": "Women and community groups",
        "livestock": "Livestock owners",
    }
    for keyword, label in mapping.items():
        if keyword in text:
            groups.append(label)
    return groups or ["Affected citizens", "Local community"]


def _required_expertise(category: str, generated: dict[str, Any]) -> list[str]:
    expertise = list(dict.fromkeys((generated.get("required_expertise") or []) + EXPERTISE_BY_CATEGORY.get(category, [])))
    return expertise[:6] or ["Community Research", "Product Design", "Field Implementation"]


def _technologies(expertise: list[str], generated: dict[str, Any]) -> list[str]:
    technologies = list(generated.get("recommended_technologies") or [])
    technologies.extend(TECH_BY_EXPERTISE[item] for item in expertise if item in TECH_BY_EXPERTISE)
    return list(dict.fromkeys(technologies))[:7] or ["Mobile data collection", "Analytics dashboard", "Field validation toolkit"]


async def analyze_challenge_intelligence(
    challenge: dict[str, Any],
    existing: list[dict[str, Any]],
    institutes: list[dict[str, Any]],
    analysis_version: int = 1,
) -> ChallengeAIAnalysis:
    context = retrieve_context(build_challenge_query(challenge), top_k=6)
    generated = await llm_provider.generate_json(challenge, context)
    category = classify_category(challenge)
    severity = calculate_severity(challenge)
    priority = calculate_priority(challenge, severity["score"])
    similar = await detect_similar_challenges(challenge, existing)
    expertise = _required_expertise(category["primary_category"], generated)
    technologies = _technologies(expertise, generated)
    institutes_ranked = await recommend_institutes_for_challenge(challenge, institutes, expertise)
    partial_analysis = {
        **category,
        "required_expertise": expertise,
        "recommended_technologies": technologies,
    }
    solutions = generate_solution_directions(challenge, partial_analysis, context)
    duplicate_probability = similar[0]["similarity"] if similar else 0.0
    confidence = round(min(0.97, (category["category_confidence"] * 0.45) + ((1 - duplicate_probability) * 0.20) + 0.28), 2)
    now = utc_now()
    analysis = ChallengeAIAnalysis(
        challenge_id=challenge.get("challenge_id", ""),
        summary=generated.get("summary") or _sentences(challenge.get("description", ""), "Structured analysis generated from citizen submission."),
        problem_statement=generated.get("problem_statement") or f"{challenge.get('title', 'This challenge')} requires validated civic innovation support.",
        primary_category=category["primary_category"],
        subcategory=category["subcategory"],
        secondary_categories=category["secondary_categories"],
        category_confidence=category["category_confidence"],
        severity=severity,
        priority=priority,
        affected_groups=_affected_groups(challenge),
        root_causes=generated.get("root_causes") or ["Limited local monitoring", "Delayed response coordination", "Resource constraints"],
        key_constraints=generated.get("key_constraints") or ["Field validation required", "Community adoption must be verified"],
        required_expertise=expertise,
        recommended_departments=generated.get("recommended_departments") or expertise[:4],
        recommended_technologies=technologies,
        similar_challenges=similar,
        duplicate_probability=duplicate_probability,
        recommended_institutes=institutes_ranked,
        proposed_solution_directions=solutions,
        potential_industry_support=generated.get("potential_industry_support") or ["Technical Mentorship", "Prototype Support", "Pilot Deployment"],
        related_government_context=[item.get("source", "") for item in context[:3] if item.get("source")],
        expected_social_impact=generated.get("expected_social_impact") or challenge.get("expected_impact", ""),
        risks=generated.get("risk_factors") or ["Pilot adoption risk", "Data quality risk", "Inter-agency coordination delay"],
        confidence_score=confidence,
        rag_sources=[
            {
                "source": item.get("source", ""),
                "document_type": item.get("document_type") or item.get("type", ""),
                "category": item.get("category", ""),
                "score": round(item.get("score", 0.0), 4),
            }
            for item in context
        ],
        audit={
            "model": settings.hf_generation_model,
            "embedding_model": settings.hf_embedding_model,
            "generated_at": now.isoformat(),
            "confidence": confidence,
            "analysis_version": analysis_version,
            "analysis_method": "RAG + embeddings + deterministic severity/priority scoring + structured LLM support",
        },
    )
    return analysis

