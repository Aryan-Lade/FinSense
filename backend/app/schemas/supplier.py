"""
Supplier schema.
"""
from typing import Optional, List
from pydantic import Field
from datetime import datetime
from .base import BaseSchema


class SupplierBase(BaseSchema):
    """Base supplier schema."""
    gstin: Optional[str] = Field(None, max_length=15)
    legal_name: Optional[str] = Field(None, max_length=255)
    trade_name: Optional[str] = Field(None, max_length=255)
    state: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None)


class SupplierCreate(SupplierBase):
    """Schema for creating a new supplier."""
    gstin: str = Field(..., max_length=15)
    legal_name: str = Field(..., max_length=255)


class SupplierUpdate(BaseSchema):
    """Schema for updating a supplier."""
    gstin: Optional[str] = Field(None, max_length=15)
    legal_name: Optional[str] = Field(None, max_length=255)
    trade_name: Optional[str] = Field(None, max_length=255)
    state: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None)


class SupplierResponse(SupplierBase):
    """Schema for supplier response."""
    id: str
    first_invoice_date: Optional[datetime] = None
    latest_invoice_date: Optional[datetime] = None
    invoice_count: int = 0
    total_purchase_value: float = 0.0
    average_purchase_value: float = 0.0
    validation_failure_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True