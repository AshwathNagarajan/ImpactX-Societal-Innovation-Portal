from fastapi import HTTPException, status

from app.core.database import get_database
from app.core.security import create_access_token, verify_password
from app.schemas.auth import LoginRequest
from app.utils.serializers import serialize_document


async def authenticate_user(payload: LoginRequest) -> dict:
    user = await get_database().users.find_one({"email": payload.email, "is_active": True})
    if not user or not verify_password(payload.password, user["password_hash"]):
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
