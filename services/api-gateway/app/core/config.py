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
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # --- Server Config ---
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    # --- Security ---
    # In production, this MUST be a strong secret key
    SECRET_KEY: str = "PROD_SECRET_KEY_REPLACE_ME"

settings = Settings()
