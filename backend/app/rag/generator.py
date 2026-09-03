import json
from typing import Any, Dict, List

import httpx

from app.core.config import settings


def build_prompt(challenge: Dict[str, Any], context: List[Dict[str, Any]]) -> str:
    context_text = "\n\n".join(
        f"SOURCE: {item.get('source')} | TYPE: {item.get('type')} | SCORE: {item.get('score'):.3f}\n{item.get('text')}"
        for item in context
    )
    return f"""
You are the AI analysis engine for IMPACTX, a societal innovation collaboration platform.
Ground your analysis only in the challenge information and retrieved context.
Do not invent institutions, schemes, technologies, or previous projects.
Return ONLY valid JSON matching the requested schema.

CONTEXT:
{context_text}

CHALLENGE:
{json.dumps(challenge, ensure_ascii=False, default=str)}

TASK:
Return JSON with summary, category, subcategory, priority_score, priority_level,
impact_score, duplicate_probability, similar_challenges, recommended_domains,
required_expertise, recommended_technologies, recommended_departments,
recommended_institutes, potential_industry_support, possible_government_schemes,
suggested_solution_direction, risk_factors, expected_social_impact, confidence_score.
"""


async def generate_structured_analysis(challenge: Dict[str, Any], context: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not settings.huggingface_token:
        return fallback_generation(challenge, context)

    prompt = build_prompt(challenge, context)
    headers = {"Authorization": f"Bearer {settings.huggingface_token}"}
    url = f"https://api-inference.huggingface.co/models/{settings.hf_generation_model}"
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(url, headers=headers, json={"inputs": prompt, "parameters": {"max_new_tokens": 700}})
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPError:
        return fallback_generation(challenge, context)

    text = payload[0].get("generated_text", "") if isinstance(payload, list) else str(payload)
    try:
        start = text.index("{")
        end = text.rindex("}") + 1
        return json.loads(text[start:end])
    except (ValueError, json.JSONDecodeError):
        return fallback_generation(challenge, context)


def fallback_generation(challenge: Dict[str, Any], context: List[Dict[str, Any]]) -> Dict[str, Any]:
    sources_text = " ".join(item.get("text", "") for item in context).lower()
    category = challenge.get("category", "")
    tech = []
    if "computer vision" in sources_text or "image" in challenge.get("description", "").lower():
        tech.append("Computer Vision")
    if "iot" in sources_text or "sensor" in sources_text:
        tech.append("IoT Sensors")
    if "cloud" in sources_text:
        tech.append("Cloud Analytics")

    return {
        "summary": f"{challenge.get('title')} requires coordinated civic validation, field research and technology prototyping.",
        "category": category,
        "subcategory": challenge.get("subcategory", ""),
        "recommended_domains": [category, "Field Research", "Digital Public Systems"],
        "required_expertise": ["Human-centered Design", "Data Analysis", "Prototype Engineering"],
        "recommended_technologies": tech or ["Mobile Data Collection", "Analytics Dashboard"],
        "recommended_departments": ["Computer Science", "Electronics", "Domain Engineering"],
        "potential_industry_support": ["Technical Mentorship", "Prototype Support", "Pilot Deployment"],
        "possible_government_schemes": [],
        "suggested_solution_direction": "Start with field validation, define measurable pilot indicators, then build a low-cost prototype aligned with district operations.",
        "risk_factors": ["Field adoption risk", "Data quality risk", "Maintenance ownership risk"],
        "expected_social_impact": challenge.get("expected_impact") or "Improved service delivery and measurable community benefit.",
        "confidence_score": 0.68,
    }
