from fastapi import HTTPException

from app.ai.analysis.challenge_analyzer import analyze_challenge_intelligence
from app.ai.analysis.duplicate_detector import detect_similar_challenges
from app.ai.matching.industry_matcher import recommend_industries_for_project
from app.ai.matching.institute_matcher import recommend_institutes_for_challenge
from app.ai.project_intelligence.lifecycle import lifecycle_steps, validate_transition
from app.ai.project_intelligence.project_health import evaluate_project_health
from app.ai.project_intelligence.roadmap_generator import generate_project_roadmap
from app.ai.solutions.solution_generator import generate_solution_directions
from app.core.database import get_database
from app.utils.helpers import utc_now
from app.utils.mongo import not_found
from app.utils.serializers import serialize_document


def _legacy_analysis_fields(analysis: dict) -> dict:
    priority = analysis.get("priority", {})
    severity = analysis.get("severity", {})
    return {
        "category": analysis.get("primary_category", ""),
        "priority_score": priority.get("score", 0),
        "priority_level": priority.get("level", "LOW"),
        "impact_score": min(100, int(priority.get("score", 0)) + 8),
        "risk_factors": analysis.get("risks", []),
        "recommended_domains": analysis.get("required_expertise", []),
        "possible_government_schemes": analysis.get("related_government_context", []),
        "suggested_solution_direction": (analysis.get("proposed_solution_directions") or [{}])[0].get("approach", ""),
        "severity_score": severity.get("score", 0),
        "severity_level": severity.get("level", "LOW"),
    }


async def _challenge(challenge_id: str) -> dict:
    challenge = await get_database().challenges.find_one({"challenge_id": challenge_id})
    if not challenge:
        not_found("Challenge not found")
    return challenge


async def _project(project_id: str) -> dict:
    project = await get_database().projects.find_one({"project_id": project_id})
    if not project:
        not_found("Project not found")
    return project


async def analyze_and_store(challenge_id: str) -> dict:
    database = get_database()
    challenge = await _challenge(challenge_id)
    await database.challenges.update_one({"challenge_id": challenge_id}, {"$set": {"ai_status": "PROCESSING", "updated_at": utc_now()}})
    existing = [item async for item in database.challenges.find({"challenge_id": {"$ne": challenge_id}}).limit(250)]
    institutes = [item async for item in database.institutes.find().limit(250)]
    current_history = challenge.get("ai_analysis_history") or []
    version = len(current_history) + 1
    try:
        analysis = await analyze_challenge_intelligence(challenge, existing, institutes, version)
    except Exception as exc:
        await database.challenges.update_one(
            {"challenge_id": challenge_id},
            {
                "$set": {"ai_status": "FAILED", "ai_error": "AI analysis failed. Retry analysis from admin review.", "updated_at": utc_now()},
                "$push": {"ai_analysis_history": {"ai_status": "FAILED", "generated_at": utc_now(), "error_type": exc.__class__.__name__}},
            },
        )
        raise HTTPException(status_code=503, detail="AI analysis failed. Retry analysis from admin review.") from exc
    analysis_document = {**analysis.model_dump(), **_legacy_analysis_fields(analysis.model_dump())}
    await database.challenges.update_one(
        {"challenge_id": challenge_id},
        {
            "$set": {
                "ai_analysis": analysis_document,
                "current_analysis": version,
                "ai_status": "COMPLETED",
                "matched_institutes": analysis_document.get("recommended_institutes", []),
                "updated_at": utc_now(),
            },
            "$push": {"ai_analysis_history": analysis_document},
        },
    )
    return analysis_document


async def get_analysis(challenge_id: str) -> dict:
    challenge = await _challenge(challenge_id)
    return serialize_document(challenge).get("ai_analysis") or {}


async def get_similar(challenge_id: str) -> list[dict]:
    database = get_database()
    challenge = await _challenge(challenge_id)
    existing = [item async for item in database.challenges.find({"challenge_id": {"$ne": challenge_id}}).limit(250)]
    return await detect_similar_challenges(challenge, existing)


async def get_institute_recommendations(challenge_id: str) -> list[dict]:
    database = get_database()
    challenge = await _challenge(challenge_id)
    analysis = challenge.get("ai_analysis") or {}
    institutes = [item async for item in database.institutes.find().limit(250)]
    return await recommend_institutes_for_challenge(challenge, institutes, analysis.get("required_expertise", []))


async def generate_solutions(challenge_id: str) -> list[dict]:
    database = get_database()
    challenge = await _challenge(challenge_id)
    analysis = challenge.get("ai_analysis") or {}
    solutions = generate_solution_directions(challenge, analysis)
    await database.challenges.update_one(
        {"challenge_id": challenge_id},
        {"$set": {"ai_analysis.proposed_solution_directions": solutions, "updated_at": utc_now()}},
    )
    return solutions


async def get_project_industries(project_id: str) -> list[dict]:
    database = get_database()
    project = await _project(project_id)
    challenge = await database.challenges.find_one({"challenge_id": project.get("challenge_id")})
    industries = [item async for item in database.industries.find().limit(250)]
    return await recommend_industries_for_project(project, industries, challenge)


async def generate_roadmap(project_id: str) -> list[dict]:
    database = get_database()
    project = await _project(project_id)
    challenge = await database.challenges.find_one({"challenge_id": project.get("challenge_id")})
    roadmap = generate_project_roadmap(project, challenge)
    await database.projects.update_one(
        {"project_id": project_id},
        {"$set": {"ai_roadmap": roadmap, "updated_at": utc_now()}},
    )
    return roadmap


async def get_project_health(project_id: str) -> dict:
    database = get_database()
    project = await _project(project_id)
    milestones = [item async for item in database.milestones.find({"project_id": project_id}).limit(100)]
    return evaluate_project_health(project, milestones)


async def get_next_actions(project_id: str) -> dict:
    project = await _project(project_id)
    health = await get_project_health(project_id)
    return {
        "project_id": project_id,
        "current_stage": project.get("status", "PLANNING"),
        "lifecycle": lifecycle_steps(project.get("status", "PLANNING")),
        "recommended_actions": health["recommended_actions"],
        "human_approval_required": ["Milestone approval", "Funding approval", "Implementation closure"],
    }


async def summarize_project_progress(project_id: str) -> dict:
    project = await _project(project_id)
    health = await get_project_health(project_id)
    return {
        "project_id": project_id,
        "summary": health["summary"],
        "progress": health["progress"],
        "health": health["health"],
        "lifecycle": lifecycle_steps(project.get("status", "PLANNING")),
    }


def can_transition_project(current: str, target: str) -> bool:
    return validate_transition(current, target)
