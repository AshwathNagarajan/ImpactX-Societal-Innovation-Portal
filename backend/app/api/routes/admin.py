from fastapi import APIRouter, Depends

from app.core.dependencies import require_admin
from app.schemas.challenge import AssignInstituteRequest, PriorityUpdate
from app.services import challenge_service

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)])


@router.get("/challenges/pending")
async def pending_challenges():
    return {"success": True, "items": await challenge_service.pending_challenges()}


@router.put("/challenges/{challenge_id}/approve")
async def approve_challenge(challenge_id: str):
    return {"success": True, "data": await challenge_service.approve_challenge(challenge_id)}


@router.put("/challenges/{challenge_id}/reject")
async def reject_challenge(challenge_id: str):
    return {"success": True, "data": await challenge_service.reject_challenge(challenge_id)}


@router.put("/challenges/{challenge_id}/priority")
async def update_priority(challenge_id: str, payload: PriorityUpdate):
    return {"success": True, "data": await challenge_service.set_priority(challenge_id, payload.priority)}


@router.put("/challenges/{challenge_id}/assign")
async def assign_challenge(challenge_id: str, payload: AssignInstituteRequest):
    return {"success": True, "data": await challenge_service.assign_institute(challenge_id, payload.institute_id)}
