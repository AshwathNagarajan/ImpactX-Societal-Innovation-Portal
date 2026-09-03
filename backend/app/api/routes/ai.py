from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, require_admin
from app.services.ai_service import (
    analyze_and_store,
    generate_roadmap,
    generate_solutions,
    get_analysis,
    get_institute_recommendations,
    get_next_actions,
    get_project_health,
    get_project_industries,
    get_similar,
    summarize_project_progress,
)

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/analyze/{challenge_id}")
async def analyze(challenge_id: str, user=Depends(get_current_user)):
    return {"success": True, "data": await analyze_and_store(challenge_id)}


@router.get("/analysis/{challenge_id}")
async def analysis(challenge_id: str):
    return {"success": True, "data": await get_analysis(challenge_id)}


@router.post("/challenges/{challenge_id}/analyze")
async def analyze_challenge(challenge_id: str, user=Depends(get_current_user)):
    return {"success": True, "data": await analyze_and_store(challenge_id)}


@router.get("/challenges/{challenge_id}/analysis")
async def challenge_analysis(challenge_id: str, user=Depends(get_current_user)):
    return {"success": True, "data": await get_analysis(challenge_id)}


@router.get("/challenges/{challenge_id}/similar")
async def similar_challenges(challenge_id: str, user=Depends(get_current_user)):
    return {"success": True, "items": await get_similar(challenge_id)}


@router.get("/challenges/{challenge_id}/institutes")
async def challenge_institutes(challenge_id: str, user=Depends(get_current_user)):
    return {"success": True, "items": await get_institute_recommendations(challenge_id)}


@router.post("/challenges/{challenge_id}/solutions")
async def challenge_solutions(challenge_id: str, user=Depends(get_current_user)):
    return {"success": True, "items": await generate_solutions(challenge_id)}


@router.get("/projects/{project_id}/industries")
async def project_industries(project_id: str, user=Depends(get_current_user)):
    return {"success": True, "items": await get_project_industries(project_id)}


@router.post("/projects/{project_id}/roadmap")
async def project_roadmap(project_id: str, user=Depends(get_current_user)):
    return {"success": True, "items": await generate_roadmap(project_id)}


@router.get("/projects/{project_id}/health")
async def project_health(project_id: str, user=Depends(get_current_user)):
    return {"success": True, "data": await get_project_health(project_id)}


@router.get("/projects/{project_id}/next-actions")
async def project_next_actions(project_id: str, user=Depends(get_current_user)):
    return {"success": True, "data": await get_next_actions(project_id)}


@router.post("/projects/{project_id}/progress-summary")
async def project_progress_summary(project_id: str, user=Depends(get_current_user)):
    return {"success": True, "data": await summarize_project_progress(project_id)}


@router.get("/admin/review-center")
async def admin_review_center(user=Depends(require_admin)):
    # The admin screen can use the standard challenge list and enrich rows through this compact AI projection.
    from app.core.database import get_database
    from app.utils.serializers import serialize_document

    cursor = get_database().challenges.find({}).sort("created_at", -1).limit(100)
    items = []
    async for challenge in cursor:
        serialized = serialize_document(challenge)
        analysis = serialized.get("ai_analysis") or {}
        items.append(
            {
                "challenge_id": serialized.get("challenge_id"),
                "title": serialized.get("title"),
                "district": serialized.get("district"),
                "status": serialized.get("status"),
                "ai_status": serialized.get("ai_status") or analysis.get("ai_status") or "PENDING",
                "ai_category": analysis.get("primary_category") or analysis.get("category"),
                "severity": analysis.get("severity", {}),
                "priority": analysis.get("priority", {}),
                "duplicate_probability": analysis.get("duplicate_probability", 0),
                "recommended_institutes": analysis.get("recommended_institutes", [])[:3],
                "confidence_score": analysis.get("confidence_score", 0),
            }
        )
    return {"success": True, "items": items}
