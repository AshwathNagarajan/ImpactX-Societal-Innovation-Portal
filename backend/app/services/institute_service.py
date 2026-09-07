from bson import ObjectId

from app.ai.matching.institute_matcher import recommend_institutes_for_challenge
from app.core.database import get_database
from app.schemas.project import ProjectCreate
from app.schemas.institute import ProposalCreate
from app.services.project_service import create_project
from app.utils.helpers import utc_now
from app.utils.serializers import serialize_document
from app.services.audit_service import record_event


def _id_aliases(*values: str | None) -> list:
    aliases = []
    for value in values:
        if not value:
            continue
        aliases.append(value)
        if ObjectId.is_valid(str(value)):
            aliases.append(ObjectId(str(value)))
    unique = []
    for item in aliases:
        if item not in unique:
            unique.append(item)
    return unique


async def resolve_institute_for_user(user: dict) -> dict | None:
    database = get_database()
    email = user.get("email")
    if email:
        institute = await database.institutes.find_one({"email": email})
        if institute:
            return institute
    name = user.get("name")
    if name:
        institute = await database.institutes.find_one({"name": {"$regex": name, "$options": "i"}})
        if institute:
            return institute
    return await database.institutes.find_one({})


async def institute_identity(user: dict) -> dict:
    institute = await resolve_institute_for_user(user)
    org_id = str(institute.get("_id")) if institute else user["id"]
    return {
        "org": institute,
        "org_id": org_id,
        "aliases": _id_aliases(user.get("id"), org_id),
        "name": (institute or {}).get("name") or user.get("name") or "Institute",
    }


async def dashboard(user: dict) -> dict:
    database = get_database()
    identity = await institute_identity(user)
    return {
        "assigned_challenges": await database.challenges.count_documents({"status": "ASSIGNED", "assigned_institute_id": {"$in": identity["aliases"]}}),
        "active_projects": await database.projects.count_documents({"institute_id": {"$in": identity["aliases"]}, "status": {"$ne": "COMPLETED"}}),
        "completed_projects": await database.projects.count_documents({"institute_id": {"$in": identity["aliases"]}, "status": "COMPLETED"}),
        "user": user,
    }


async def assigned_challenges(user: dict) -> list[dict]:
    identity = await institute_identity(user)
    cursor = get_database().challenges.find({"status": "ASSIGNED", "assigned_institute_id": {"$in": identity["aliases"]}})
    return [serialize_document(item) async for item in cursor]


async def recommended_challenges() -> list[dict]:
    cursor = get_database().challenges.find({"status": "OPEN_FOR_INSTITUTE"}).limit(20)
    return [serialize_document(item) async for item in cursor]


async def assignment_requests_for_user(user: dict) -> list[dict]:
    identity = await institute_identity(user)
    cursor = get_database().assignment_requests.find({"institute_id": {"$in": identity["aliases"]}}).sort("created_at", -1).limit(20)
    return [serialize_document(item) async for item in cursor]


async def ai_recommendations(user: dict) -> list[dict]:
    database = get_database()
    institute = await database.institutes.find_one({"name": {"$regex": user.get("name", ""), "$options": "i"}})
    if not institute:
        institute = await database.institutes.find_one({})
    challenges = [item async for item in database.challenges.find({"status": "OPEN_FOR_INSTITUTE"}).limit(50)]
    if not institute:
        return [serialize_document(item) for item in challenges[:10]]
    ranked = []
    for challenge in challenges:
        analysis = challenge.get("ai_analysis") or {}
        match = (await recommend_institutes_for_challenge(challenge, [institute], analysis.get("required_expertise", [])))[0]
        document = serialize_document(challenge)
        document["ai_match"] = match["match_score"]
        document["why_recommended"] = match["reason"]
        document["matching_expertise"] = match["matching_expertise"]
        ranked.append(document)
    return sorted(ranked, key=lambda item: item.get("ai_match", 0), reverse=True)[:10]


async def submit_proposal(payload: ProposalCreate, user: dict) -> dict:
    database = get_database()
    identity = await institute_identity(user)
    challenge = await database.challenges.find_one({"challenge_id": payload.challenge_id})
    if not challenge:
        from app.utils.mongo import not_found

        not_found("Challenge not found")
    if challenge.get("assigned_institute_id") not in identity["aliases"]:
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="This challenge is not assigned to your institute yet.")
    now = utc_now()
    document = payload.model_dump()
    document.update({"submitted_by": user["id"], "institute_id": identity["org_id"], "created_at": now, "updated_at": now, "status": "SUBMITTED"})
    await database.proposals.insert_one(document)
    await database.projects.update_one(
        {"challenge_id": payload.challenge_id, "institute_id": {"$in": identity["aliases"]}},
        {"$set": {"proposal": document, "updated_at": now}},
    )
    await record_event("PROPOSAL_SUBMITTED", user, "challenge", payload.challenge_id, {"proposal_id": str(document.get("_id", "")), "need_industry_support": payload.need_industry_support})
    return serialize_document(document)


async def proposal_offers(user: dict) -> list[dict]:
    database = get_database()
    identity = await institute_identity(user)
    offers = [item async for item in database.proposal_offers.find({"institute_id": {"$in": identity["aliases"]}, "status": "OFFERED"}).sort("created_at", -1)]
    proposal_ids = [item.get("proposal_id") for item in offers]
    proposals = {
        str(item.get("_id")): serialize_document(item)
        async for item in database.proposals.find({"_id": {"$in": [ObjectId(value) for value in proposal_ids if ObjectId.is_valid(str(value))]}})
    }
    for offer in offers:
        offer["proposal"] = proposals.get(offer.get("proposal_id"), {})
    return [serialize_document(item) for item in offers]


async def accept_proposal_offer(offer_id: str, user: dict) -> dict:
    from fastapi import HTTPException
    from app.utils.mongo import not_found

    database = get_database()
    identity = await institute_identity(user)
    query = {"_id": ObjectId(offer_id)} if ObjectId.is_valid(offer_id) else {"id": offer_id}
    offer = await database.proposal_offers.find_one(query)
    if not offer:
        not_found("Industry offer not found")
    if offer.get("institute_id") not in identity["aliases"]:
        raise HTTPException(status_code=403, detail="This offer belongs to another institute.")
    challenge_id = offer.get("challenge_id")
    institute_locked = await database.tie_ups.find_one({"challenge_id": challenge_id, "institute_id": {"$in": identity["aliases"]}, "status": {"$in": ["SELECTED", "GOV_APPROVED"]}})
    industry_locked = await database.tie_ups.find_one({"challenge_id": challenge_id, "industry_user_id": offer.get("industry_user_id"), "status": {"$in": ["SELECTED", "GOV_APPROVED"]}})
    if institute_locked or industry_locked:
        raise HTTPException(status_code=409, detail="This challenge already has a locked collaboration for one of these partners.")

    proposal = await database.proposals.find_one({"_id": ObjectId(offer.get("proposal_id"))})
    if not proposal:
        not_found("Proposal not found")
    now = utc_now()
    tie_up = {
        "challenge_id": challenge_id,
        "proposal_id": offer.get("proposal_id"),
        "offer_id": str(offer["_id"]),
        "institute_id": identity["org_id"],
        "institute_name": identity["name"],
        "industry_user_id": offer.get("industry_user_id"),
        "industry_name": offer.get("industry_name"),
        "status": "SELECTED",
        "created_at": now,
        "updated_at": now,
    }
    await database.tie_ups.insert_one(tie_up)
    joint = {
        "challenge_id": challenge_id,
        "proposal_id": offer.get("proposal_id"),
        "offer_id": str(offer["_id"]),
        "tie_up_id": str(tie_up["_id"]),
        "institute_id": identity["org_id"],
        "institute_name": identity["name"],
        "industry_user_id": offer.get("industry_user_id"),
        "industry_name": offer.get("industry_name"),
        "status": "GOV_REVIEW",
        "solution": proposal.get("proposed_solution", ""),
        "technology": proposal.get("technology", ""),
        "budget": offer.get("funding_amount"),
        "support_type": offer.get("support_type"),
        "industry_contribution": offer.get("contribution"),
        "timeline": offer.get("timeline") or proposal.get("estimated_duration", ""),
        "expected_impact": proposal.get("expected_outcome", ""),
        "created_at": now,
        "updated_at": now,
    }
    await database.joint_proposals.insert_one(joint)
    await database.proposal_offers.update_one({"_id": offer["_id"]}, {"$set": {"status": "ACCEPTED", "accepted_at": now, "updated_at": now}})
    await database.proposal_offers.update_many(
        {"challenge_id": challenge_id, "_id": {"$ne": offer["_id"]}, "$or": [{"institute_id": {"$in": identity["aliases"]}}, {"industry_user_id": offer.get("industry_user_id")}], "status": "OFFERED"},
        {"$set": {"status": "LOCKED_OUT", "updated_at": now}},
    )
    await database.proposals.update_one({"_id": proposal["_id"]}, {"$set": {"status": "TIE_UP_SELECTED", "selected_offer_id": str(offer["_id"]), "updated_at": now}})
    await record_event("TIE_UP_SELECTED", user, "challenge", challenge_id, {"joint_proposal_id": str(joint["_id"]), "industry": offer.get("industry_name")})
    result = serialize_document(joint)
    result["joint_proposal_id"] = result.get("id")
    return result


async def accept_challenge(challenge_id: str, user: dict) -> dict:
    database = get_database()
    identity = await institute_identity(user)
    challenge = await database.challenges.find_one({"challenge_id": challenge_id})
    if not challenge:
        from app.utils.mongo import not_found

        not_found("Challenge not found")
    assigned_to = challenge.get("assigned_institute_id")
    if assigned_to and assigned_to not in identity["aliases"]:
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="This challenge is assigned to another institute.")
    existing_project = await database.projects.find_one({"challenge_id": challenge_id, "institute_id": {"$in": identity["aliases"]}})
    await database.challenges.update_one(
        {"challenge_id": challenge_id},
        {"$set": {"status": "ASSIGNED", "assigned_institute_id": identity["org_id"], "updated_at": utc_now()}},
    )
    project = serialize_document(existing_project) if existing_project else await create_project(
        ProjectCreate(
            challenge_id=challenge_id,
            institute_id=identity["org_id"],
            title=f"{challenge.get('title', 'Challenge')} Solution Project",
            status="PLANNING",
            proposal={"source": "Institute acceptance", "ai_suggestions_available": bool(challenge.get("ai_analysis", {}).get("proposed_solution_directions"))},
        )
    )
    await record_event("CHALLENGE_ACCEPTED_BY_INSTITUTE", user, "challenge", challenge_id, {"project_id": project.get("project_id"), "institute_id": identity["org_id"]})
    return {"success": True, "message": "Challenge accepted and project workspace created.", "project": project}


async def reject_challenge(challenge_id: str, user: dict) -> dict:
    await get_database().notifications.insert_one(
        {"type": "INSTITUTE_REJECTED_CHALLENGE", "challenge_id": challenge_id, "user_id": user["id"], "created_at": utc_now()}
    )
    return {"success": True, "message": "Challenge rejection noted."}


async def request_assignment(challenge_id: str, user: dict) -> dict:
    database = get_database()
    identity = await institute_identity(user)
    challenge = await database.challenges.find_one({"challenge_id": challenge_id})
    if not challenge:
        from app.utils.mongo import not_found

        not_found("Challenge not found")
    now = utc_now()
    document = {
        "type": "INSTITUTE_ASSIGNMENT_REQUEST",
        "challenge_id": challenge_id,
        "institute_user_id": user["id"],
        "institute_id": identity["org_id"],
        "institute_name": identity["name"],
        "status": "REQUESTED",
        "created_at": now,
        "updated_at": now,
    }
    await database.assignment_requests.update_one(
        {"challenge_id": challenge_id, "institute_id": identity["org_id"], "status": "REQUESTED"},
        {"$setOnInsert": document},
        upsert=True,
    )
    await database.notifications.insert_one(
        {
            "title": "Institute assignment requested",
            "message": f"{identity['name']} requested assignment for {challenge.get('title', challenge_id)}.",
            "role": "ADMIN",
            "entity_type": "challenge",
            "entity_id": challenge_id,
            "read": False,
            "created_at": now,
        }
    )
    await record_event("ASSIGNMENT_REQUESTED", user, "challenge", challenge_id, {"institute_id": identity["org_id"], "institute_name": identity["name"]})
    return {"success": True, "message": "Assignment request sent to admin for validation."}


async def projects(user: dict) -> list[dict]:
    identity = await institute_identity(user)
    cursor = get_database().projects.find({"institute_id": {"$in": identity["aliases"]}})
    return [serialize_document(item) async for item in cursor]


async def create_team(payload: dict, user: dict) -> dict:
    document = {**payload, "created_by": user["id"], "created_at": utc_now(), "updated_at": utc_now()}
    await get_database().teams.insert_one(document)
    return serialize_document(document)


async def update_milestone(milestone_id: str, payload: dict, user: dict) -> dict:
    from pymongo import ReturnDocument
    from app.utils.mongo import not_found

    payload["updated_at"] = utc_now()
    payload["updated_by"] = user["id"]
    result = await get_database().milestones.find_one_and_update({"milestone_id": milestone_id}, {"$set": payload}, return_document=ReturnDocument.AFTER)
    if not result:
        not_found("Milestone not found")
    return serialize_document(result)
