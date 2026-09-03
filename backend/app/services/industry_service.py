from app.core.database import get_database
from app.schemas.industry import PartnershipCreate
from app.utils.helpers import utc_now
from app.utils.serializers import serialize_document


async def dashboard(user: dict) -> dict:
    database = get_database()
    return {
        "projects_supported": await database.partnerships.count_documents({"created_by": user["id"]}),
        "active_partnerships": await database.partnerships.count_documents({"created_by": user["id"], "status": "ACTIVE"}),
        "user": user,
    }


async def recommended_projects() -> list[dict]:
    cursor = get_database().projects.find({"status": {"$in": ["ASSIGNED", "RESEARCH", "PROTOTYPE", "TESTING", "PILOT"]}}).limit(20)
    return [serialize_document(item) async for item in cursor]


async def create_partnership(payload: PartnershipCreate, user: dict) -> dict:
    now = utc_now()
    document = payload.model_dump()
    document.update({"created_by": user["id"], "status": "ACTIVE", "created_at": now, "updated_at": now})
    await get_database().partnerships.insert_one(document)
    return serialize_document(document)


async def support_project(project_id: str, user: dict) -> dict:
    await get_database().projects.update_one(
        {"project_id": project_id},
        {"$addToSet": {"industry_ids": user["id"]}, "$set": {"updated_at": utc_now()}},
    )
    return {"success": True, "message": "Industry support registered."}
