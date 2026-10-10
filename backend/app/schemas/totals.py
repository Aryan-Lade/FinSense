"""
Invoice totals schema.
"""
from typing import Optional
from pydantic import Field
from .base import BaseSchema


class Totals(BaseSchema):
    """Invoice totals."""
    total_taxable_value: Optional[float] = Field(None, ge=0)
    total_cgst: Optional[float] = Field(None, ge=0)
    total_sgst: Optional[float] = Field(None, ge=0)
    total_igst: Optional[float] = Field(None, ge=0)
    total_cess: Optional[float] = Field(None, ge=0)
    total_tax: Optional[float] = Field(None, ge=0)
    round_off: Optional[float] = Field(None)
    total_amount: Optional[float] = Field(None, ge=0)
    amount_in_words: Optional[str] = Field(None, max_length=500)
