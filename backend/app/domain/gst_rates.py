"""
GST rates configuration.
"""
from typing import List
from app.core.config import settings


def get_gst_slabs() -> List[float]:
    """Get GST slabs from settings."""
    return settings.GST_SLABS


def is_valid_gst_rate(rate: float) -> bool:
    """Check if a GST rate is valid according to configured slabs."""
    return rate in get_gst_slabs()


def get_valid_gst_rates() -> List[float]:
    """Get list of valid GST rates."""
    return get_gst_slabs()
