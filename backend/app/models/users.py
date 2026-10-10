"""
User model for authentication and role management.
Supports both local credentials and Supabase Auth.
"""
from sqlalchemy import Column, String, Boolean, DateTime, func, Index
from app.models.base import Base


class User(Base):
    """User database model."""
    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    supabase_user_id = Column(String(100), unique=True, nullable=True, index=True)
    role = Column(String(50), default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    __table_args__ = (
        Index("idx_users_email", "email"),
        Index("idx_users_supabase_user_id", "supabase_user_id"),
    )
