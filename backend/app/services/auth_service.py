"""
Authentication service for managing user authentication and authorization.
Supports both Supabase Auth API and local database-backed authentication.
"""
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import httpx
from sqlalchemy.orm import Session
import uuid

from app.core.config import settings
from app.core.security import (
    create_access_token, 
    decode_access_token, 
    get_password_hash, 
    verify_password
)
from app.core.errors import ProcessingException
from app.models.users import User


class AuthService:
    """Service for handling authentication with Supabase and local DB."""

    def __init__(self, db: Session):
        self.db = db

    async def register_user(self, email: str, password: str, full_name: Optional[str] = None) -> Dict[str, Any]:
        """Register a new user (with Supabase Auth if configured, and local DB)."""
        email = email.strip().lower()
        
        # Check if user already exists in local DB
        existing = self.db.query(User).filter(User.email == email).first()
        if existing:
            raise ProcessingException(f"User with email '{email}' already exists", "user_exists")

        supabase_user_id = None
        supabase_token = None

        # 1. If Supabase is configured, register via Supabase Auth API
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/admin/users",
                        headers={
                            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "email": email,
                            "password": password,
                            "email_confirm": True,
                            "user_metadata": {"full_name": full_name or ""}
                        }
                    )
                    if resp.status_code in (200, 201):
                        supa_data = resp.json()
                        supabase_user_id = supa_data.get("id")
            except Exception:
                pass
        elif settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/signup",
                        headers={
                            "apikey": settings.SUPABASE_ANON_KEY,
                            "Content-Type": "application/json"
                        },
                        json={
                            "email": email,
                            "password": password,
                            "data": {"full_name": full_name or ""}
                        }
                    )
                    if resp.status_code in (200, 201):
                        supa_data = resp.json()
                        supabase_user_id = supa_data.get("id") or (supa_data.get("user", {}).get("id"))
                        supabase_token = supa_data.get("access_token")
            except Exception:
                pass

        # 2. Persist in local database
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            full_name=full_name or email.split("@")[0].title(),
            hashed_password=get_password_hash(password),
            supabase_user_id=supabase_user_id,
            role="user",
            is_active=True
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # 3. Create or return access token
        access_token = supabase_token or create_access_token(
            data={"sub": user.id, "email": user.email, "role": user.role, "name": user.full_name}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "supabase_user_id": user.supabase_user_id
            }
        }

    async def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with email and password via Supabase Auth or local DB."""
        email = email.strip().lower()
        supabase_token = None
        supabase_user_id = None

        # 1. Try Supabase Auth if configured
        if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=password",
                        headers={
                            "apikey": settings.SUPABASE_ANON_KEY,
                            "Content-Type": "application/json"
                        },
                        json={"email": email, "password": password}
                    )
                    if resp.status_code == 200:
                        supa_data = resp.json()
                        supabase_token = supa_data.get("access_token")
                        supabase_user_id = supa_data.get("user", {}).get("id")
            except Exception:
                pass

        # 2. Check local database
        user = self.db.query(User).filter(User.email == email).first()

        # If user authenticated with Supabase but not in local DB, auto-provision
        if supabase_token and not user:
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                full_name=email.split("@")[0].title(),
                hashed_password=get_password_hash(password),
                supabase_user_id=supabase_user_id,
                role="user",
                is_active=True
            )
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)

        if not user:
            return None

        # If Supabase didn't authenticate, check local password hash
        if not supabase_token:
            if not user.hashed_password or not verify_password(password, user.hashed_password):
                return None

        access_token = supabase_token or create_access_token(
            data={"sub": user.id, "email": user.email, "role": user.role, "name": user.full_name}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "supabase_user_id": user.supabase_user_id
            }
        }

    async def get_user_from_token(self, token: str) -> Optional[User]:
        """Validate token and retrieve user from database."""
        if not token:
            return None

        # 1. Try local JWT decoding
        payload = decode_access_token(token)
        if payload:
            email = payload.get("email")
            user_id = payload.get("sub")
            if user_id:
                user = self.db.query(User).filter(User.id == user_id).first()
                if user:
                    return user
            if email:
                user = self.db.query(User).filter(User.email == email).first()
                if user:
                    return user

        # 2. Try validating via Supabase Auth API if configured
        if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.get(
                        f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
                        headers={
                            "apikey": settings.SUPABASE_ANON_KEY,
                            "Authorization": f"Bearer {token}"
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        supa_id = data.get("id")
                        supa_email = data.get("email")
                        user = self.db.query(User).filter(
                            (User.supabase_user_id == supa_id) | (User.email == supa_email)
                        ).first()
                        if not user and supa_email:
                            user = User(
                                id=str(uuid.uuid4()),
                                email=supa_email,
                                full_name=supa_email.split("@")[0].title(),
                                supabase_user_id=supa_id,
                                role="user",
                                is_active=True
                            )
                            self.db.add(user)
                            self.db.commit()
                            self.db.refresh(user)
                        return user
            except Exception:
                pass

        return None