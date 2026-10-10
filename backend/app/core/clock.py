"""
FinSense clock utilities for demo mode and time management.
"""
from datetime import datetime, timezone, timedelta
from typing import Optional
import time


class Clock:
    """Clock that can be adjusted for demo mode."""
    
    def __init__(self):
        self._offset_seconds = 0
        self._is_frozen = False
        self._frozen_time: Optional[datetime] = None
    
    def now(self) -> datetime:
        """Get current time, adjusted for any offset or freezing."""
        if self._is_frozen and self._frozen_time is not None:
            return self._frozen_time
        
        utc_now = datetime.now(timezone.utc)
        return utc_now + timedelta(seconds=self._offset_seconds)
    
    def set_offset(self, seconds: int) -> None:
        """Set time offset in seconds (for demo mode)."""
        self._offset_seconds = seconds
    
    def freeze(self, dt: Optional[datetime] = None) -> None:
        """Freeze time at a specific point or current time."""
        if dt is None:
            dt = self.now()
        self._frozen_time = dt
        self._is_frozen = True
    
    def unfreeze(self) -> None:
        """Unfreeze time to return to real time."""
        self._is_frozen = False
        self._frozen_time = None
    
    def advance(self, seconds: int) -> None:
        """Advance the frozen time by specified seconds."""
        if self._is_frozen and self._frozen_time is not None:
            self._frozen_time += timedelta(seconds=seconds)
        else:
            self.set_offset(self._offset_seconds + seconds)


# Global clock instance
clock = Clock()


def now() -> datetime:
    """Get current time using the global clock."""
    return clock.now()


# For backwards compatibility
def utc_now() -> datetime:
    """Get current UTC time."""
    return datetime.now(timezone.utc)


get_current_time = now
