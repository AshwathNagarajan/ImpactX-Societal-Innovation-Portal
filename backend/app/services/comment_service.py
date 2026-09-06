from fastapi import HTTPException

from app.core.database import get_database
from app.services.audit_service import record_event
from app.utils.helpers import utc_now
from app.utils.serializers import serialize_document

VALID_ENTITY_TYPES = {"challenge", "project", "proposal", "support"}


def _actor(user: dict) -> dict:
    return {
        "id": user.get("id"),
        "name": user.get("name") or user.get("email") or "User",
        "email": user.get("email"),
        "role": user.get("role"),
    }


async def list_comments(entity_type: str, entity_id: str) -> list[dict]:
    normalized_type = entity_type.strip().lower()
    if normalized_type not in VALID_ENTITY_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported comment entity type.")
    cursor = (
        get_database()
        .comments.find({"entity_type": normalized_type, "entity_id": entity_id})
        .sort("created_at", 1)
    )
    return [serialize_document(item) async for item in cursor]


async def create_comment(payload: dict, user: dict) -> dict:
    entity_type = str(payload.get("entity_type", "")).strip().lower()
    entity_id = str(payload.get("entity_id", "")).strip()
    body = str(payload.get("body", "")).strip()
    if entity_type not in VALID_ENTITY_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported comment entity type.")
    if not entity_id:
        raise HTTPException(status_code=400, detail="Comment entity is required.")
    if len(body) < 2:
        raise HTTPException(status_code=400, detail="Comment cannot be empty.")

    now = utc_now()
    document = {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "body": body,
        "author": _actor(user),
        "created_at": now,
        "updated_at": now,
        "resolved": False,
    }
    await get_database().comments.insert_one(document)
    await record_event("COMMENT_ADDED", user, entity_type, entity_id, {"comment_id": str(document["_id"])})
    return serialize_document(document)
