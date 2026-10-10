"""
Invoice model for storing extracted invoice data.
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, Index, UniqueConstraint, func
from sqlalchemy.orm import relationship
from .base import Base
from .documents import Document


class Invoice(Base):
    """Invoice model for extracted invoice data."""
    __tablename__ = "invoices"
    
    # Foreign keys
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False, index=True)
    group_index = Column(Integer, default=0)  # For multiple invoices in one document
    
    # Core invoice fields (matching schemas)
    document_category = Column(String(20))  # gst_invoice, utility_bill, receipt, other
    bill_number = Column(String(50), index=True)  # For display/search
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=True, index=True)
    supplier_name = Column(String(255), index=True)
    buyer_name = Column(String(255), index=True)
    invoice_date = Column(DateTime(timezone=True), index=True)
    due_date = Column(DateTime(timezone=True), index=True)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())  # aka received_at
    currency = Column(String(3), default="INR")
    
    # Financials
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False, index=True)
    
    # Status tracking
    processing_status = Column(String(20), default="queued")  # queued, processing, completed, failed
    validation_status = Column(String(20), default="not_run")  # not_run, valid, warnings, invalid
    review_status = Column(String(20), default="not_required")  # not_required, needs_review, in_review, approved, approved_with_override, rejected
    payment_status = Column(String(10), default="unpaid")  # unpaid, paid
    
    # Additional data
    paid_at = Column(DateTime(timezone=True), nullable=True)
    payment_note = Column(Text, nullable=True)
    review_reasons = Column(JSON, nullable=True)  # List of review reason enums
    priority_score = Column(Integer, default=0, index=True)
    assignee = Column(String(100), nullable=True)
    
    # JSON fields for extended data
    canonical_json = Column(JSON, nullable=True)  # Canonical invoice data
    provenance_json = Column(JSON, nullable=True)  # Provenance information
    validation_json = Column(JSON, nullable=True)  # Validation results
    suggestions_json = Column(JSON, nullable=True)  # Validation suggestions
    processing_info_json = Column(JSON, nullable=True)  # Processing metadata
    approved_with_override = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    document = relationship("Document", back_populates="invoices")
    supplier = relationship("Supplier", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="invoice", cascade="all, delete-orphan")
    review_notes = relationship("ReviewNote", back_populates="invoice", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("idx_invoices_document_id", "document_id"),
        Index("idx_invoices_bill_number", "bill_number"),
        Index("idx_invoices_supplier_name", "supplier_name"),
        Index("idx_invoices_invoice_date", "invoice_date"),
        Index("idx_invoices_due_date", "due_date"),
        Index("idx_invoices_total_amount", "total_amount"),
        Index("idx_invoices_payment_status", "payment_status"),
        Index("idx_invoices_review_status", "review_status"),
        Index("idx_invoices_validation_status", "validation_status"),
        Index("idx_invoices_priority_score", "priority_score"),
        Index("idx_invoices_created_at", "created_at"),
        UniqueConstraint("document_id", "group_index", name="uq_invoice_document_group"),
    )


class InvoiceItem(Base):
    """Invoice line items for querying and exports."""
    __tablename__ = "invoice_items"
    
    id = Column(String(36), primary_key=True, index=True)
    invoice_id = Column(String(36), ForeignKey("invoices.id"), nullable=False, index=True)
    
    # Line item data
    line_no = Column(Integer, nullable=False)
    description = Column(String(500))
    hsn_code = Column(String(20))
    quantity = Column(Float)
    unit = Column(String(50))
    unit_price = Column(Float)  # Rate before discount
    tax_rate = Column(Float)  # Combined tax rate
    tax_amount = Column(Float)
    line_total = Column(Float)  # Total for this line item
    
    # Relationship
    invoice = relationship("Invoice", back_populates="items")
    
    # Indexes
    __table_args__ = (
        Index("idx_invoice_items_invoice_id", "invoice_id"),
        Index("idx_invoice_items_line_no", "line_no"),
    )
