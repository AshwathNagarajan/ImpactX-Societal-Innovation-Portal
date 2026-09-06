from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.dependencies import require_admin
from app.schemas.challenge import AssignInstituteRequest, PriorityUpdate
from app.services import challenge_service

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)])


class ReviewAction(BaseModel):
    status: str
    comment: str = ""


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


@router.get("/assignment-requests")
async def assignment_requests():
    return {"success": True, "items": await challenge_service.assignment_requests()}


@router.put("/assignment-requests/{request_id}/approve")
async def approve_assignment_request(request_id: str):
    return {"success": True, "data": await challenge_service.approve_assignment_request(request_id)}


@router.put("/assignment-requests/{request_id}")
async def update_assignment_request(request_id: str, payload: ReviewAction, user=Depends(require_admin)):
    return {"success": True, "data": await challenge_service.update_assignment_request(request_id, payload.status, payload.comment, user)}


@router.get("/proposals")
async def proposals(status: str = ""):
    return {"success": True, "items": await challenge_service.list_proposals(status or None)}


@router.put("/proposals/{proposal_id}")
async def update_proposal(proposal_id: str, payload: ReviewAction, user=Depends(require_admin)):
    return {"success": True, "data": await challenge_service.update_proposal_status(proposal_id, payload.status, payload.comment, user)}


@router.get("/support-offers")
async def support_offers(status: str = ""):
    return {"success": True, "items": await challenge_service.list_support_offers(status or None)}


@router.put("/support-offers/{offer_id}")
async def update_support_offer(offer_id: str, payload: ReviewAction, user=Depends(require_admin)):
    return {"success": True, "data": await challenge_service.update_support_offer_status(offer_id, payload.status, payload.comment, user)}
