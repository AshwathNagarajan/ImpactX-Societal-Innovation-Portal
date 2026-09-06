import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.database import close_mongo_connection, connect_to_mongo, database_health

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="IMPACTX API",
    description="FastAPI backend for the IMPACTX Societal Challenge and Innovation Platform.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RuntimeError)
async def runtime_error_handler(request: Request, exc: RuntimeError):
    return JSONResponse(status_code=503, content={"success": False, "message": str(exc), "detail": None})


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "success" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"success": False, "message": str(exc.detail), "detail": None})


@app.get("/")
async def root():
    return {"status": "healthy", "service": "IMPACTX API", "environment": settings.app_env}


@app.get("/api/health")
async def health():
    database = await database_health()
    return {
        "status": "healthy" if database["ok"] else "degraded",
        "service": "IMPACTX API",
        "environment": settings.app_env,
        "database": database,
        "configuration": {
            "frontend_url": settings.frontend_url,
            "cors_origins": settings.cors_origins,
            "huggingface_configured": bool(settings.huggingface_token),
            "hf_generation_model": settings.hf_generation_model,
            "hf_embedding_model": settings.hf_embedding_model,
        },
    }


app.include_router(api_router)
