"""
FinSense configuration management.
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "FinSense"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "sqlite:///./finsense.db"
    
<<<<<<< HEAD
    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_BUCKET: str = "invoices"
    
    # Authentication & JWT
    JWT_SECRET: str = "finsense_secure_jwt_secret_token_2026"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # Storage
=======
    # Storage & Supabase
>>>>>>> main
    STORAGE_BACKEND: str = "local"  # local or supabase
    UPLOAD_DIR: str = "./data/uploads"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_BUCKET: str = "finsense-files"
    
    # File limits
    MAX_UPLOAD_MB: int = 15
    MAX_PDF_PAGES: int = 10
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]  # Default Vite port
    
    # AI/Processing
    EXTRACTOR: str = "auto"  # auto, mock, heuristic, vlm
    OCR_ENGINE: str = "auto"  # auto, paddle, tesseract, none
    OCR_LANGS: str = "en,hi"
    
    # VLM settings
    VLM_BASE_URL: str = ""
    VLM_MODEL: str = "Qwen/Qwen2.5-VL-7B-Instruct"
    VLM_API_KEY: str = ""
    VLM_TIMEOUT_S: int = 120
    
    # Processing limits
    REREAD_MAX_RETRIES: int = 2
    
    # Validation
    CONF_REVIEW_THRESHOLD: float = 0.85
    AMOUNT_TOLERANCE: float = 1.00  # rupees
    GST_SLABS: List[float] = [0, 0.25, 1.5, 3, 5, 12, 18, 28, 40]
    
    # Timezone
    TIMEZONE: str = "Asia/Kolkata"
    
    # Reminders
    REMINDER_FIRST_DAYS: int = 10
    REMINDER_REPEAT_DAYS: int = 2
    REMINDER_TIME: str = "09:00"  # HH:MM format
    
    # Google Calendar
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""
    
    # Security
    TOKEN_ENC_KEY: str = ""  # Will be generated if empty
    OWNER_ACCESS_KEY: str = ""  # Empty = access gate disabled
    CRON_SECRET: str = ""  # For external reminder triggering
    
    # Analytics
    ANALYTICS_POLICY: str = "validated_only"  # validated_only or include_unreviewed
    
    # Batching
    BATCH_MAX_FILES: int = 50
    BATCH_CONCURRENCY: int = 3
    
    # Reviewers
    REVIEWERS: str = ""  # Comma-separated names
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
