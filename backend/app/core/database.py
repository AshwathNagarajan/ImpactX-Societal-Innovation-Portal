import logging
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import PyMongoError

from app.core.config import settings

logger = logging.getLogger(__name__)


class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None


db = MongoDB()

COLLECTIONS = {
    "users": "users",
    "challenges": "challenges",
    "institutes": "institutes",
    "industries": "industries",
    "projects": "projects",
    "proposals": "proposals",
    "teams": "teams",
    "milestones": "milestones",
    "partnerships": "partnerships",
    "notifications": "notifications",
    "impact_metrics": "impact_metrics",
}


async def connect_to_mongo() -> None:
    if not settings.mongodb_uri:
        logger.warning("MONGODB_URI is not configured; database routes will be unavailable.")
        return

    db.client = AsyncIOMotorClient(settings.mongodb_uri)
    db.database = db.client[settings.mongodb_database]
    try:
        await db.client.admin.command("ping")
        await ensure_indexes()
        logger.info("Connected to MongoDB database '%s'.", settings.mongodb_database)
    except PyMongoError:
        logger.exception("MongoDB connection failed.")
        raise


async def close_mongo_connection() -> None:
    if db.client:
        db.client.close()
        db.client = None
        db.database = None


def get_database() -> AsyncIOMotorDatabase:
    if db.database is None:
        raise RuntimeError("MongoDB is not connected. Configure MONGODB_URI in backend/.env.")
    return db.database


async def ensure_indexes() -> None:
    database = get_database()
    await database.users.create_index("email", unique=True)
    await database.challenges.create_index("challenge_id", unique=True)
    await database.challenges.create_index([("status", 1), ("created_at", -1)])
    await database.projects.create_index("project_id", unique=True)
