import json
import re
from typing import Any, Dict, List

import httpx

from app.core.config import settings


def build_prompt(challenge: Dict[str, Any], context: List[Dict[str, Any]]) -> str:
    context_text = "\n\n".join(
        f"SOURCE: {item.get('source')} | TYPE: {item.get('type')} | SCORE: {item.get('score'):.3f}\n{item.get('text')}"
        for item in context
    )
    system_prompt = (
        "You are the AI analysis engine for IMPACTX, a societal innovation collaboration platform. "
        "Ground your analysis only in the challenge information and retrieved context. "
        "Do not invent institutions, schemes, technologies, or previous projects. "
        "Return only valid JSON. Do not include markdown, explanations, or code fences."
    )
    user_prompt = f"""
CONTEXT:
{context_text or "No retrieved context available."}

CHALLENGE:
{json.dumps(challenge, ensure_ascii=False, default=str)}

TASK:
Return a JSON object with these keys:
summary, category, subcategory, priority_score, priority_level,
impact_score, duplicate_probability, similar_challenges, recommended_domains,
required_expertise, recommended_technologies, recommended_departments,
recommended_institutes, potential_industry_support, possible_government_schemes,
suggested_solution_direction, risk_factors, expected_social_impact, confidence_score.
"""
    return f"""
{system_prompt}

CONTEXT:
{context_text or "No retrieved context available."}

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
        return fallback_generation(challenge, context, "missing_huggingface_token")

    headers = {
        "Authorization": f"Bearer {settings.huggingface_token}",
        "Content-Type": "application/json",
    }
    if "qwen" in settings.hf_generation_model.lower():
        return await _generate_with_router_chat(challenge, context, headers)

    prompt = build_prompt(challenge, context)
    url = f"https://api-inference.huggingface.co/models/{settings.hf_generation_model}"
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                url,
                headers=headers,
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 700,
                        "return_full_text": False,
                    },
                    "options": {"wait_for_model": True},
                },
            )
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPStatusError as exc:
        return fallback_generation(challenge, context, f"huggingface_http_{exc.response.status_code}")
    except httpx.HTTPError as exc:
        return fallback_generation(challenge, context, exc.__class__.__name__)

    text = _generated_text(payload)
    try:
        generated = json.loads(_extract_json_object(text))
        generated["_generation_source"] = "huggingface"
        generated["_generation_model"] = settings.hf_generation_model
        return generated
    except (ValueError, json.JSONDecodeError):
        return fallback_generation(challenge, context, "invalid_huggingface_json")


async def _generate_with_router_chat(challenge: Dict[str, Any], context: List[Dict[str, Any]], headers: Dict[str, str]) -> Dict[str, Any]:
    context_text = "\n\n".join(
        f"SOURCE: {item.get('source')} | TYPE: {item.get('type')} | SCORE: {item.get('score'):.3f}\n{item.get('text')}"
        for item in context
    )
    system_prompt = (
        "You are the AI analysis engine for IMPACTX, a societal innovation collaboration platform. "
        "Ground your analysis only in the challenge information and retrieved context. "
        "Do not invent institutions, schemes, technologies, or previous projects. "
        "Return only valid JSON. Do not include markdown, explanations, or code fences."
    )
    user_prompt = f"""
CONTEXT:
{context_text or "No retrieved context available."}

CHALLENGE:
{json.dumps(challenge, ensure_ascii=False, default=str)}

TASK:
Return a JSON object with these keys:
summary, category, subcategory, priority_score, priority_level,
impact_score, duplicate_probability, similar_challenges, recommended_domains,
required_expertise, recommended_technologies, recommended_departments,
recommended_institutes, potential_industry_support, possible_government_schemes,
suggested_solution_direction, risk_factors, expected_social_impact, confidence_score.
"""
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                "https://router.huggingface.co/v1/chat/completions",
                headers=headers,
                json={
                    "model": settings.hf_generation_model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt.strip()},
                    ],
                    "max_tokens": 900,
                    "temperature": 0.2,
                },
            )
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPStatusError as exc:
        return fallback_generation(challenge, context, f"huggingface_router_http_{exc.response.status_code}")
    except httpx.HTTPError as exc:
        return fallback_generation(challenge, context, exc.__class__.__name__)

    try:
        text = payload["choices"][0]["message"]["content"]
        generated = json.loads(_extract_json_object(text))
        generated["_generation_source"] = "huggingface_router"
        generated["_generation_model"] = settings.hf_generation_model
        return generated
    except (KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError):
        return fallback_generation(challenge, context, "invalid_huggingface_router_json")


async def check_huggingface_generation() -> Dict[str, Any]:
    if not settings.huggingface_token:
        return {
            "configured": False,
            "reachable": False,
            "model": settings.hf_generation_model,
            "reason": "missing_huggingface_token",
        }

    probe = {
        "title": "Rural water service disruption",
        "description": "Village households report delayed water supply repairs and need coordinated civic response.",
        "category": "WATER_AND_SANITATION",
    }
    result = await generate_structured_analysis(probe, [])
    return {
        "configured": True,
        "reachable": result.get("_generation_source") == "huggingface",
        "model": settings.hf_generation_model,
        "source": result.get("_generation_source"),
        "fallback_reason": result.get("_fallback_reason"),
    }


def _generated_text(payload: Any) -> str:
    if isinstance(payload, list) and payload:
        first = payload[0]
        if isinstance(first, dict):
            return str(first.get("generated_text") or first.get("summary_text") or first)
    if isinstance(payload, dict):
        return str(payload.get("generated_text") or payload.get("summary_text") or payload)
    return str(payload)


def _extract_json_object(text: str) -> str:
    cleaned = re.sub(r"```(?:json)?|```", "", text or "", flags=re.IGNORECASE).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start < 0 or end < start:
        raise ValueError("No JSON object found in Hugging Face response")
    return cleaned[start : end + 1]


def fallback_generation(challenge: Dict[str, Any], context: List[Dict[str, Any]], reason: str = "fallback") -> Dict[str, Any]:
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
        "_generation_source": "local_fallback",
        "_generation_model": "deterministic_rules",
        "_fallback_reason": reason,
    }
