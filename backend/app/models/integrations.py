"""
Integrations model for tracking third-party service connections.
"""
from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, Index, func
from sqlalchemy.orm import relationship
from .base import Base


class Integration(Base):
    """Integration model for third-party services."""
    __tablename__ = "integrations"
    
    # Core identification
    provider = Column(String(50), nullable=False, index=True)  # google, whatsapp, email, etc.
    status = Column(String(20), nullable=False)  # connected, disconnected, error, etc.
    account_label = Column(String(100), nullable=True)  # User-friendly name for the account
    
    # Settings and tokens
    settings = Column(JSON, nullable=True)  # Provider-specific settings
    encrypted_tokens = Column(Text, nullable=True)  # Encrypted OAuth tokens
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index("idx_integrations_provider", "provider"),
        Index("idx_integrations_status", "status"),
    )
