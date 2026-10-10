"""
Audit log model for tracking changes and actions.
"""
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Index, func
from sqlalchemy.orm import relationship
from .base import Base


class AuditLog(Base):
    """Audit log model for tracking all important actions."""
    __tablename__ = "audit_log"
    
    # Core identification
    id = Column(String(36), primary_key=True, index=True)
    
    # What was acted upon
    entity = Column(String(50), nullable=False, index=True)  # invoice, document, reminder, etc.
    entity_id = Column(String(36), nullable=False, index=True)
    
    # What action was performed
    action = Column(String(50), nullable=False, index=True)  # created, extracted, validated, corrected, etc.
    
    # What changed (for field-level tracking)
    field_path = Column(String(200), nullable=True)  # JSON path to field that changed
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    
    # Who performed the action
    actor = Column(String(100), nullable=True)  # User ID, system, etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index("idx_audit_log_entity", "entity"),
        Index("idx_audit_log_entity_id", "entity_id"),
        Index("idx_audit_log_action", "action"),
        Index("idx_audit_log_field_path", "field_path"),
        Index("idx_audit_log_actor", "actor"),
        Index("idx_audit_log_created_at", "created_at"),
    )
