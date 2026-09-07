from fastapi import APIRouter
from pydantic import BaseModel

from app.services import otp_service

router = APIRouter(prefix="/otp", tags=["OTP"])


class OTPRequest(BaseModel):
    mobile: str


class OTPVerify(BaseModel):
    verification_id: str
    mobile: str
    otp: str


@router.post("/request")
async def request_otp(payload: OTPRequest):
    return await otp_service.request_otp(payload.mobile)


@router.post("/verify")
async def verify_otp(payload: OTPVerify):
    return await otp_service.verify_otp(payload.verification_id, payload.mobile, payload.otp)
