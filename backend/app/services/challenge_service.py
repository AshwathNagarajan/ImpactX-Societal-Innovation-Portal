from typing import Any, Dict, Optional

from pymongo import DESCENDING, ReturnDocument

from app.core.database import get_database
from app.schemas.challenge import ChallengeCreate
from app.utils.helpers import normalize_status, utc_now
from app.utils.mongo import not_found
from app.utils.serializers import serialize_document
from app.services.notification_service import create_notification


URGENCY_BASE = {"LOW": 20, "MEDIUM": 45, "HIGH": 68, "CRITICAL": 85}
ESSENTIAL_CATEGORIES = {
    "HEALTHCARE": 10,
    "WATER & SANITATION": 10,
    "DISASTER MANAGEMENT": 12,
    "AGRICULTURE": 8,
    "ACCESSIBILITY": 8,
    "ENVIRONMENT": 7,
}


def calculate_priority_score(challenge: Dict[str, Any]) -> int:
    urgency = str(challenge.get("urgency", "MEDIUM")).upper()
    score = URGENCY_BASE.get(urgency, 45)
    affected = int(challenge.get("people_affected") or 0)
    if affected >= 10000:
        score += 12
    elif affected >= 3000:
        score += 8
    elif affected >= 500:
        score += 5
    score += ESSENTIAL_CATEGORIES.get(str(challenge.get("category", "")).upper(), 0)
    text = f"{challenge.get('title', '')} {challenge.get('description', '')}".lower()
    if any(word in text for word in ["death", "unsafe", "flood", "disease", "contamination", "emergency"]):
        score += 8
    return min(100, max(0, score))


def priority_level(score: int) -> str:
    if score >= 80:
        return "CRITICAL"
    if score >= 60:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"


async def generate_challenge_id() -> str:
    database = get_database()
    count = await database.challenges.count_documents({})
    return f"IMPX-2026-{count + 1:04d}"


async def create_challenge(payload: ChallengeCreate) -> dict:
    now = utc_now()
    document = payload.model_dump()
    score = calculate_priority_score(document)
    priority = priority_level(score)
    document.update(
        {
            "challenge_id": await generate_challenge_id(),
            "status": "UNDER_REVIEW" if priority == "CRITICAL" else "AI_VALIDATION",
            "priority": priority,
            "validation_mode": "ADMIN" if priority == "CRITICAL" else "AI",
            "validation_status": "PENDING",
            "ai_analysis": {},
            "matched_institutes": [],
            "assigned_institute_id": None,
            "industry_partners": [],
            "created_at": now,
            "updated_at": now,
        }
    )
    await get_database().challenges.insert_one(document)
    await link_attachment_records(document)
    if priority == "CRITICAL":
        await create_notification("Critical challenge requires validation", document["title"], role="ADMIN", entity_type="challenge", entity_id=document["challenge_id"])
        return serialize_document(document)
    return await ai_validate_challenge(document["challenge_id"])


async def link_attachment_records(document: dict) -> None:
    evidence_ids = [item.get("evidence_id") for item in document.get("attachments", []) if item.get("evidence_id")]
    if evidence_ids:
        await get_database().evidence.update_many(
            {"evidence_id": {"$in": evidence_ids}},
            {"$set": {"entity_type": "challenge_submission", "entity_id": document["challenge_id"], "linked_at": utc_now()}},
        )


async def ai_validate_challenge(challenge_id: str) -> dict:
    database = get_database()
    try:
        from app.services.ai_service import analyze_and_store

        analysis = await analyze_and_store(challenge_id)
        priority = analysis.get("priority", {})
        severity = analysis.get("severity", {})
        is_critical = priority.get("level") == "CRITICAL" or severity.get("level") == "CRITICAL"
        status = "UNDER_REVIEW" if is_critical else "VALIDATED"
        validation_status = "ADMIN_REVIEW_REQUIRED" if is_critical else "AI_APPROVED"
        await database.challenges.update_one(
            {"challenge_id": challenge_id},
            {
                "$set": {
                    "status": status,
                    "validation_mode": "ADMIN" if is_critical else "AI",
                    "validation_status": validation_status,
                    "ai_validation": {
                        "approved": not is_critical,
                        "reason": "Critical AI severity/priority requires admin validation." if is_critical else "AI validated this non-critical challenge for institute matching.",
                        "validated_at": utc_now(),
                        "analysis_source": analysis.get("audit", {}).get("generation_source"),
                    },
                    "updated_at": utc_now(),
                }
            },
        )
        updated = await database.challenges.find_one({"challenge_id": challenge_id})
        if is_critical:
            await create_notification("Critical challenge requires admin validation", updated["title"], role="ADMIN", entity_type="challenge", entity_id=challenge_id)
        else:
            await create_notification("AI-approved challenge ready for institutes", updated["title"], role="INSTITUTE", entity_type="challenge", entity_id=challenge_id)
        return serialize_document(updated)
    except Exception:
        await database.challenges.update_one(
            {"challenge_id": challenge_id},
            {
                "$set": {
                    "status": "UNDER_REVIEW",
                    "validation_mode": "ADMIN",
                    "validation_status": "AI_VALIDATION_FAILED",
                    "updated_at": utc_now(),
                }
            },
        )
        updated = await database.challenges.find_one({"challenge_id": challenge_id})
        await create_notification("Challenge needs admin validation", updated["title"], role="ADMIN", entity_type="challenge", entity_id=challenge_id)
        return serialize_document(updated)


async def list_challenges(filters: Dict[str, Any], page: int = 1, limit: int = 20) -> dict:
    query: Dict[str, Any] = {}
    for key in ["category", "district", "priority", "status"]:
        if filters.get(key):
            query[key] = normalize_status(filters[key]) if key in {"priority", "status"} else filters[key]
    if filters.get("search"):
        query["$or"] = [
            {"title": {"$regex": filters["search"], "$options": "i"}},
            {"description": {"$regex": filters["search"], "$options": "i"}},
            {"category": {"$regex": filters["search"], "$options": "i"}},
            {"district": {"$regex": filters["search"], "$options": "i"}},
        ]

    database = get_database()
    skip = max(0, page - 1) * limit
    cursor = database.challenges.find(query).sort("created_at", DESCENDING).skip(skip).limit(limit)
    items = [serialize_document(item) async for item in cursor]
    total = await database.challenges.count_documents(query)
    return {"success": True, "total": total, "page": page, "limit": limit, "items": items}


async def get_challenge_by_id(challenge_id: str) -> dict:
    item = await get_database().challenges.find_one({"challenge_id": challenge_id})
    if not item:
        not_found("Challenge not found")
    return serialize_document(item)


async def update_challenge(challenge_id: str, updates: Dict[str, Any]) -> dict:
    allowed = {
        "title",
        "description",
        "category",
        "subcategory",
        "district",
        "city_or_village",
        "location",
        "urgency",
        "people_affected",
        "existing_attempts",
        "expected_impact",
        "attachments",
        "status",
        "priority",
        "ai_analysis",
        "matched_institutes",
        "assigned_institute_id",
        "industry_partners",
        "validation_mode",
        "validation_status",
        "ai_validation",
    }
    updates = {key: value for key, value in updates.items() if key in allowed}
    updates["updated_at"] = utc_now()
    result = await get_database().challenges.find_one_and_update(
        {"challenge_id": challenge_id},
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        not_found("Challenge not found")
    return serialize_document(result)


async def pending_challenges() -> list[dict]:
    cursor = get_database().challenges.find({"status": {"$in": ["SUBMITTED", "UNDER_REVIEW"]}}).sort("created_at", DESCENDING)
    return [serialize_document(item) async for item in cursor]


async def approve_challenge(challenge_id: str) -> dict:
    item = await update_challenge(challenge_id, {"status": "VALIDATED"})
    await create_notification("Challenge validated", item["title"], role="INSTITUTE", entity_type="challenge", entity_id=challenge_id)
    return item


async def reject_challenge(challenge_id: str) -> dict:
    return await update_challenge(challenge_id, {"status": "REJECTED"})


async def set_priority(challenge_id: str, priority: str) -> dict:
    return await update_challenge(challenge_id, {"priority": normalize_status(priority)})


async def assign_institute(challenge_id: str, institute_id: str) -> dict:
    return await update_challenge(challenge_id, {"assigned_institute_id": institute_id, "status": "ASSIGNED"})


async def delete_challenge(challenge_id: str) -> dict:
    database = get_database()
    project = await database.projects.find_one({"challenge_id": challenge_id})
    if project:
        from fastapi import HTTPException

        raise HTTPException(status_code=409, detail="Challenge has linked projects and cannot be deleted.")
    result = await database.challenges.delete_one({"challenge_id": challenge_id})
    if result.deleted_count == 0:
        not_found("Challenge not found")
    return {"challenge_id": challenge_id, "deleted": True}
