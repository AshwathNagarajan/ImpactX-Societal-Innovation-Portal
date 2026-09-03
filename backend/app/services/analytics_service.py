from app.core.database import get_database


async def public_analytics() -> dict:
    database = get_database()
    total = await database.challenges.count_documents({})
    validated = await database.challenges.count_documents({"status": "VALIDATED"})
    implemented = await database.challenges.count_documents({"status": "IMPLEMENTED"})
    return {
        "total_challenges": total,
        "validated_challenges": validated,
        "solutions_implemented": implemented,
        "citizens_impacted": await estimate_people_impacted(),
    }


async def estimate_people_impacted() -> int:
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$people_affected"}}}]
    rows = [row async for row in get_database().challenges.aggregate(pipeline)]
    return rows[0]["total"] if rows else 0


async def role_analytics(role: str, user: dict | None = None) -> dict:
    base = await public_analytics()
    base["scope"] = role
    if user:
        base["user"] = user
    return base
