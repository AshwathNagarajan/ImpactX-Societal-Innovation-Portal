from fastapi import APIRouter

from app.api.routes import admin, ai, analytics, auth, challenges, data, industries, institutes, notifications, projects

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
api_router.include_router(notifications.router)
