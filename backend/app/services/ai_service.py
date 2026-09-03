from app.core.database import get_database
from app.rag.pipeline import analyze_challenge
from app.utils.helpers import utc_now
from app.utils.mongo import not_found
from app.utils.serializers import serialize_document


async def analyze_and_store(challenge_id: str) -> dict:
    database = get_database()
    challenge = await database.challenges.find_one({"challenge_id": challenge_id})
    if not challenge:
        not_found("Challenge not found")

    existing = [item async for item in database.challenges.find({"challenge_id": {"$ne": challenge_id}}).limit(100)]
    institutes = [item async for item in database.institutes.find().limit(100)]
    industries = [item async for item in database.industries.find().limit(100)]
    analysis = await analyze_challenge(challenge, existing, institutes, industries)
    await database.challenges.update_one(
        {"challenge_id": challenge_id},
        {"$set": {"ai_analysis": analysis.model_dump(), "updated_at": utc_now()}},
    )
    return analysis.model_dump()


async def get_analysis(challenge_id: str) -> dict:
    challenge = await get_database().challenges.find_one({"challenge_id": challenge_id})
    if not challenge:
        not_found("Challenge not found")
    return serialize_document(challenge).get("ai_analysis") or {}
