"""
Reminder schema.
"""
from typing import Optional, List
from pydantic import Field
from datetime import datetime
from .base import BaseSchema


class ReminderBase(BaseSchema):
    """Base reminder schema."""
    invoice_id: str
    rule_type: str = Field(..., max_length=20)  # after_receipt, before_due_date, on_due_date, custom, none
    interval_days: Optional[int] = Field(None, ge=0)  # For after_receipt rule
    repeat_every_days: Optional[int] = Field(None, ge=0)  # For repeating reminders
    first_fire_at: datetime
    next_fire_at: Optional[datetime] = None
    timezone: str = Field(default="Asia/Kolkata", max_length=50)
    status: str = Field(default="scheduled", max_length=20)  # draft, scheduled, completed, cancelled, failed
    calendar_sync_status: str = Field(default="not_connected", max_length=20)
    notification_channels: Optional[List[str]] = Field(default_factory=list)
    google_calendar_id: Optional[str] = Field(None, max_length=100)
    google_event_id: Optional[str] = Field(None, max_length=100)
    idempotency_key: str = Field(..., max_length=64)


class ReminderCreate(ReminderBase):
    """Schema for creating a new reminder."""
    pass


class ReminderUpdate(BaseSchema):
    """Schema for updating a reminder."""
    invoice_id: Optional[str] = None
    rule_type: Optional[str] = Field(None, max_length=20)
    interval_days: Optional[int] = Field(None, ge=0)
    repeat_every_days: Optional[int] = Field(None, ge=0)
    first_fire_at: Optional[datetime] = None
    next_fire_at: Optional[datetime] = None
    timezone: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=20)
    calendar_sync_status: Optional[str] = Field(None, max_length=20)
    notification_channels: Optional[List[str]] = None
    google_calendar_id: Optional[str] = Field(None, max_length=100)
    google_event_id: Optional[str] = Field(None, max_length=100)


class ReminderResponse(ReminderBase):
    """Schema for reminder response."""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReminderEventBase(BaseSchema):
    """Base reminder event schema."""
    reminder_id: str
    fire_at: datetime
    delivered_at: Optional[datetime] = None
    channel: str = Field(..., max_length=20)  # email, popup, etc.


class ReminderEventCreate(ReminderEventBase):
    """Schema for creating a reminder event."""
    pass


class ReminderEventResponse(ReminderEventBase):
    """Schema for reminder event response."""
    id: str
    reminder_id: str
    created_at: datetime

    class Config:
        from_attributes = True