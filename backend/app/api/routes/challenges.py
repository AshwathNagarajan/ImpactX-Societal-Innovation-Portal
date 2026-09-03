from fastapi import APIRouter, Query

from app.schemas.challenge import ChallengeCreate, ChallengeListResponse
from app.services import challenge_service

router = APIRouter(prefix="/challenges", tags=["Challenges"])


@router.post("")
async def create_challenge(payload: ChallengeCreate):
    item = await challenge_service.create_challenge(payload)
    return {"success": True, "message": "Challenge submitted successfully.", "challenge_id": item["challenge_id"], "data": item}


@router.get("", response_model=ChallengeListResponse)
async def list_challenges(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = "",
    category: str = "",
    district: str = "",
    priority: str = "",
    status: str = "",
):
    return await challenge_service.list_challenges(
        {"search": search, "category": category, "district": district, "priority": priority, "status": status},
        page=page,
        limit=limit,
    )


@router.get("/{challenge_id}")
async def get_challenge(challenge_id: str):
    return {"success": True, "data": await challenge_service.get_challenge_by_id(challenge_id)}
