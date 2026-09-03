from enum import StrEnum
from typing import Any


class ChallengeCategory(StrEnum):
    AGRICULTURE = "AGRICULTURE"
    HEALTHCARE = "HEALTHCARE"
    EDUCATION = "EDUCATION"
    WATER_AND_SANITATION = "WATER_AND_SANITATION"
    ENVIRONMENT = "ENVIRONMENT"
    DISASTER_MANAGEMENT = "DISASTER_MANAGEMENT"
    URBAN_INFRASTRUCTURE = "URBAN_INFRASTRUCTURE"
    RURAL_DEVELOPMENT = "RURAL_DEVELOPMENT"
    PUBLIC_SAFETY = "PUBLIC_SAFETY"
    ACCESSIBILITY = "ACCESSIBILITY"
    TRANSPORTATION = "TRANSPORTATION"
    ENERGY = "ENERGY"
    WASTE_MANAGEMENT = "WASTE_MANAGEMENT"
    LIVELIHOOD = "LIVELIHOOD"
    PUBLIC_SERVICE_DELIVERY = "PUBLIC_SERVICE_DELIVERY"
    DIGITAL_INCLUSION = "DIGITAL_INCLUSION"
    OTHER = "OTHER"


CATEGORY_KEYWORDS: dict[ChallengeCategory, tuple[str, ...]] = {
    ChallengeCategory.AGRICULTURE: ("crop", "farmer", "agriculture", "paddy", "soil", "irrigation", "disease"),
    ChallengeCategory.HEALTHCARE: ("health", "hospital", "clinic", "doctor", "patient", "medicine", "referral"),
    ChallengeCategory.EDUCATION: ("school", "student", "learning", "education", "teacher", "classroom"),
    ChallengeCategory.WATER_AND_SANITATION: ("water", "sanitation", "pipeline", "leakage", "toilet", "drinking"),
    ChallengeCategory.ENVIRONMENT: ("pollution", "environment", "waste", "air", "forest", "emission"),
    ChallengeCategory.DISASTER_MANAGEMENT: ("flood", "warning", "disaster", "river", "landslide", "cyclone", "emergency"),
    ChallengeCategory.URBAN_INFRASTRUCTURE: ("road", "traffic", "streetlight", "urban", "drainage", "infrastructure"),
    ChallengeCategory.RURAL_DEVELOPMENT: ("village", "rural", "panchayat", "livelihood", "community"),
    ChallengeCategory.PUBLIC_SAFETY: ("safety", "crime", "accident", "hazard", "violence"),
    ChallengeCategory.ACCESSIBILITY: ("disabled", "visually impaired", "accessibility", "assistive", "wheelchair"),
    ChallengeCategory.TRANSPORTATION: ("transport", "bus", "mobility", "route", "commute"),
    ChallengeCategory.ENERGY: ("electricity", "solar", "power", "energy", "grid"),
    ChallengeCategory.WASTE_MANAGEMENT: ("garbage", "segregation", "waste", "recycling", "landfill"),
    ChallengeCategory.LIVELIHOOD: ("jobs", "income", "skill", "livelihood", "employment"),
    ChallengeCategory.PUBLIC_SERVICE_DELIVERY: ("certificate", "ration", "service", "delivery", "benefit", "governance"),
    ChallengeCategory.DIGITAL_INCLUSION: ("digital", "internet", "app", "mobile", "online", "connectivity"),
}


SUBCATEGORY_HINTS = {
    "crop disease": "Crop Disease Management",
    "flood": "Flood Early Warning",
    "water": "Water Access and Monitoring",
    "waste": "Waste Segregation and Monitoring",
    "health": "Healthcare Access",
    "accessibility": "Assistive Civic Technology",
}


def normalize_category(value: str | None) -> ChallengeCategory:
    if not value:
        return ChallengeCategory.OTHER
    normalized = value.strip().upper().replace("&", "AND").replace(" ", "_").replace("-", "_")
    aliases = {
        "WATER_SANITATION": "WATER_AND_SANITATION",
        "INFRASTRUCTURE": "URBAN_INFRASTRUCTURE",
        "DISASTER": "DISASTER_MANAGEMENT",
        "WASTE": "WASTE_MANAGEMENT",
    }
    normalized = aliases.get(normalized, normalized)
    try:
        return ChallengeCategory(normalized)
    except ValueError:
        return ChallengeCategory.OTHER


def classify_category(challenge: dict[str, Any]) -> dict[str, Any]:
    text = " ".join(
        str(challenge.get(key, ""))
        for key in ["title", "description", "category", "subcategory", "expected_impact", "existing_attempts"]
    ).lower()
    selected = normalize_category(challenge.get("category"))
    scores: dict[ChallengeCategory, int] = {category: 0 for category in ChallengeCategory}
    if selected != ChallengeCategory.OTHER:
        scores[selected] += 2
    for category, keywords in CATEGORY_KEYWORDS.items():
        scores[category] += sum(1 for keyword in keywords if keyword in text)
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    primary, score = ranked[0]
    if score == 0:
        primary = selected
    secondary = [category.value for category, value in ranked[1:4] if value > 0 and category != primary]
    subcategory = challenge.get("subcategory") or next((label for keyword, label in SUBCATEGORY_HINTS.items() if keyword in text), "General Civic Innovation")
    confidence = min(0.96, max(0.55, 0.52 + (score * 0.08)))
    return {
        "primary_category": primary.value,
        "subcategory": subcategory,
        "secondary_categories": secondary,
        "category_confidence": round(confidence, 2),
    }

