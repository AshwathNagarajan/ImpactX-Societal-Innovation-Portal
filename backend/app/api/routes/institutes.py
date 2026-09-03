from fastapi import APIRouter, Depends

from app.core.dependencies import require_institute
from app.schemas.institute import ProposalCreate
from app.services import institute_service

router = APIRouter(prefix="/institute", tags=["Institute"])


@router.get("/dashboard")
async def dashboard(user=Depends(require_institute)):
    return {"success": True, "data": await institute_service.dashboard(user)}


@router.get("/assigned-challenges")
async def assigned_challenges(user=Depends(require_institute)):
    return {"success": True, "items": await institute_service.assigned_challenges()}


@router.get("/recommended-challenges")
async def recommended_challenges(user=Depends(require_institute)):
    return {"success": True, "items": await institute_service.recommended_challenges()}


@router.post("/challenges/{challenge_id}/accept")
async def accept_challenge(challenge_id: str, user=Depends(require_institute)):
    return await institute_service.accept_challenge(challenge_id, user)


@router.post("/challenges/{challenge_id}/reject")
async def reject_challenge(challenge_id: str, user=Depends(require_institute)):
    return await institute_service.reject_challenge(challenge_id, user)


@router.post("/proposals")
async def submit_proposal(payload: ProposalCreate, user=Depends(require_institute)):
    return {"success": True, "data": await institute_service.submit_proposal(payload, user)}


@router.get("/projects")
async def projects(user=Depends(require_institute)):
    return {"success": True, "items": await institute_service.projects(user)}


@router.post("/teams")
async def create_team(payload: dict, user=Depends(require_institute)):
    return {"success": True, "message": "Team creation endpoint ready.", "data": payload}


@router.put("/milestones/{milestone_id}")
async def update_milestone(milestone_id: str, payload: dict, user=Depends(require_institute)):
    return {"success": True, "message": "Milestone update endpoint ready.", "milestone_id": milestone_id, "data": payload}
