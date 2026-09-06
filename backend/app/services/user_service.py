from bson import ObjectId
from fastapi import HTTPException
from pymongo import ReturnDocument

from app.core.database import get_database
from app.core.security import hash_password
from app.schemas.user import UserCreate, UserUpdate
from app.services.audit_service import record_event
from app.utils.helpers import normalize_role, utc_now
from app.utils.mongo import not_found
from app.utils.serializers import serialize_document

VALID_ROLES = {"ADMIN", "INSTITUTE", "INDUSTRY"}


def _query(user_id: str) -> dict:
    return {"_id": ObjectId(user_id)} if ObjectId.is_valid(user_id) else {"id": user_id}


def _public_user(document: dict) -> dict:
    user = serialize_document(document)
    user.pop("password_hash", None)
    user.pop("password", None)
    return user


async def list_users() -> list[dict]:
    cursor = get_database().users.find({}).sort("role", 1).sort("name", 1)
    return [_public_user(item) async for item in cursor]


async def create_user(payload: UserCreate, actor: dict) -> dict:
    database = get_database()
    role = normalize_role(payload.role)
    if role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Role must be ADMIN, INSTITUTE, or INDUSTRY.")
    if await database.users.find_one({"email": payload.email}):
        raise HTTPException(status_code=409, detail="A user with this email already exists.")
    now = utc_now()
    document = {
        "name": payload.name,
        "email": str(payload.email),
        "role": role,
        "password_hash": hash_password(payload.password),
        "is_active": payload.is_active,
        "created_at": now,
        "updated_at": now,
    }
    await database.users.insert_one(document)
    await record_event("USER_CREATED", actor, "user", str(document["_id"]), {"role": role, "email": document["email"]})
    return _public_user(document)


async def update_user(user_id: str, payload: UserUpdate, actor: dict) -> dict:
    database = get_database()
    updates = {key: value for key, value in payload.model_dump(exclude_unset=True).items() if value is not None}
    if "role" in updates:
        updates["role"] = normalize_role(updates["role"])
        if updates["role"] not in VALID_ROLES:
            raise HTTPException(status_code=400, detail="Role must be ADMIN, INSTITUTE, or INDUSTRY.")
    if "email" in updates:
        updates["email"] = str(updates["email"])
        existing = await database.users.find_one({"email": updates["email"]})
        if existing and str(existing.get("_id")) != user_id:
            raise HTTPException(status_code=409, detail="A user with this email already exists.")
    if "password" in updates:
        updates["password_hash"] = hash_password(updates.pop("password"))
    updates["updated_at"] = utc_now()
    result = await database.users.find_one_and_update(_query(user_id), {"$set": updates}, return_document=ReturnDocument.AFTER)
    if not result:
        not_found("User not found")
    await record_event("USER_UPDATED", actor, "user", user_id, {"updated_fields": sorted(updates.keys())})
    return _public_user(result)
