"""
Authentication service for managing user authentication and authorization.
"""
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.errors import ProcessingException
from app.db.session import get_db
from sqlalchemy.orm import Session
import uuid


class AuthService:
    """Service for handling authentication and authorization."""

    def __init__(self, db: Session):
        self.db = db

    def authenticate_user(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate a user with username and password."""
        try:
            # In a real implementation, we would query the user from the database
            # For now, we'll use a simplified approach with a demo user

            # Demo user credentials (in production, these would come from DB)
            demo_username = "demo@finsense.com"
            demo_password_hash = get_password_hash("demopassword123")  # Hash of "demopassword123"

            if username == demo_username and verify_password(password, demo_password_hash):
                # Create access token
                access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
                access_token = create_access_token(
                    data={"sub": username}, expires_delta=access_token_expires
                )

                return {
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": {
                        "id": "demo-user-id",
                        "username": username,
                        "email": username,
                        "full_name": "Demo User",
                        "is_active": True,
                        "roles": ["user"]
                    },
                    "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
                }

            return None

        except Exception as e:
            raise ProcessingException(f"Authentication failed: {str(e)}", "authentication_error")

    def create_access_token(self, user_data: Dict[str, Any]) -> str:
        """Create an access token for a user."""
        try:
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user_data.get("username", "unknown")},
                expires_delta=access_token_expires
            )
            return access_token
        except Exception as e:
            raise ProcessingException(f"Failed to create access token: {str(e)}", "token_creation_error")

    def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate an access token and return user data."""
        try:
            # In a real implementation, we would decode and validate the JWT
            # For now, we'll return a simplified response
            # This would typically involve checking the token signature, expiration, etc.

            # For demo purposes, if token starts with "demo", we'll accept it
            if token.startswith("demo"):
                return {
                    "user_id": "demo-user-id",
                    "username": "demo@finsense.com",
                    "email": "demo@finsense.com",
                    "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
                }

            return None
        except Exception:
            return None


def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    """Convenience function to authenticate a user."""
    db_gen = get_db()
    db = next(db_gen)
    try:
        service = AuthService(db)
        return service.authenticate_user(username, password)
    finally:
        db.close()


def create_access_token_for_user(user_data: Dict[str, Any]) -> str:
    """Convenience function to create an access token."""
    db_gen = get_db()
    db = next(db_gen)
    try:
        service = AuthService(db)
        return service.create_access_token(user_data)
    finally:
        db.close()