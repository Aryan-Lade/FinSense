"""
Calendar Provider protocol and data structures.
Section 14: Confirm-before-create, recurring event, idempotent IDs.
"""
from typing import Protocol, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime


@dataclass
class CalendarEventData:
    title: str
    description: str
    start_time: datetime
    timezone: str
    rrule: Optional[str] = "RRULE:FREQ=DAILY;INTERVAL=2"
    idempotency_key: str = ""
    review_link: Optional[str] = None


class CalendarProvider(Protocol):
    """Protocol for calendar synchronization providers."""
    name: str

    def create_event(self, event: CalendarEventData) -> str:
        """Create recurring event and return provider event ID."""
        ...

    def update_event(self, event_id: str, event: CalendarEventData) -> bool:
        """Update or reschedule event."""
        ...

    def delete_event(self, event_id: str) -> bool:
        """Delete or cancel event."""
        ...
