from collections import Counter, defaultdict
from datetime import datetime
from typing import Any

from app.core.database import get_database
from app.utils.serializers import serialize_document


CATEGORIES = ["Agriculture", "Healthcare", "Education", "Water & Sanitation", "Environment", "Infrastructure", "Accessibility", "Livelihood", "Disaster Management"]
DISTRICTS = ["Ranchi", "East Singhbhum", "Sahibganj", "Dumka", "Dhanbad", "Bokaro", "Hazaribagh", "Palamu", "Deoghar", "Giridih", "Lohardaga", "Gumla", "West Singhbhum"]
STATUSES = ["Submitted", "Under Review", "Validated", "Assigned", "In Development", "Pilot Testing", "Implemented"]
PRIORITIES = ["Low", "Medium", "High", "Critical"]
SUPPORT_TYPES = ["Funding", "Technical Mentorship", "Equipment", "API / Cloud Credits", "Prototype Support", "Pilot Deployment", "Manufacturing", "Market Access"]


def display_status(value: str | None) -> str:
    mapping = {
        "SUBMITTED": "Submitted",
        "UNDER_REVIEW": "Under Review",
        "VALIDATED": "Validated",
        "ASSIGNED": "Assigned",
        "IN_DEVELOPMENT": "In Development",
        "DEVELOPMENT": "In Development",
        "PROTOTYPE": "In Development",
        "TESTING": "Pilot Testing",
        "PILOT": "Pilot Testing",
        "PILOT_TESTING": "Pilot Testing",
        "IMPLEMENTED": "Implemented",
        "COMPLETED": "Implemented",
        "REJECTED": "Rejected",
    }
    return mapping.get(str(value or "").upper(), str(value or "Submitted").replace("_", " ").title())


def display_priority(value: str | None) -> str:
    return str(value or "Medium").replace("_", " ").title()


def as_date(value: Any) -> str:
    if isinstance(value, datetime):
        return value.date().isoformat()
    return str(value or datetime.utcnow().date().isoformat())[:10]


def challenge_ui(item: dict) -> dict:
    doc = serialize_document(item)
    affected = int(doc.get("people_affected") or doc.get("affected") or 0)
    return {
        **doc,
        "id": doc.get("challenge_id") or doc.get("id"),
        "challenge_id": doc.get("challenge_id"),
        "title": doc.get("title", ""),
        "category": doc.get("category", ""),
        "subCategory": doc.get("subcategory", ""),
        "district": doc.get("district", ""),
        "city": doc.get("city_or_village", ""),
        "date": as_date(doc.get("created_at")),
        "status": display_status(doc.get("status")),
        "priority": display_priority(doc.get("priority") or doc.get("urgency")),
        "affected": affected,
        "people_affected": affected,
        "institutes": len(doc.get("matched_institutes") or []) or int(doc.get("institutes") or 0),
        "industries": len(doc.get("industry_partners") or []) or int(doc.get("industries") or 0),
        "submitter": f"{(doc.get('submitted_by') or {}).get('name', 'Citizen')}, {(doc.get('submitted_by') or {}).get('type', 'Citizen')}",
        "description": doc.get("description", ""),
        "progress": int(doc.get("progress") or 0),
    }


def institute_ui(item: dict) -> dict:
    doc = serialize_document(item)
    return {
        **doc,
        "name": doc.get("name", ""),
        "expertise": ", ".join(doc.get("expertise") or doc.get("departments") or []) if isinstance(doc.get("expertise"), list) else doc.get("expertise", ""),
        "score": int(doc.get("score") or 82),
        "projects": int(doc.get("projects") or len(doc.get("previous_projects") or [])),
        "availability": "High" if doc.get("availability", True) else "Medium",
    }


def industry_ui(item: dict) -> dict:
    doc = serialize_document(item)
    return {
        **doc,
        "name": doc.get("name", ""),
        "focus": doc.get("focus") or ", ".join(doc.get("csr_domains") or doc.get("expertise") or []),
        "projects": int(doc.get("projects") or len(doc.get("previous_projects") or [])),
        "support": doc.get("support") or " + ".join((doc.get("support_types") or [])[:2]),
    }


def project_ui(item: dict, institutes_by_id: dict[str, dict], challenges_by_id: dict[str, dict]) -> dict:
    doc = serialize_document(item)
    challenge = challenges_by_id.get(doc.get("challenge_id"), {})
    institute = institutes_by_id.get(str(doc.get("institute_id")), {})
    proposal = doc.get("proposal") or {}
    required_support = proposal.get("required_support") or doc.get("required_support") or ["Technical Mentorship"]
    technology = proposal.get("technology") or doc.get("technology") or ["Civic Technology"]
    return {
        **doc,
        "id": doc.get("project_id") or doc.get("id"),
        "title": doc.get("title", ""),
        "university": institute.get("name") or doc.get("university") or "Partner Institute",
        "category": challenge.get("category") or doc.get("category") or "Innovation",
        "support": required_support[0] if isinstance(required_support, list) else str(required_support),
        "technology": technology[0] if isinstance(technology, list) else str(technology),
        "impact": int(doc.get("impact") or 78),
        "progress": int(doc.get("progress") or 0),
    }


def chart_bundle(challenges: list[dict], institutes: list[dict], industries: list[dict]) -> dict:
    category_counts = Counter(item.get("category") for item in challenges)
    district_counts = Counter(item.get("district") for item in challenges)
    status_counts = Counter(display_status(item.get("status")) for item in challenges)
    month_counts = defaultdict(int)
    resolved_counts = defaultdict(int)
    for item in challenges:
        month = as_date(item.get("created_at"))[5:7]
        month_counts[month] += 1
        if display_status(item.get("status")) in {"Implemented", "Pilot Testing"}:
            resolved_counts[month] += 1
    month_names = {"01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun", "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"}
    months = sorted(month_counts.keys())[-6:] or ["03", "04", "05", "06", "07", "08"]
    return {
        "category": [{"name": name, "value": category_counts.get(name, 0)} for name in CATEGORIES],
        "monthly": [{"month": month_names.get(m, m), "submissions": month_counts.get(m, 0), "resolved": resolved_counts.get(m, 0)} for m in months],
        "status": [{"name": name, "value": status_counts.get(name, 0)} for name in STATUSES],
        "district": [{"name": name, "challenges": district_counts.get(name, 0)} for name in DISTRICTS[:8]],
        "participation": [{"name": name, "institutes": max(1, len(institutes) - i), "industries": max(1, len(industries) - i)} for i, name in enumerate(["Agriculture", "Health", "Water", "Infra", "Education"])],
        "impact": [{"sector": name, "impact": min(95, 62 + category_counts.get(name, 0) * 3)} for name in CATEGORIES[:6]],
    }


async def public_data() -> dict:
    database = get_database()
    challenges_raw = [item async for item in database.challenges.find({}).sort("created_at", -1)]
    institutes_raw = [item async for item in database.institutes.find({})]
    industries_raw = [item async for item in database.industries.find({})]
    projects_raw = [item async for item in database.projects.find({})]
    teams_raw = [serialize_document(item) async for item in database.teams.find({})]
    institutes_by_id = {str(item.get("_id")): item for item in institutes_raw}
    challenges_by_id = {item.get("challenge_id"): item for item in challenges_raw}
    challenges = [challenge_ui(item) for item in challenges_raw]
    institutes = [institute_ui(item) for item in institutes_raw]
    industries = [industry_ui(item) for item in industries_raw]
    projects = [project_ui(item, institutes_by_id, challenges_by_id) for item in projects_raw]
    implemented = sum(1 for item in challenges if item["status"] == "Implemented")
    total_affected = sum(item["affected"] for item in challenges)
    kpis = [
        ["Total Challenges", f"{len(challenges):,}", "live from MongoDB"],
        ["Validated Challenges", f"{sum(1 for item in challenges if item['status'] == 'Validated'):,}", "approved records"],
        ["Active Projects", f"{sum(1 for item in projects if item.get('progress', 0) < 100):,}", "live work"],
        ["Solutions Implemented", f"{implemented:,}", "completed outcomes"],
        ["Partner Institutes", f"{len(institutes):,}", "registered institutes"],
        ["Industry Partners", f"{len(industries):,}", "registered partners"],
        ["Districts Covered", f"{len({item['district'] for item in challenges if item['district']}):,}", "coverage"],
        ["Citizens Impacted", f"{round(total_affected / 100000, 1)}L+" if total_affected >= 100000 else f"{total_affected:,}", "estimated reach"],
    ]
    return {
        "challenges": challenges,
        "institutes": institutes,
        "industries": industries,
        "projects": projects,
        "teams": teams_raw,
        "chartData": chart_bundle(challenges_raw, institutes_raw, industries_raw),
        "kpis": kpis,
        "categories": CATEGORIES,
        "districts": DISTRICTS,
        "statuses": STATUSES,
        "priorities": PRIORITIES,
        "supportTypes": SUPPORT_TYPES,
    }
