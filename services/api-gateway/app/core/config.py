import logging
import sys
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Centralized Settings using Pydantic BaseSettings.
    Environment variables are automatically mapped to these fields.
    """
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        case_sensitive=True,
        extra="ignore"
    )

    # --- Project Metadata ---
    PROJECT_NAME: str = "Cloud Sentinel API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = ""  # Root level as requested in previous turn
    ENVIRONMENT: str = "development"

    # --- Server Config ---
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    # --- Security ---
    SECRET_KEY: str = "PROD_SECRET_KEY_REPLACE_ME"

    # --- Database Config ---
    # Defaulting to localhost for native dev, but overridden by env in Docker
    DATABASE_URL: str = "postgresql://sentinel_user:sentinel_password@localhost:5432/cloud_sentinel"

    # --- Redis Config ---
    REDIS_URL: str = "redis://localhost:6379/0"

settings = Settings()
