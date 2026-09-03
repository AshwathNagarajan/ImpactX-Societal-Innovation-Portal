from bson import ObjectId

from app.core.database import get_database
from app.schemas.institute import ProposalCreate
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


async def submit_proposal(payload: ProposalCreate, user: dict) -> dict:
    now = utc_now()
    document = payload.model_dump()
    document.update({"submitted_by": user["id"], "created_at": now, "updated_at": now, "status": "SUBMITTED"})
    await get_database().proposals.insert_one(document)
    return serialize_document(document)


async def accept_challenge(challenge_id: str, user: dict) -> dict:
    await get_database().challenges.update_one(
        {"challenge_id": challenge_id},
        {"$set": {"status": "ASSIGNED", "assigned_institute_id": user["id"], "updated_at": utc_now()}},
    )
    return {"success": True, "message": "Challenge accepted."}


async def reject_challenge(challenge_id: str, user: dict) -> dict:
    await get_database().notifications.insert_one(
        {"type": "INSTITUTE_REJECTED_CHALLENGE", "challenge_id": challenge_id, "user_id": user["id"], "created_at": utc_now()}
    )
    return {"success": True, "message": "Challenge rejection noted."}


async def projects(user: dict) -> list[dict]:
    cursor = get_database().projects.find({"institute_id": {"$in": [user["id"], ObjectId(user["id"]) if ObjectId.is_valid(user["id"]) else user["id"]]}})
    return [serialize_document(item) async for item in cursor]
