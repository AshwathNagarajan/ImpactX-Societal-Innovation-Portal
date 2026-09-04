from app.core.database import get_database
from app.utils.helpers import utc_now
from app.utils.serializers import serialize_document


async def create_notification(title: str, message: str, role: str = "ALL", entity_type: str = "", entity_id: str = "") -> dict:
    document = {
        "title": title,
        "message": message,
        "role": role,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "read": False,
        "created_at": utc_now(),
    }
    await get_database().notifications.insert_one(document)
    return serialize_document(document)


async def list_notifications(user: dict) -> list[dict]:
    role = user.get("role", "ALL")
    cursor = get_database().notifications.find({"role": {"$in": ["ALL", role]}}).sort("created_at", -1).limit(20)
    return [serialize_document(item) async for item in cursor]


async def mark_read(notification_id: str) -> dict:
    from bson import ObjectId

    query = {"_id": ObjectId(notification_id)} if ObjectId.is_valid(notification_id) else {"id": notification_id}
    await get_database().notifications.update_one(query, {"$set": {"read": True, "updated_at": utc_now()}})
    return {"id": notification_id, "read": True}


async def mark_all_read(user: dict) -> dict:
    role = user.get("role", "ALL")
    result = await get_database().notifications.update_many({"role": {"$in": ["ALL", role]}}, {"$set": {"read": True, "updated_at": utc_now()}})
    return {"updated": result.modified_count}
