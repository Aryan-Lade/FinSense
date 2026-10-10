"""
Authentication API routes.
Connects with Supabase Auth and local DB sessions.
"""
from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.services.auth_service import AuthService
from app.core.errors import ProcessingException

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


@router.get("/config")
async def get_auth_config():
    """Returns Supabase connection readiness status and config."""
    is_supa = bool(settings.SUPABASE_URL and (settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY))
    return {
        "supabase_configured": is_supa,
        "supabase_url": settings.SUPABASE_URL if is_supa else None,
        "supabase_anon_key": settings.SUPABASE_ANON_KEY if is_supa else None,
        "auth_mode": "supabase" if is_supa else "local_database",
        "storage_backend": settings.STORAGE_BACKEND
    }


@router.post("/register", response_model=AuthResponse)
@router.post("/signup", response_model=AuthResponse)
async def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account with Supabase / database."""
    try:
        service = AuthService(db)
        result = await service.register_user(req.email, req.password, req.full_name)
        return result
    except ProcessingException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e.message))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Registration failed: {str(e)}")


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Log in with email and password."""
    try:
        service = AuthService(db)
        result = await service.authenticate_user(req.email, req.password)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Login failed: {str(e)}")


@router.get("/me")
async def get_current_user_profile(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Retrieve currently authenticated user profile."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token missing or invalid"
        )
    token = authorization.split(" ")[1]
    service = AuthService(db)
    user = await service.get_user_from_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid"
        )
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "supabase_user_id": user.supabase_user_id,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }


@router.post("/logout")
async def logout():
    """Logout endpoint to terminate current session."""
    return {"message": "Successfully logged out"}
