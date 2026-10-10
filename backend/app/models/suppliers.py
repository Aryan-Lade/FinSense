"""
Supplier model for storing supplier information and history.
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON, Index, func
from sqlalchemy.orm import relationship
from .base import Base
from .invoices import Invoice


class Supplier(Base):
    """Supplier model for storing supplier information."""
    __tablename__ = "suppliers"
    
    # Core identification
    gstin = Column(String(15), unique=True, index=True)  # Primary lookup
    legal_name = Column(String(255), index=True)
    trade_name = Column(String(255), index=True)
    state = Column(String(50))  # State name
    address = Column(Text)
    
    # Statistics
    first_invoice_date = Column(DateTime(timezone=True), nullable=True, index=True)
    latest_invoice_date = Column(DateTime(timezone=True), nullable=True, index=True)
    invoice_count = Column(Integer, default=0)
    total_purchase_value = Column(Float, default=0.0)
    average_purchase_value = Column(Float, default=0.0)
    
    # History tracking
    identity_history = Column(JSON, nullable=True)  # Track changes in identity over time
    validation_failure_count = Column(Integer, default=0)
    common_tax_rates = Column(JSON, nullable=True)  # Frequently used tax rates
    common_hsn_codes = Column(JSON, nullable=True)  # Frequently used HSN codes
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    invoices = relationship("Invoice", back_populates="supplier")
    
    # Indexes
    __table_args__ = (
        Index("idx_suppliers_gstin", "gstin"),
        Index("idx_suppliers_legal_name", "legal_name"),
        Index("idx_suppliers_first_invoice_date", "first_invoice_date"),
        Index("idx_suppliers_latest_invoice_date", "latest_invoice_date"),
    )
