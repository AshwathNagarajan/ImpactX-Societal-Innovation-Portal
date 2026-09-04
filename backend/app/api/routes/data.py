from fastapi import APIRouter

from app.services.data_service import public_data

router = APIRouter(prefix="/data", tags=["Data"])


@router.get("/public")
async def get_public_data():
    return {"success": True, "data": await public_data()}
