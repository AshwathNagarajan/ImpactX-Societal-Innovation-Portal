from app.core.database import get_database
from app.schemas.project import ProjectCreate
from app.utils.helpers import utc_now
from app.utils.serializers import serialize_document


async def generate_project_id() -> str:
    count = await get_database().projects.count_documents({})
    return f"PRJ-{count + 1:04d}"


async def create_project(payload: ProjectCreate) -> dict:
    now = utc_now()
    document = payload.model_dump()
    document.update(
        {
            "project_id": await generate_project_id(),
            "progress": 0,
            "prototype_status": "NOT_STARTED",
            "pilot_status": "NOT_STARTED",
            "implementation_status": "NOT_STARTED",
            "impact_metrics": {},
            "created_at": now,
            "updated_at": now,
        }
    )
    await get_database().projects.insert_one(document)
    return serialize_document(document)


async def list_projects() -> list[dict]:
    cursor = get_database().projects.find().sort("created_at", -1)
    return [serialize_document(item) async for item in cursor]
