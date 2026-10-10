"""
Line item schema for invoice details.
"""
from typing import Optional
from pydantic import Field
from .base import BaseSchema


class LineItem(BaseSchema):
    """Invoice line item."""
    line_no: int = Field(..., ge=1)
    description: Optional[str] = Field(None, max_length=500)
    hsn_code: Optional[str] = Field(None, max_length=20)
    quantity: Optional[float] = Field(None, ge=0)
    unit: Optional[str] = Field(None, max_length=50)
    rate: Optional[float] = Field(None, ge=0)
    discount: Optional[float] = Field(None, ge=0)
    taxable_value: Optional[float] = Field(None, ge=0)
    cgst_rate: Optional[float] = Field(None, ge=0)
    sgst_rate: Optional[float] = Field(None, ge=0)
    igst_rate: Optional[float] = Field(None, ge=0)
    cess_rate: Optional[float] = Field(None, ge=0)
    cgst_amount: Optional[float] = Field(None, ge=0)
    sgst_amount: Optional[float] = Field(None, ge=0)
    igst_amount: Optional[float] = Field(None, ge=0)
    cess_amount: Optional[float] = Field(None, ge=0)
    total_amount: Optional[float] = Field(None, ge=0)
