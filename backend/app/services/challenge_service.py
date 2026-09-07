import asyncio
import re
from difflib import SequenceMatcher
from typing import Any, Dict, Optional

from pymongo import DESCENDING, ReturnDocument
from bson import ObjectId

from app.core.database import get_database
from app.schemas.challenge import ChallengeCreate
from app.utils.helpers import normalize_status, utc_now
from app.utils.mongo import not_found
from app.utils.serializers import serialize_document
from app.services.audit_service import record_event
from app.services.intake_classifier import classify_intake
from app.services.notification_service import create_notification
from app.services.otp_service import assert_verified_mobile
from app.services.sms_service import send_sms


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
    submitted_by = document.get("submitted_by") or {}
    await assert_verified_mobile(submitted_by.get("phone", ""), submitted_by.get("verification_id", ""))
    score = calculate_priority_score(document)
    priority = priority_level(score)
    document.update(
        {
            "challenge_id": await generate_challenge_id(),
            "status": "AI_SCREENING",
            "priority": priority,
            "validation_mode": "AI",
            "validation_status": "PENDING",
            "ai_analysis": {},
            "matched_institutes": [],
            "assigned_institute_id": None,
            "industry_partners": [],
            "created_at": now,
            "updated_at": now,
        }
    )
    document["submitted_by"]["mobile_verified"] = True
    await get_database().challenges.insert_one(document)
    await record_event("CHALLENGE_SUBMITTED", None, "challenge", document["challenge_id"], {"title": document["title"], "priority": priority})
    await link_attachment_records(document)
    return await ai_validate_challenge(document["challenge_id"])


async def link_attachment_records(document: dict) -> None:
    evidence_ids = [item.get("evidence_id") for item in document.get("attachments", []) if item.get("evidence_id")]
    if evidence_ids:
        await get_database().evidence.update_many(
            {"evidence_id": {"$in": evidence_ids}},
            {"$set": {"entity_type": "challenge_submission", "entity_id": document["challenge_id"], "linked_at": utc_now()}},
        )


async def ai_validate_challenge(challenge_id: str, deep_analysis: bool = False) -> dict:
    database = get_database()
    try:
        challenge = await database.challenges.find_one({"challenge_id": challenge_id})
        if deep_analysis:
            from app.services.ai_service import analyze_and_store

            analysis = await asyncio.wait_for(analyze_and_store(challenge_id), timeout=18)
            challenge = await database.challenges.find_one({"challenge_id": challenge_id})
        else:
            analysis = {
                "audit": {"generation_source": "instant_intake_classifier"},
                "summary": "Instant AI intake classification completed. Deep RAG analysis can be run from review when needed.",
                "required_expertise": [],
                "recommended_institutes": [],
            }
            duplicate_signal = await find_duplicate_signal(challenge)
            analysis.update(duplicate_signal)
            await database.challenges.update_one(
                {"challenge_id": challenge_id},
                {"$set": {"ai_analysis": analysis, "ai_status": "INTAKE_CLASSIFIED", "updated_at": utc_now()}},
            )
        intake = classify_intake(challenge, analysis)
        status = intake["status"]
        validation_status = intake["classification"]
        await database.challenges.update_one(
            {"challenge_id": challenge_id},
            {
                "$set": {
                    "status": status,
                    "validation_mode": "AI",
                    "validation_status": validation_status,
                    "ai_validation": {
                        "approved": intake["approved"],
                        "classification": intake["classification"],
                        "reason": intake["reason"],
                        "validated_at": utc_now(),
                        "analysis_source": analysis.get("audit", {}).get("generation_source"),
                    },
                    "updated_at": utc_now(),
                }
            },
        )
        updated = await database.challenges.find_one({"challenge_id": challenge_id})
        await record_event(
            "CHALLENGE_AI_CLASSIFIED",
            None,
            "challenge",
            challenge_id,
            {"status": status, "classification": validation_status, "source": analysis.get("audit", {}).get("generation_source")},
        )
        if intake["approved"]:
            await create_notification("AI-approved challenge ready for institutes", updated["title"], role="INSTITUTE", entity_type="challenge", entity_id=challenge_id)
        else:
            await create_notification("Challenge intake classified by AI", f"{updated['title']} was classified as {validation_status.replace('_', ' ').title()}.", role="ADMIN", entity_type="challenge", entity_id=challenge_id)
        submitter = updated.get("submitted_by") or {}
        if submitter.get("notification_consent") and submitter.get("phone"):
            await send_sms(submitter["phone"], f"IMPACTX update: {challenge_id} is classified as {validation_status.replace('_', ' ').title()}.")
        return serialize_document(updated)
    except Exception:
        challenge = await database.challenges.find_one({"challenge_id": challenge_id})
        if challenge:
            intake = classify_intake(challenge, {})
            await database.challenges.update_one(
                {"challenge_id": challenge_id},
                {
                    "$set": {
                        "status": intake["status"],
                        "validation_mode": "AI",
                        "validation_status": intake["classification"],
                        "ai_validation": {
                            "approved": intake["approved"],
                            "classification": intake["classification"],
                            "reason": f"{intake['reason']} Full AI analysis timed out, so IMPACTX used deterministic intake rules.",
                            "validated_at": utc_now(),
                            "analysis_source": "timeout_fallback",
                        },
                        "updated_at": utc_now(),
                    }
                },
            )
            updated = await database.challenges.find_one({"challenge_id": challenge_id})
            await record_event("CHALLENGE_AI_CLASSIFIED", None, "challenge", challenge_id, {"status": intake["status"], "classification": intake["classification"], "source": "timeout_fallback"})
            if intake["approved"]:
                await create_notification("AI-approved challenge ready for institutes", updated["title"], role="INSTITUTE", entity_type="challenge", entity_id=challenge_id)
            else:
                await create_notification("Challenge intake classified by AI", f"{updated['title']} was classified as {intake['classification'].replace('_', ' ').title()}.", role="ADMIN", entity_type="challenge", entity_id=challenge_id)
            submitter = updated.get("submitted_by") or {}
            if submitter.get("notification_consent") and submitter.get("phone"):
                await send_sms(submitter["phone"], f"IMPACTX update: {challenge_id} is classified as {intake['classification'].replace('_', ' ').title()}.")
            return serialize_document(updated)
        await database.challenges.update_one(
            {"challenge_id": challenge_id},
            {
                "$set": {
                    "status": "INFO_REQUIRED",
                    "validation_mode": "AI",
                    "validation_status": "AI_VALIDATION_FAILED",
                    "updated_at": utc_now(),
                }
            },
        )
        updated = await database.challenges.find_one({"challenge_id": challenge_id})
        await record_event("CHALLENGE_AI_VALIDATION_FAILED", None, "challenge", challenge_id, {"status": "INFO_REQUIRED"})
        await create_notification("Challenge needs more information", updated["title"], role="ADMIN", entity_type="challenge", entity_id=challenge_id)
    return serialize_document(updated)


def normalize_duplicate_text(value: str) -> str:
    return re.sub(r"[^a-z0-9 ]+", " ", (value or "").lower()).strip()


async def find_duplicate_signal(challenge: dict) -> dict:
    database = get_database()
    base = normalize_duplicate_text(f"{challenge.get('title', '')} {challenge.get('district', '')}")
    if not base:
        return {"duplicate_probability": 0, "possible_duplicates": []}
    cursor = database.challenges.find(
        {"challenge_id": {"$ne": challenge.get("challenge_id")}},
        {"challenge_id": 1, "title": 1, "district": 1, "status": 1},
    ).sort("created_at", DESCENDING).limit(100)
    best: list[dict] = []
    async for item in cursor:
        candidate = normalize_duplicate_text(f"{item.get('title', '')} {item.get('district', '')}")
        score = SequenceMatcher(None, base, candidate).ratio() if candidate else 0
        if score >= 0.86:
            best.append(
                {
                    "challenge_id": item.get("challenge_id"),
                    "title": item.get("title"),
                    "district": item.get("district"),
                    "status": item.get("status"),
                    "similarity": round(score, 3),
                }
            )
    best.sort(key=lambda item: item["similarity"], reverse=True)
    return {"duplicate_probability": best[0]["similarity"] if best else 0, "possible_duplicates": best[:5]}


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
    cursor = get_database().challenges.find({"status": {"$in": ["SERVICE_REQUEST", "DUPLICATE", "QUARANTINED", "INFO_REQUIRED"]}}).sort("created_at", DESCENDING)
    return [serialize_document(item) async for item in cursor]


async def approve_challenge(challenge_id: str) -> dict:
    item = await update_challenge(challenge_id, {"status": "VALIDATED"})
    await record_event("CHALLENGE_APPROVED", None, "challenge", challenge_id, {"title": item.get("title")})
    await create_notification("Challenge validated", item["title"], role="INSTITUTE", entity_type="challenge", entity_id=challenge_id)
    return item


async def reject_challenge(challenge_id: str) -> dict:
    item = await update_challenge(challenge_id, {"status": "REJECTED"})
    await record_event("CHALLENGE_REJECTED", None, "challenge", challenge_id, {"title": item.get("title")})
    return item


async def set_priority(challenge_id: str, priority: str) -> dict:
    return await update_challenge(challenge_id, {"priority": normalize_status(priority)})


async def assign_institute(challenge_id: str, institute_id: str) -> dict:
    item = await update_challenge(challenge_id, {"assigned_institute_id": institute_id, "status": "ASSIGNED"})
    await record_event("CHALLENGE_ASSIGNED", None, "challenge", challenge_id, {"institute_id": institute_id})
    return item


async def assignment_requests() -> list[dict]:
    database = get_database()
    requests = [item async for item in database.assignment_requests.find({"status": "REQUESTED"}).sort("created_at", DESCENDING)]
    challenge_ids = [item.get("challenge_id") for item in requests]
    challenges = {
        item.get("challenge_id"): serialize_document(item)
        async for item in database.challenges.find({"challenge_id": {"$in": challenge_ids}})
    }
    items = []
    for request in requests:
        document = serialize_document(request)
        document["challenge"] = challenges.get(request.get("challenge_id"), {})
        items.append(document)
    return items


async def approve_assignment_request(request_id: str) -> dict:
    from bson import ObjectId

    database = get_database()
    query = {"_id": ObjectId(request_id)} if ObjectId.is_valid(request_id) else {"id": request_id}
    request = await database.assignment_requests.find_one(query)
    if not request:
        not_found("Assignment request not found")
    if request.get("status") != "REQUESTED":
        return serialize_document(request)
    institute_id = request.get("institute_id") or request.get("institute_user_id")
    challenge_id = request.get("challenge_id")
    if not institute_id or not challenge_id:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Assignment request is missing institute or challenge details.")
    assigned = await assign_institute(challenge_id, str(institute_id))
    await database.assignment_requests.update_one(
        {"_id": request["_id"]},
        {"$set": {"status": "APPROVED", "approved_at": utc_now(), "updated_at": utc_now()}},
    )
    await create_notification(
        "Assignment approved",
        f"{assigned.get('title', challenge_id)} is assigned to your institute.",
        role="INSTITUTE",
        entity_type="challenge",
        entity_id=challenge_id,
    )
    return assigned


async def update_assignment_request(request_id: str, status: str, comment: str = "", actor: dict | None = None) -> dict:
    from bson import ObjectId

    database = get_database()
    normalized = normalize_status(status)
    if normalized not in {"REJECTED", "ON_HOLD", "REQUESTED"}:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Assignment request status must be rejected, on hold, or requested.")
    query = {"_id": ObjectId(request_id)} if ObjectId.is_valid(request_id) else {"id": request_id}
    result = await database.assignment_requests.find_one_and_update(
        query,
        {"$set": {"status": normalized, "comment": comment, "updated_at": utc_now()}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        not_found("Assignment request not found")
    await record_event("ASSIGNMENT_REQUEST_UPDATED", actor, "challenge", result.get("challenge_id", ""), {"status": normalized, "comment": comment})
    await create_notification(
        "Assignment request updated",
        comment or f"Your assignment request is now {normalized.replace('_', ' ').title()}.",
        role="INSTITUTE",
        entity_type="challenge",
        entity_id=result.get("challenge_id", ""),
    )
    return serialize_document(result)


async def list_proposals(status: str | None = None) -> list[dict]:
    database = get_database()
    query = {}
    if status:
        query["status"] = normalize_status(status)
    proposals = [item async for item in database.proposals.find(query).sort("created_at", DESCENDING)]
    challenge_ids = [item.get("challenge_id") for item in proposals]
    challenges = {
        item.get("challenge_id"): serialize_document(item)
        async for item in database.challenges.find({"challenge_id": {"$in": challenge_ids}})
    }
    for proposal in proposals:
        proposal["challenge"] = challenges.get(proposal.get("challenge_id"), {})
    return [serialize_document(item) for item in proposals]


async def update_proposal_status(proposal_id: str, status: str, comment: str = "", actor: dict | None = None) -> dict:
    from bson import ObjectId

    database = get_database()
    normalized = normalize_status(status)
    if normalized not in {"APPROVED", "REJECTED", "CHANGES_REQUESTED"}:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Proposal status must be approved, rejected, or changes requested.")
    query = {"_id": ObjectId(proposal_id)} if ObjectId.is_valid(proposal_id) else {"id": proposal_id}
    result = await database.proposals.find_one_and_update(
        query,
        {"$set": {"status": normalized, "review_comment": comment, "reviewed_at": utc_now(), "updated_at": utc_now()}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        not_found("Proposal not found")
    if normalized == "APPROVED":
        await database.projects.update_one(
            {"challenge_id": result.get("challenge_id"), "institute_id": result.get("institute_id")},
            {"$set": {"proposal_status": "APPROVED", "status": "RESEARCH", "updated_at": utc_now()}},
        )
    await record_event("PROPOSAL_STATUS_UPDATED", actor, "challenge", result.get("challenge_id", ""), {"proposal_id": str(result.get("_id")), "status": normalized, "comment": comment})
    await create_notification(
        "Proposal review updated",
        comment or f"Proposal status changed to {normalized.replace('_', ' ').title()}.",
        role="INSTITUTE",
        entity_type="challenge",
        entity_id=result.get("challenge_id", ""),
    )
    return serialize_document(result)


async def list_support_offers(status: str | None = None) -> list[dict]:
    database = get_database()
    query = {}
    if status:
        query["status"] = normalize_status(status)
    offers = [item async for item in database.partnerships.find(query).sort("created_at", DESCENDING)]
    project_ids = [item.get("project_id") for item in offers]
    projects = {
        item.get("project_id"): serialize_document(item)
        async for item in database.projects.find({"project_id": {"$in": project_ids}})
    }
    for offer in offers:
        offer["project"] = projects.get(offer.get("project_id"), {})
    return [serialize_document(item) for item in offers]


async def update_support_offer_status(offer_id: str, status: str, comment: str = "", actor: dict | None = None) -> dict:
    from bson import ObjectId

    database = get_database()
    normalized = normalize_status(status)
    if normalized not in {"ACTIVE", "REJECTED", "CHANGES_REQUESTED"}:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Support status must be active, rejected, or changes requested.")
    query = {"_id": ObjectId(offer_id)} if ObjectId.is_valid(offer_id) else {"id": offer_id}
    existing = await database.partnerships.find_one(query)
    if not existing:
        not_found("Support offer not found")
    result = await database.partnerships.find_one_and_update(
        query,
        {"$set": {"status": normalized, "review_comment": comment, "reviewed_at": utc_now(), "updated_at": utc_now()}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        not_found("Support offer not found")
    if normalized == "ACTIVE" and existing.get("status") != "ACTIVE" and result.get("funding_amount"):
        await database.projects.update_one(
            {"project_id": result.get("project_id")},
            {"$inc": {"funding_amount": int(result.get("funding_amount") or 0)}, "$set": {"updated_at": utc_now()}},
        )
    await record_event("SUPPORT_OFFER_STATUS_UPDATED", actor, "project", result.get("project_id", ""), {"status": normalized, "comment": comment})
    await create_notification(
        "Support offer updated",
        comment or f"Industry support status changed to {normalized.replace('_', ' ').title()}.",
        role="INDUSTRY",
        entity_type="project",
        entity_id=result.get("project_id", ""),
    )
    return serialize_document(result)


async def list_joint_proposals(status: str | None = None) -> list[dict]:
    database = get_database()
    query = {}
    if status:
        query["status"] = normalize_status(status)
    joints = [item async for item in database.joint_proposals.find(query).sort("created_at", DESCENDING)]
    challenge_ids = [item.get("challenge_id") for item in joints]
    proposal_ids = [item.get("proposal_id") for item in joints]
    offer_ids = [item.get("offer_id") for item in joints]
    challenges = {
        item.get("challenge_id"): serialize_document(item)
        async for item in database.challenges.find({"challenge_id": {"$in": challenge_ids}})
    }
    proposals = {
        str(item.get("_id")): serialize_document(item)
        async for item in database.proposals.find({"_id": {"$in": [ObjectId(value) for value in proposal_ids if ObjectId.is_valid(str(value))]}})
    }
    offers = {
        str(item.get("_id")): serialize_document(item)
        async for item in database.proposal_offers.find({"_id": {"$in": [ObjectId(value) for value in offer_ids if ObjectId.is_valid(str(value))]}})
    }
    for joint in joints:
        joint["challenge"] = challenges.get(joint.get("challenge_id"), {})
        joint["proposal"] = proposals.get(joint.get("proposal_id"), {})
        joint["offer"] = offers.get(joint.get("offer_id"), {})
    return [serialize_document(item) for item in joints]


async def update_joint_proposal_status(joint_id: str, status: str, comment: str = "", actor: dict | None = None) -> dict:
    from bson import ObjectId
    from fastapi import HTTPException

    database = get_database()
    normalized = normalize_status(status)
    if normalized not in {"GOV_APPROVED", "REJECTED", "CHANGES_REQUESTED"}:
        raise HTTPException(status_code=400, detail="Joint proposal status must be gov approved, rejected, or changes requested.")
    query = {"_id": ObjectId(joint_id)} if ObjectId.is_valid(joint_id) else {"id": joint_id}
    joint = await database.joint_proposals.find_one(query)
    if not joint:
        not_found("Joint proposal not found")
    now = utc_now()
    result = await database.joint_proposals.find_one_and_update(
        query,
        {"$set": {"status": normalized, "review_comment": comment, "reviewed_at": now, "updated_at": now}},
        return_document=ReturnDocument.AFTER,
    )
    if normalized == "GOV_APPROVED":
        await database.tie_ups.update_one({"_id": ObjectId(joint.get("tie_up_id"))}, {"$set": {"status": "GOV_APPROVED", "updated_at": now}}) if ObjectId.is_valid(str(joint.get("tie_up_id"))) else None
        await database.proposals.update_one({"_id": ObjectId(joint.get("proposal_id"))}, {"$set": {"status": "GOV_APPROVED", "updated_at": now}}) if ObjectId.is_valid(str(joint.get("proposal_id"))) else None
        await database.proposal_offers.update_one({"_id": ObjectId(joint.get("offer_id"))}, {"$set": {"status": "GOV_APPROVED", "updated_at": now}}) if ObjectId.is_valid(str(joint.get("offer_id"))) else None
        await database.challenges.update_one(
            {"challenge_id": joint.get("challenge_id")},
            {"$set": {"status": "IN_DEVELOPMENT", "assigned_institute_id": joint.get("institute_id"), "updated_at": now}},
        )
        await database.joint_proposals.update_many(
            {"challenge_id": joint.get("challenge_id"), "_id": {"$ne": result["_id"]}, "status": "GOV_REVIEW"},
            {"$set": {"status": "LOCKED_OUT", "updated_at": now}},
        )
        existing_project = await database.projects.find_one({"challenge_id": joint.get("challenge_id"), "institute_id": joint.get("institute_id")})
        if existing_project:
            await database.projects.update_one(
                {"_id": existing_project["_id"]},
                {"$set": {"status": "RESEARCH", "proposal_status": "GOV_APPROVED", "funding_amount": int(joint.get("budget") or 0), "industry_ids": [joint.get("industry_user_id")], "updated_at": now}},
            )
        else:
            await database.projects.insert_one(
                {
                    "project_id": f"PRJ-{joint.get('challenge_id')}",
                    "challenge_id": joint.get("challenge_id"),
                    "institute_id": joint.get("institute_id"),
                    "title": f"{joint.get('challenge_id')} Joint Implementation",
                    "status": "RESEARCH",
                    "proposal_status": "GOV_APPROVED",
                    "proposal": joint.get("proposal", {}),
                    "industry_ids": [joint.get("industry_user_id")],
                    "funding_amount": int(joint.get("budget") or 0),
                    "created_at": now,
                    "updated_at": now,
                }
            )
    await record_event("JOINT_PROPOSAL_STATUS_UPDATED", actor, "challenge", result.get("challenge_id", ""), {"status": normalized, "comment": comment})
    await create_notification("Joint proposal review updated", comment or f"Government review is {normalized.replace('_', ' ').title()}.", role="INSTITUTE", entity_type="challenge", entity_id=result.get("challenge_id", ""))
    await create_notification("Joint proposal review updated", comment or f"Government review is {normalized.replace('_', ' ').title()}.", role="INDUSTRY", entity_type="challenge", entity_id=result.get("challenge_id", ""))
    return serialize_document(result)


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
