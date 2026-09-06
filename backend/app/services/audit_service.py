from app.core.database import get_database
from app.utils.helpers import utc_now
from app.utils.serializers import serialize_document


async def record_event(action: str, actor: dict | None = None, entity_type: str = "", entity_id: str = "", details: dict | None = None) -> dict:
    document = {
        "action": action,
        "actor_id": (actor or {}).get("id"),
        "actor_name": (actor or {}).get("name"),
        "actor_role": (actor or {}).get("role"),
        "entity_type": entity_type,
        "entity_id": entity_id,
        "details": details or {},
        "created_at": utc_now(),
    }
    await get_database().audit_events.insert_one(document)
    return serialize_document(document)


async def list_events(entity_type: str = "", entity_id: str = "", limit: int = 50) -> list[dict]:
    query = {}
    if entity_type:
        query["entity_type"] = entity_type
    if entity_id:
        query["entity_id"] = entity_id
    cursor = get_database().audit_events.find(query).sort("created_at", -1).limit(limit)
    return [serialize_document(item) async for item in cursor]
