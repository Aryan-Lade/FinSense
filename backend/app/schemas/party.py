"""
Party schema for seller/buyer information.
"""
from typing import Optional
from pydantic import Field
from .base import BaseSchema


class Party(BaseSchema):
    """Party information (seller or buyer)."""
    legal_name: Optional[str] = Field(None, max_length=255)
    trade_name: Optional[str] = Field(None, max_length=255)
    gstin: Optional[str] = Field(None, max_length=15)
    address: Optional[str] = Field(None, max_length=500)
    state_code: Optional[str] = Field(None, max_length=2)
    state_name: Optional[str] = Field(None, max_length=50)
    pan: Optional[str] = Field(None, max_length=10)
    
    # Computed properties
    @property
    def is_gst_registered(self) -> bool:
        """Check if party has GSTIN."""
        return bool(self.gstin and len(self.gstin) == 15)
