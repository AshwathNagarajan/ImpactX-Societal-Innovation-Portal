import logging

from fastapi import HTTPException, status

from app.core.database import get_database
from app.core.security import create_access_token, verify_password
from app.schemas.auth import LoginRequest
from app.utils.serializers import serialize_document

logger = logging.getLogger(__name__)


async def authenticate_user(payload: LoginRequest) -> dict:
    try:
        user = await get_database().users.find_one({"email": payload.email, "is_active": True})
        password_hash = user.get("password_hash") if user else None
        if not user or not password_hash or not verify_password(payload.password, password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

        token = create_access_token(user["email"], {"role": user["role"]})
        user_out = serialize_document(user)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_out["id"],
                "name": user_out["name"],
                "email": user_out["email"],
                "role": user_out["role"],
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Authentication service failed for %s.", payload.email)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication service failed. Check backend environment and logs.") from exc
