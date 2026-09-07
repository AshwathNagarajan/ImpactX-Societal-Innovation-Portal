from fastapi import APIRouter

from app.api.routes import admin, ai, analytics, audit, auth, challenges, comments, data, evidence, exports, industries, institutes, notifications, otp, projects, users

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(challenges.router)
api_router.include_router(data.router)
api_router.include_router(admin.router)
api_router.include_router(institutes.router)
api_router.include_router(industries.router)
api_router.include_router(projects.router)
api_router.include_router(analytics.router)
api_router.include_router(ai.router)
api_router.include_router(audit.router)
api_router.include_router(notifications.router)
api_router.include_router(evidence.router)
api_router.include_router(users.router)
api_router.include_router(comments.router)
api_router.include_router(exports.router)
api_router.include_router(otp.router)
