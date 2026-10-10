"""
Invoice metadata schema.
"""
from typing import Optional, List
from pydantic import Field
from .base import BaseSchema


class InvoiceMeta(BaseSchema):
    """Invoice metadata."""
    document_category: Optional[str] = Field(
        None, 
        description="gst_invoice, utility_bill, receipt, other"
    )
    invoice_number: Optional[str] = Field(None, max_length=50)
    invoice_date: Optional[str] = Field(None, description="YYYY-MM-DD format")
    due_date: Optional[str] = Field(None, description="YYYY-MM-DD format")
    currency: str = Field("INR", max_length=3)
    invoice_type: Optional[str] = Field(None, max_length=50)
    place_of_supply_code: Optional[str] = Field(None, max_length=2)
    place_of_supply_state: Optional[str] = Field(None, max_length=50)
    reverse_charge: bool = Field(False)
    po_number: Optional[str] = Field(None, max_length=50)
    payment_terms: Optional[str] = Field(None, max_length=200)
    language_detected: List[str] = Field(default_factory=list)
