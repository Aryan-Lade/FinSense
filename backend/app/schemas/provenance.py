"""
Provenance schema tracking extraction sources and confidence.
"""
from typing import Optional, Any, List
from pydantic import Field
from .base import BaseSchema


class FieldProvenance(BaseSchema):
    """Provenance information for a single field."""
    value: Optional[Any] = None
    confidence: float = Field(0.0, ge=0.0, le=1.0)
    source: Optional[str] = Field(
        None, 
        description="text_layer|ocr|vision_model|heuristic|spreadsheet|user_corrected|derived|simulated"
    )
    evidence: Optional[str] = Field(None, description="Description of where value was found")
    bbox: Optional[List[int]] = Field(None, description="[x0, y0, x1, y1] bounding box")
    page: Optional[int] = Field(None, ge=1, description="Page number (1-indexed)")
    original_text: Optional[str] = Field(None, description="Original extracted text before normalization")
    status: Optional[str] = Field(
        None, 
        description="accepted|needs_review|missing|invalid"
    )


class InvoiceProvenance(BaseSchema):
    """Provenance tracking for entire invoice."""
    # Field-level provenance would be stored as a dictionary mapping field paths to FieldProvenance
    # For simplicity in schema, we'll define common fields
    invoice_number: Optional[FieldProvenance] = None
    invoice_date: Optional[FieldProvenance] = None
    due_date: Optional[FieldProvenance] = None
    seller_gstin: Optional[FieldProvenance] = None
    buyer_gstin: Optional[FieldProvenance] = None
    total_amount: Optional[FieldProvenance] = None
    
    # Overall document confidence
    document_confidence: float = Field(0.0, ge=0.0, le=1.0)


Provenance = InvoiceProvenance
