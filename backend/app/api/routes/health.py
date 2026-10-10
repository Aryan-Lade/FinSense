"""
Health check API routes.
"""
from fastapi import APIRouter
from app.core.config import settings


router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns information about the application status and configuration.
    """
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "environment": "development" if settings.DEBUG else "production",
        "demo_mode": getattr(settings, 'DEMO_MODE', True),
        "database_url": settings.DATABASE_URL,
        "storage_backend": settings.STORAGE_BACKEND,
    }


@router.get("/ping")
async def ping():
    """Simple ping endpoint."""
    return {"message": "pong"}
