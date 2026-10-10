"""
Invoice schemas for CRUD operations and API responses.
"""
from typing import Optional, List, Dict, Any
from pydantic import Field
from datetime import datetime
from .base import BaseSchema


class InvoiceBase(BaseSchema):
    """Base invoice schema."""
    bill_number: Optional[str] = Field(None, max_length=50)
    document_category: Optional[str] = Field("gst_invoice", max_length=20)
    supplier_name: Optional[str] = Field(None, max_length=255)
    buyer_name: Optional[str] = Field(None, max_length=255)
    invoice_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    currency: Optional[str] = Field("INR", max_length=3)
    subtotal: Optional[float] = 0.0
    tax_amount: Optional[float] = 0.0
    total_amount: float = Field(..., ge=0.0)
    processing_status: Optional[str] = "queued"
    validation_status: Optional[str] = "not_run"
    review_status: Optional[str] = "not_required"
    payment_status: Optional[str] = "unpaid"


class InvoiceCreate(InvoiceBase):
    """Schema for creating an invoice."""
    document_id: str
    canonical_json: Optional[Any] = None
    provenance_json: Optional[Any] = None
    validation_json: Optional[Any] = None
    suggestions_json: Optional[Any] = None


class InvoiceUpdate(BaseSchema):
    """Schema for updating an invoice."""
    bill_number: Optional[str] = None
    supplier_name: Optional[str] = None
    buyer_name: Optional[str] = None
    invoice_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    payment_status: Optional[str] = None
    paid_at: Optional[datetime] = None
    payment_note: Optional[str] = None
    review_status: Optional[str] = None
    assignee: Optional[str] = None
    approved_with_override: Optional[bool] = None


class InvoiceResponse(InvoiceBase):
    """Schema for invoice response."""
    id: str
    document_id: str
    supplier_id: Optional[str] = None
    paid_at: Optional[datetime] = None
    payment_note: Optional[str] = None
    review_reasons: Optional[List[str]] = None
    priority_score: int = 0
    assignee: Optional[str] = None
    canonical_json: Optional[Any] = None
    provenance_json: Optional[Any] = None
    validation_json: Optional[Any] = None
    suggestions_json: Optional[Any] = None
    processing_info_json: Optional[Any] = None
    approved_with_override: bool = False
    created_at: datetime
    updated_at: datetime
