"""
Reminder model for tracking payment reminders.
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, JSON, ForeignKey, Index, UniqueConstraint, func
from sqlalchemy.orm import relationship
from .base import Base
from .invoices import Invoice


class Reminder(Base):
    """Reminder model for payment reminders."""
    __tablename__ = "reminders"
    
    # Foreign key
    invoice_id = Column(String(36), ForeignKey("invoices.id"), nullable=False, index=True)
    
    # Reminder configuration
    rule_type = Column(String(20), nullable=False)  # after_receipt, before_due_date, on_due_date, custom, none
    interval_days = Column(Integer, nullable=True)  # For after_receipt rule
    repeat_every_days = Column(Integer, nullable=True)  # For repeating reminders
    first_fire_at = Column(DateTime(timezone=True), nullable=False, index=True)
    next_fire_at = Column(DateTime(timezone=True), nullable=True, index=True)
    timezone = Column(String(50), default="Asia/Kolkata")
    
    # Status tracking
    status = Column(String(20), default="scheduled")  # draft, scheduled, completed, cancelled, failed
    calendar_sync_status = Column(String(20), default="not_connected")  # not_connected, pending_confirmation, sync_pending, synced, failed, cancelled
    
    # Notification settings
    notification_channels = Column(JSON, nullable=True)  # List of channels: email, popup, etc.
    
    # Google Calendar integration
    google_calendar_id = Column(String(100), nullable=True)  # Calendar ID
    google_event_id = Column(String(100), nullable=True)  # Event ID in Google Calendar
    idempotency_key = Column(String(64), nullable=False, unique=True, index=True)  # For preventing duplicates
    
    # Tracking
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    last_error = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    invoice = relationship("Invoice", back_populates="reminders")
    reminder_events = relationship("ReminderEvent", back_populates="reminder", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("idx_reminders_invoice_id", "invoice_id"),
        Index("idx_reminders_next_fire_at", "next_fire_at"),
        Index("idx_reminders_status", "status"),
        Index("idx_reminders_calendar_sync_status", "calendar_sync_status"),
        Index("idx_reminders_idempotency_key", "idempotency_key"),
    )


class ReminderEvent(Base):
    """Reminder event tracking for when reminders were actually sent."""
    __tablename__ = "reminder_events"
    
    id = Column(String(36), primary_key=True, index=True)
    reminder_id = Column(String(36), ForeignKey("reminders.id"), nullable=False, index=True)
    
    fire_at = Column(DateTime(timezone=True), nullable=False, index=True)  # When it was supposed to fire
    delivered_at = Column(DateTime(timezone=True), nullable=True)  # When it was actually sent
    channel = Column(String(20), nullable=False)  # email, popup, etc.
    
    # Relationship
    reminder = relationship("Reminder", back_populates="reminder_events")
    
    # Indexes
    __table_args__ = (
        Index("idx_reminder_events_reminder_id", "reminder_id"),
        Index("idx_reminder_events_fire_at", "fire_at"),
        Index("idx_reminder_events_delivered_at", "delivered_at"),
        UniqueConstraint("reminder_id", "fire_at", name="uq_reminder_event_fire_at"),
    )
