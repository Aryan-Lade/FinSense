"""
Calendar Simulator for DEMO_MODE and offline operation.
Section 14: Labeled 'DEMO calendar', stores events deterministically.
"""
from typing import Dict, Any, Optional
import hashlib
from .calendar_base import CalendarProvider, CalendarEventData

_simulated_events: Dict[str, Dict[str, Any]] = {}


class CalendarSimulator:
    """Simulator provider storing calendar events in-memory and returning valid event IDs."""
    name: str = "simulator"

    def create_event(self, event: CalendarEventData) -> str:
        # Generate idempotent hex ID (Google allowed chars: a-v and 0-9)
        raw_key = event.idempotency_key or f"{event.title}_{event.start_time.isoformat()}"
        event_id = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()[:24]

        _simulated_events[event_id] = {
            "id": event_id,
            "title": event.title,
            "description": event.description,
            "start_time": event.start_time.isoformat(),
            "timezone": event.timezone,
            "rrule": event.rrule,
            "status": "confirmed",
            "provider": "simulator"
        }
        return event_id

    def update_event(self, event_id: str, event: CalendarEventData) -> bool:
        if event_id in _simulated_events:
            _simulated_events[event_id].update({
                "title": event.title,
                "start_time": event.start_time.isoformat(),
                "description": event.description
            })
            return True
        return False

    def delete_event(self, event_id: str) -> bool:
        if event_id in _simulated_events:
            del _simulated_events[event_id]
            return True
        return True

    @classmethod
    def get_all_events(cls) -> Dict[str, Dict[str, Any]]:
        return _simulated_events
