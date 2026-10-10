"""
Main invoice schema combining all components.
"""
from typing import Optional, List
from pydantic import Field
from .base import BaseSchema
from .party import Party
from .invoice_meta import InvoiceMeta
from .line_item import LineItem
from .totals import Totals


class Invoice(BaseSchema):
    """Complete invoice schema."""
    meta: InvoiceMeta
    seller: Party
    buyer: Party
    items: List[LineItem] = Field(default_factory=list)
    totals: Totals
    
    # Additional fields for provenance and validation (will be added in DB model)
    # These are computed or stored separately
    
    class Config:
        json_schema_extra = {
            "example": {
                "meta": {
                    "document_category": "gst_invoice",
                    "invoice_number": "INV-2024-001",
                    "invoice_date": "2024-01-15",
                    "due_date": "2024-02-15",
                    "currency": "INR"
                },
                "seller": {
                    "legal_name": "ABC Company Ltd.",
                    "gstin": "27AAPFU0939F1ZV",
                    "state_code": "27"
                },
                "buyer": {
                    "legal_name": "XYZ Enterprises",
                    "state_code": "29"
                },
                "items": [
                    {
                        "line_no": 1,
                        "description": "Software Development Services",
                        "hsn_code": "9983",
                        "quantity": 1,
                        "rate": 50000.0,
                        "taxable_value": 50000.0,
                        "cgst_rate": 9.0,
                        "sgst_rate": 9.0,
                        "cgst_amount": 4500.0,
                        "sgst_amount": 4500.0,
                        "total_amount": 59000.0
                    }
                ],
                "totals": {
                    "total_taxable_value": 50000.0,
                    "total_cgst": 4500.0,
                    "total_sgst": 4500.0,
                    "total_igst": 0.0,
                    "total_cess": 0.0,
                    "total_tax": 9000.0,
                    "total_amount": 59000.0
                }
            }
        }
