from bson import ObjectId

from app.ai.matching.institute_matcher import recommend_institutes_for_challenge
from app.core.database import get_database
from app.schemas.project import ProjectCreate
from app.schemas.institute import ProposalCreate
from app.services.project_service import create_project
from app.utils.helpers import utc_now
from app.utils.serializers import serialize_document


async def dashboard(user: dict) -> dict:
    database = get_database()
    return {
        "assigned_challenges": await database.challenges.count_documents({"status": "ASSIGNED"}),
        "active_projects": await database.projects.count_documents({"status": {"$ne": "COMPLETED"}}),
        "completed_projects": await database.projects.count_documents({"status": "COMPLETED"}),
        "user": user,
    }


async def assigned_challenges() -> list[dict]:
    cursor = get_database().challenges.find({"status": {"$in": ["VALIDATED", "ASSIGNED"]}})
    return [serialize_document(item) async for item in cursor]


async def recommended_challenges() -> list[dict]:
    cursor = get_database().challenges.find({"status": "VALIDATED"}).limit(20)
    return [serialize_document(item) async for item in cursor]


async def ai_recommendations(user: dict) -> list[dict]:
    database = get_database()
    institute = await database.institutes.find_one({"name": {"$regex": user.get("name", ""), "$options": "i"}})
    if not institute:
        institute = await database.institutes.find_one({})
    challenges = [item async for item in database.challenges.find({"status": {"$in": ["VALIDATED", "SUBMITTED", "UNDER_REVIEW"]}}).limit(50)]
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
    now = utc_now()
    document = payload.model_dump()
    document.update({"submitted_by": user["id"], "created_at": now, "updated_at": now, "status": "SUBMITTED"})
    await get_database().proposals.insert_one(document)
    return serialize_document(document)


async def accept_challenge(challenge_id: str, user: dict) -> dict:
    database = get_database()
    challenge = await database.challenges.find_one({"challenge_id": challenge_id})
    if not challenge:
        from app.utils.mongo import not_found

        not_found("Challenge not found")
    existing_project = await database.projects.find_one({"challenge_id": challenge_id, "institute_id": user["id"]})
    await database.challenges.update_one(
        {"challenge_id": challenge_id},
        {"$set": {"status": "ASSIGNED", "assigned_institute_id": user["id"], "updated_at": utc_now()}},
    )
    project = serialize_document(existing_project) if existing_project else await create_project(
        ProjectCreate(
            challenge_id=challenge_id,
            institute_id=user["id"],
            title=f"{challenge.get('title', 'Challenge')} Solution Project",
            status="PLANNING",
            proposal={"source": "Institute acceptance", "ai_suggestions_available": bool(challenge.get("ai_analysis", {}).get("proposed_solution_directions"))},
        )
    )
    return {"success": True, "message": "Challenge accepted and project workspace created.", "project": project}


async def reject_challenge(challenge_id: str, user: dict) -> dict:
    await get_database().notifications.insert_one(
        {"type": "INSTITUTE_REJECTED_CHALLENGE", "challenge_id": challenge_id, "user_id": user["id"], "created_at": utc_now()}
    )
    return {"success": True, "message": "Challenge rejection noted."}


async def projects(user: dict) -> list[dict]:
    cursor = get_database().projects.find({"institute_id": {"$in": [user["id"], ObjectId(user["id"]) if ObjectId.is_valid(user["id"]) else user["id"]]}})
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
