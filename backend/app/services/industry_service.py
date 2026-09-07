from bson import ObjectId

from app.ai.matching.industry_matcher import recommend_industries_for_project
from app.core.database import get_database
from app.schemas.industry import PartnershipCreate, ProjectSupportRequest, ProposalOfferCreate
from app.utils.helpers import utc_now
from app.utils.serializers import serialize_document
from app.services.audit_service import record_event


async def dashboard(user: dict) -> dict:
    database = get_database()
    return {
        "projects_supported": await database.partnerships.count_documents({"created_by": user["id"]}),
        "active_partnerships": await database.partnerships.count_documents({"created_by": user["id"], "status": "ACTIVE"}),
        "user": user,
    }


async def recommended_projects() -> list[dict]:
    database = get_database()
    proposals = [item async for item in database.proposals.find({"status": "SUBMITTED", "need_industry_support": True}).limit(50)]
    challenge_ids = [item.get("challenge_id") for item in proposals]
    challenges = {
        item.get("challenge_id"): serialize_document(item)
        async for item in database.challenges.find({"challenge_id": {"$in": challenge_ids}})
    }
    for proposal in proposals:
        proposal["challenge"] = challenges.get(proposal.get("challenge_id"), {})
    return [serialize_document(item) for item in proposals]


async def ai_recommendations(user: dict) -> list[dict]:
    database = get_database()
    industry = await database.industries.find_one({"name": {"$regex": user.get("name", ""), "$options": "i"}})
    if not industry:
        industry = await database.industries.find_one({})
    projects = [item async for item in database.projects.find({"status": {"$in": ["PLANNING", "ASSIGNED", "RESEARCH", "SOLUTION_DESIGN", "PROTOTYPE", "TESTING", "PILOT"]}}).limit(50)]
    ranked = []
    for project in projects:
        challenge = await database.challenges.find_one({"challenge_id": project.get("challenge_id")})
        if industry:
            match = (await recommend_industries_for_project(project, [industry], challenge))[0]
        else:
            match = {"match_score": 70, "recommended_support": ["Mentorship"], "reason": "Project is ready for partner review."}
        document = serialize_document(project)
        document["challenge"] = serialize_document(challenge) if challenge else {}
        document["ai_match"] = match["match_score"]
        document["recommended_support"] = match.get("recommended_support", [])
        document["why_recommended"] = match.get("reason", "")
        ranked.append(document)
    return sorted(ranked, key=lambda item: item.get("ai_match", 0), reverse=True)[:10]


async def offer_on_proposal(payload: ProposalOfferCreate, user: dict) -> dict:
    database = get_database()
    proposal = await database.proposals.find_one({"_id": ObjectId(payload.proposal_id)} if ObjectId.is_valid(payload.proposal_id) else {"id": payload.proposal_id})
    if not proposal:
        from app.utils.mongo import not_found

        not_found("Proposal not found")
    existing_selected = await database.proposal_offers.find_one({"challenge_id": proposal.get("challenge_id"), "industry_user_id": user["id"], "status": "ACCEPTED"})
    if existing_selected:
        from fastapi import HTTPException

        raise HTTPException(status_code=409, detail="This industry is already tied up for this challenge.")
    now = utc_now()
    document = payload.model_dump()
    document.update(
        {
            "proposal_id": str(proposal["_id"]),
            "challenge_id": proposal.get("challenge_id"),
            "institute_id": proposal.get("institute_id"),
            "industry_user_id": user["id"],
            "industry_name": user.get("name") or "Industry Partner",
            "status": "OFFERED",
            "created_at": now,
            "updated_at": now,
        }
    )
    await database.proposal_offers.update_one(
        {"proposal_id": document["proposal_id"], "industry_user_id": user["id"], "status": {"$in": ["OFFERED", "ACCEPTED"]}},
        {"$set": document},
        upsert=True,
    )
    saved = await database.proposal_offers.find_one({"proposal_id": document["proposal_id"], "industry_user_id": user["id"], "status": document["status"]})
    await record_event("INDUSTRY_PROPOSAL_OFFERED", user, "challenge", proposal.get("challenge_id", ""), {"proposal_id": document["proposal_id"], "support_type": payload.support_type})
    return serialize_document(saved or document)


async def create_partnership(payload: PartnershipCreate, user: dict) -> dict:
    now = utc_now()
    document = payload.model_dump()
    document.update({"created_by": user["id"], "status": "PENDING_REVIEW", "created_at": now, "updated_at": now})
    await get_database().partnerships.insert_one(document)
    await record_event("SUPPORT_OFFER_SUBMITTED", user, "project", payload.project_id, {"support_type": payload.support_type})
    return serialize_document(document)


async def support_project(project_id: str, payload: ProjectSupportRequest, user: dict) -> dict:
    database = get_database()
    project = await database.projects.find_one({"project_id": project_id})
    if not project:
        from app.utils.mongo import not_found

        not_found("Project not found")
    now = utc_now()
    support = payload.model_dump()
    support.update({"project_id": project_id, "created_by": user["id"], "status": "PENDING_REVIEW", "created_at": now, "updated_at": now})
    await database.partnerships.update_one(
        {"project_id": project_id, "created_by": user["id"], "status": {"$in": ["PENDING_REVIEW", "ACTIVE"]}},
        {"$set": support},
        upsert=True,
    )
    updates = {
        "$addToSet": {
            "industry_ids": user["id"],
            "support_records": {
                "industry_id": user["id"],
                "support_type": payload.support_type,
                "contribution": payload.contribution,
                "funding_amount": payload.funding_amount,
                "created_at": now,
            },
        },
        "$set": {"updated_at": now},
    }
    await database.projects.update_one(
        {"project_id": project_id},
        updates,
    )
    await record_event("SUPPORT_OFFER_SUBMITTED", user, "project", project_id, {"support_type": payload.support_type, "funding_amount": payload.funding_amount})
    return {"success": True, "message": "Industry support submitted for review."}


async def update_partnership(partnership_id: str, payload: dict, user: dict) -> dict:
    from bson import ObjectId
    from pymongo import ReturnDocument
    from app.utils.mongo import not_found

    allowed = {"support_type", "contribution", "mentor_name", "timeline", "notes", "status"}
    updates = {key: value for key, value in payload.items() if key in allowed}
    updates["updated_at"] = utc_now()
    updates["updated_by"] = user["id"]
    query = {"_id": ObjectId(partnership_id)} if ObjectId.is_valid(partnership_id) else {"partnership_id": partnership_id}
    result = await get_database().partnerships.find_one_and_update(query, {"$set": updates}, return_document=ReturnDocument.AFTER)
    if not result:
        not_found("Partnership not found")
    return serialize_document(result)
