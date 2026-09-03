from app.ai.matching.industry_matcher import recommend_industries_for_project
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


async def ai_recommendations(user: dict) -> list[dict]:
    database = get_database()
    industry = await database.industries.find_one({"name": {"$regex": user.get("name", ""), "$options": "i"}})
    if not industry:
        industry = await database.industries.find_one({})
    projects = [item async for item in database.projects.find({"status": {"$in": ["PLANNING", "ASSIGNED", "RESEARCH", "SOLUTION_DESIGN", "PROTOTYPE", "TESTING", "PILOT"]}}).limit(50)]
    ranked = []
    for project in projects:
        challenge = await database.challenges.find_one({"challenge_id": project.get("challenge_id")})
        if industry:
            match = (await recommend_industries_for_project(project, [industry], challenge))[0]
        else:
            match = {"match_score": 70, "recommended_support": ["Mentorship"], "reason": "Project is ready for partner review."}
        document = serialize_document(project)
        document["challenge"] = serialize_document(challenge) if challenge else {}
        document["ai_match"] = match["match_score"]
        document["recommended_support"] = match.get("recommended_support", [])
        document["why_recommended"] = match.get("reason", "")
        ranked.append(document)
    return sorted(ranked, key=lambda item: item.get("ai_match", 0), reverse=True)[:10]


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
