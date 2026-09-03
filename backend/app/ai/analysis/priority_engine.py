from typing import Any

from app.ai.analysis.severity_engine import level_for_score, people_affected_score


def calculate_priority(challenge: dict[str, Any], severity_score: int) -> dict[str, Any]:
    urgency = str(challenge.get("urgency", "")).upper()
    people = int(challenge.get("people_affected") or 0)
    text = " ".join(str(challenge.get(key, "")) for key in ["title", "description", "expected_impact"]).lower()
    urgency_score = {"CRITICAL": 100, "HIGH": 82, "MEDIUM": 55, "LOW": 25}.get(urgency, 45)
    feasibility = 78 if any(word in text for word in ("app", "sensor", "monitoring", "detection", "system", "platform")) else 62
    community_impact = min(100, people_affected_score(people) + (10 if "community" in text or "village" in text else 0))
    government_relevance = 85 if any(word in text for word in ("water", "health", "school", "safety", "flood", "farmer", "waste")) else 60
    time_sensitivity = urgency_score
    weighted = {
        "Severity": round(severity_score * 0.35),
        "Urgency": round(urgency_score * 0.18),
        "Affected population": round(people_affected_score(people) * 0.14),
        "Intervention feasibility": round(feasibility * 0.10),
        "Community impact": round(community_impact * 0.10),
        "Government relevance": round(government_relevance * 0.08),
        "Time sensitivity": round(time_sensitivity * 0.05),
    }
    score = min(100, sum(weighted.values()))
    return {
        "level": level_for_score(score),
        "score": int(score),
        "factors": [{"factor": factor, "contribution": contribution} for factor, contribution in weighted.items()],
    }

