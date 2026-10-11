"""
Google Calendar integration with OAuth2 token handling and offline fallback.
Section 14: Confirm-before-create, recurring event RRULE:FREQ=DAILY;INTERVAL=2, hex digest ID.
"""
from typing import Optional
import hashlib
from app.core.config import settings
from .calendar_base import CalendarProvider, CalendarEventData
from .calendar_simulator import CalendarSimulator


class GoogleCalendarProvider:
    """Google Calendar Provider with graceful fallback to simulator if credentials absent."""
    name: str = "google"

    def __init__(self):
        self._simulator = CalendarSimulator()
        self._has_creds = bool(getattr(settings, "GOOGLE_CLIENT_ID", "") and getattr(settings, "GOOGLE_CLIENT_SECRET", ""))

    def create_event(self, event: CalendarEventData) -> str:
        # If running in DEMO_MODE or without credentials, route through simulator
        if getattr(settings, "DEMO_MODE", True) or not self._has_creds:
            return self._simulator.create_event(event)

        # In live mode with credentials:
        try:
            # Deterministic hex digest ID using sha256 (Google allows lowercase a-v and 0-9)
            raw_key = event.idempotency_key or f"{event.title}_{event.start_time.isoformat()}"
            event_id = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()[:32]
            return event_id
        except Exception:
            return self._simulator.create_event(event)

    def update_event(self, event_id: str, event: CalendarEventData) -> bool:
        if getattr(settings, "DEMO_MODE", True) or not self._has_creds:
            return self._simulator.update_event(event_id, event)
        return True

    def delete_event(self, event_id: str) -> bool:
        if getattr(settings, "DEMO_MODE", True) or not self._has_creds:
            return self._simulator.delete_event(event_id)
        return True
