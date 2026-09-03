from typing import Any


SEVERITY_LEVELS = ((75, "CRITICAL"), (50, "HIGH"), (30, "MODERATE"), (0, "LOW"))


def level_for_score(score: int) -> str:
    return next(level for minimum, level in SEVERITY_LEVELS if score >= minimum)


def _contains(text: str, words: tuple[str, ...]) -> bool:
    return any(word in text for word in words)


def people_affected_score(count: int) -> int:
    if count >= 100000:
        return 100
    if count >= 25000:
        return 85
    if count >= 5000:
        return 70
    if count >= 1000:
        return 50
    if count >= 100:
        return 30
    return 15 if count > 0 else 5


def calculate_severity(challenge: dict[str, Any]) -> dict[str, Any]:
    text = " ".join(str(challenge.get(key, "")) for key in ["title", "description", "expected_impact", "existing_attempts"]).lower()
    urgency = str(challenge.get("urgency", "")).upper()
    people = int(challenge.get("people_affected") or 0)
    factors = {
        "people_affected": people_affected_score(people),
        "life_safety": 90 if _contains(text, ("death", "life", "fatal", "flood", "accident", "emergency")) else 30,
        "health": 85 if _contains(text, ("health", "disease", "patient", "medicine", "sanitation")) else 25,
        "essential_service": 80 if _contains(text, ("water", "electricity", "road", "school", "hospital", "pipeline")) else 25,
        "environment": 80 if _contains(text, ("pollution", "waste", "forest", "river", "environment")) else 20,
        "economic": 75 if _contains(text, ("crop", "income", "livelihood", "loss", "property", "farmer")) else 25,
        "vulnerability": 80 if _contains(text, ("children", "elderly", "disabled", "tribal", "rural", "village", "small farmers")) else 25,
        "time_sensitivity": {"CRITICAL": 95, "HIGH": 80, "MEDIUM": 50, "LOW": 20}.get(urgency, 45),
    }
    score = round(
        factors["people_affected"] * 0.15
        + factors["life_safety"] * 0.20
        + factors["health"] * 0.15
        + factors["essential_service"] * 0.15
        + factors["environment"] * 0.10
        + factors["economic"] * 0.10
        + factors["vulnerability"] * 0.10
        + factors["time_sensitivity"] * 0.05
    )
    level = level_for_score(score)
    reason = f"{level.title()} severity based on affected population, urgency, safety risk, service disruption and vulnerability signals."
    return {"level": level, "score": int(score), "reason": reason, "signals": factors}

