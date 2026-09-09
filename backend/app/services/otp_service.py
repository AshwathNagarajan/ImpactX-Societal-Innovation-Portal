import hashlib
import random
from datetime import timezone, timedelta

from fastapi import HTTPException

from app.core.database import get_database
from app.services.sms_service import send_sms
from app.utils.helpers import utc_now
from app.utils.serializers import serialize_document


def _hash_otp(mobile: str, otp: str) -> str:
    return hashlib.sha256(f"{mobile}:{otp}".encode("utf-8")).hexdigest()


def _aware(value):
    if value and getattr(value, "tzinfo", None) is None:
        return value.replace(tzinfo=timezone.utc)
    return value


async def request_otp(mobile: str) -> dict:
    clean = "".join(ch for ch in mobile if ch.isdigit())
    if len(clean) < 10:
        raise HTTPException(status_code=400, detail="Enter a valid mobile number.")
    database = get_database()
    recent = await database.otp_verifications.count_documents({"mobile": clean, "created_at": {"$gte": utc_now() - timedelta(minutes=2)}})
    if recent >= 3:
        raise HTTPException(status_code=429, detail="Too many OTP requests. Try again shortly.")
    otp = f"{random.randint(100000, 999999)}"
    now = utc_now()
    document = {
        "mobile": clean,
        "otp_hash": _hash_otp(clean, otp),
        "expires_at": now + timedelta(minutes=10),
        "attempts": 0,
        "verified": False,
        "created_at": now,
        "updated_at": now,
    }
    await database.otp_verifications.insert_one(document)
    sms = await send_sms(clean, f"Your IMPACTX verification OTP is {otp}. It expires in 10 minutes.")
    if not sms.get("sent"):
        await database.otp_verifications.update_one(
            {"_id": document["_id"]},
            {"$set": {"send_failed": True, "send_error": sms, "updated_at": utc_now()}},
        )
        raise HTTPException(status_code=502, detail=sms.get("message") or "Unable to send OTP SMS.")
    return {"success": True, "verification_id": str(document["_id"]), "message": "OTP sent to your mobile number."}


async def verify_otp(verification_id: str, mobile: str, otp: str) -> dict:
    from bson import ObjectId

    clean = "".join(ch for ch in mobile if ch.isdigit())
    query = {"_id": ObjectId(verification_id)} if ObjectId.is_valid(verification_id) else {"verification_id": verification_id}
    record = await get_database().otp_verifications.find_one(query)
    if not record or record.get("mobile") != clean:
        raise HTTPException(status_code=404, detail="OTP verification request not found.")
    if record.get("verified"):
        return {"success": True, "verified": True, "verification_id": verification_id}
    if _aware(record.get("expires_at")) < utc_now():
        raise HTTPException(status_code=400, detail="OTP expired. Request a new OTP.")
    if int(record.get("attempts") or 0) >= 5:
        raise HTTPException(status_code=429, detail="Too many incorrect OTP attempts.")
    if record.get("otp_hash") != _hash_otp(clean, otp):
        await get_database().otp_verifications.update_one({"_id": record["_id"]}, {"$inc": {"attempts": 1}, "$set": {"updated_at": utc_now()}})
        raise HTTPException(status_code=400, detail="Invalid OTP.")
    await get_database().otp_verifications.update_one({"_id": record["_id"]}, {"$set": {"verified": True, "verified_at": utc_now(), "updated_at": utc_now()}})
    return {"success": True, "verified": True, "verification_id": verification_id}


async def assert_verified_mobile(mobile: str, verification_id: str) -> dict:
    from bson import ObjectId

    clean = "".join(ch for ch in mobile if ch.isdigit())
    query = {"_id": ObjectId(verification_id)} if ObjectId.is_valid(verification_id) else {"verification_id": verification_id}
    record = await get_database().otp_verifications.find_one(query)
    if not record or record.get("mobile") != clean or not record.get("verified"):
        raise HTTPException(status_code=403, detail="Mobile OTP verification is required before submitting a challenge.")
    return serialize_document(record)
