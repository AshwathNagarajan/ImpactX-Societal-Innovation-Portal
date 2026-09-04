from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_env: str = "development"
    mongodb_uri: str = ""
    mongodb_database: str = "impactx"

    jwt_secret_key: str = "change-this-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    huggingface_token: str = ""
    hf_generation_model: str = "google/flan-t5-base"
    hf_embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    frontend_url: str = "http://localhost:5173"
    duplicate_high_threshold: float = 0.90
    duplicate_possible_threshold: float = 0.80
    vector_store_path: Path = Field(default=BACKEND_DIR / "vector_store")
    knowledge_base_path: Path = Field(default=BACKEND_DIR / "knowledge_base")

    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env", Path("backend/.env")),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        return [self.frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"]

    @property
    def is_development(self) -> bool:
        return self.app_env.lower() in {"dev", "development", "local"}


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
