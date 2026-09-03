from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.services.ai_service import analyze_and_store, get_analysis

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/analyze/{challenge_id}")
async def analyze(challenge_id: str, user=Depends(get_current_user)):
    return {"success": True, "data": await analyze_and_store(challenge_id)}


@router.get("/analysis/{challenge_id}")
async def analysis(challenge_id: str):
    return {"success": True, "data": await get_analysis(challenge_id)}
