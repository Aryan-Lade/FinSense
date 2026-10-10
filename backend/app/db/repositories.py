# Database repository layer for FinSense
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, text
from datetime import datetime, timedelta

from app.models.documents import Document
from app.models.invoices import Invoice, InvoiceItem
from app.models.suppliers import Supplier
from app.models.reminders import Reminder, ReminderEvent
from app.models.batches import Batch, BatchItem
from app.models.channels import ChannelMessage
from app.models.integrations import Integration
from app.models.audit import AuditLog
from app.models.review_notes import ReviewNote


class DocumentRepository:
    """Repository for document operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, document_data: Dict[str, Any]) -> Document:
        """Create a new document record."""
        document = Document(**document_data)
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document
    
    def get_by_id(self, document_id: str) -> Optional[Document]:
        """Get document by ID."""
        return self.db.query(Document).filter(Document.id == document_id).first()
    
    def get_by_sha256(self, sha256: str) -> Optional[Document]:
        """Get document by SHA256 hash."""
        return self.db.query(Document).filter(Document.sha256 == sha256).first()
    
    def list_by_status(self, status: str, limit: int = 100) -> List[Document]:
        """List documents by processing status."""
        return self.db.query(Document)\
            .filter(Document.processing_status == status)\
            .order_by(desc(Document.created_at))\
            .limit(limit)\
            .all()
    
    def update_status(self, document_id: str, status: str, error_message: Optional[str] = None) -> Optional[Document]:
        """Update document processing status."""
        document = self.get_by_id(document_id)
        if document:
            document.processing_status = status
            if error_message is not None:
                document.error_message = error_message
            self.db.commit()
            self.db.refresh(document)
        return document
class InvoiceRepository:
    """Repository for invoice operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, invoice_data: Dict[str, Any]) -> Invoice:
        """Create a new invoice record."""
        invoice = Invoice(**invoice_data)
        self.db.add(invoice)
        self.db.commit()
        self.db.refresh(invoice)
        return invoice
    
    def get_by_id(self, invoice_id: str) -> Optional[Invoice]:
        """Get invoice by ID."""
        return self.db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    def get_by_document_id(self, document_id: str) -> List[Invoice]:
        """Get all invoices for a document."""
        return self.db.query(Invoice)\
            .filter(Invoice.document_id == document_id)\
            .order_by(Invoice.group_index)\
            .all()
    
    def list(
        self, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Invoice]:
        """List invoices with optional filtering."""
        query = self.db.query(Invoice)
        
        if filters:
            if filters.get("supplier_name"):
                query = query.filter(Invoice.supplier_name.ilike(f"%{filters['supplier_name']}%"))
            if filters.get("payment_status"):
                query = query.filter(Invoice.payment_status == filters["payment_status"])
            if filters.get("review_status"):
                query = query.filter(Invoice.review_status == filters["review_status"])
            if filters.get("validation_status"):
                query = query.filter(Invoice.validation_status == filters["validation_status"])
            if filters.get("date_from"):
                query = query.filter(Invoice.invoice_date >= filters["date_from"])
            if filters.get("date_to"):
                query = query.filter(Invoice.invoice_date <= filters["date_to"])
            if filters.get("min_amount"):
                query = query.filter(Invoice.total_amount >= filters["min_amount"])
            if filters.get("max_amount"):
                query = query.filter(Invoice.total_amount <= filters["max_amount"])
            if filters.get("overdue_only"):
                query = query.filter(
                    and_(
                        Invoice.payment_status == "unpaid",
                        Invoice.due_date < datetime.now()
                    )
                )
        
        return query.order_by(desc(Invoice.created_at)).offset(skip).limit(limit).all()
    
    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count invoices with optional filtering."""
        query = self.db.query(func.count(Invoice.id))
        
        if filters:
            if filters.get("supplier_name"):
                query = query.filter(Invoice.supplier_name.ilike(f"%{filters['supplier_name']}%"))
            if filters.get("payment_status"):
                query = query.filter(Invoice.payment_status == filters["payment_status"])
            if filters.get("review_status"):
                query = query.filter(Invoice.review_status == filters["review_status"])
            if filters.get("validation_status"):
                query = query.filter(Invoice.validation_status == filters["validation_status"])
            if filters.get("date_from"):
                query = query.filter(Invoice.invoice_date >= filters["date_from"])
            if filters.get("date_to"):
                query = query.filter(Invoice.invoice_date <= filters["date_to"])
            if filters.get("min_amount"):
                query = query.filter(Invoice.total_amount >= filters["min_amount"])
            if filters.get("max_amount"):
                query = query.filter(Invoice.total_amount <= filters["max_amount"])
            if filters.get("overdue_only"):
                query = query.filter(
                    and_(
                        Invoice.payment_status == "unpaid",
                        Invoice.due_date < datetime.now()
                    )
                )
        
        return query.scalar()
    
    def update(self, invoice_id: str, update_data: Dict[str, Any]) -> Optional[Invoice]:
        """Update an invoice."""
        invoice = self.get_by_id(invoice_id)
        if invoice:
            for key, value in update_data.items():
                if hasattr(invoice, key):
                    setattr(invoice, key, value)
            self.db.commit()
            self.db.refresh(invoice)
        return invoice
    
    def update_statuses(
        self, 
        invoice_id: str, 
        processing_status: Optional[str] = None,
        validation_status: Optional[str] = None,
        review_status: Optional[str] = None,
        payment_status: Optional[str] = None
    ) -> Optional[Invoice]:
        """Update invoice status fields."""
        invoice = self.get_by_id(invoice_id)
        if invoice:
            if processing_status is not None:
                invoice.processing_status = processing_status
            if validation_status is not None:
                invoice.validation_status = validation_status
            if review_status is not None:
                invoice.review_status = review_status
            if payment_status is not None:
                invoice.payment_status = payment_status
                if payment_status == "paid":
                    invoice.paid_at = datetime.now()
                elif payment_status == "unpaid":
                    invoice.paid_at = None
            self.db.commit()
            self.db.refresh(invoice)
        return invoice
class SupplierRepository:
    """Repository for supplier operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, supplier_data: Dict[str, Any]) -> Supplier:
        """Create a new supplier record."""
        supplier = Supplier(**supplier_data)
        self.db.add(supplier)
        self.db.commit()
        self.db.refresh(supplier)
        return supplier
    
    def get_by_id(self, supplier_id: str) -> Optional[Supplier]:
        """Get supplier by ID."""
        return self.db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    def get_by_gstin(self, gstin: str) -> Optional[Supplier]:
        """Get supplier by GSTIN."""
        return self.db.query(Supplier).filter(Supplier.gstin == gstin).first()
    
    def list(self, skip: int = 0, limit: int = 100) -> List[Supplier]:
        """List suppliers."""
        return self.db.query(Supplier)\
            .order_by(desc(Supplier.created_at))\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    def update(self, supplier_id: str, update_data: Dict[str, Any]) -> Optional[Supplier]:
        """Update a supplier."""
        supplier = self.get_by_id(supplier_id)
        if supplier:
            for key, value in update_data.items():
                if hasattr(supplier, key):
                    setattr(supplier, key, value)
            self.db.commit()
            self.db.refresh(supplier)
        return supplier
class ReminderRepository:
    """Repository for reminder operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, reminder_data: Dict[str, Any]) -> Reminder:
        """Create a new reminder record."""
        reminder = Reminder(**reminder_data)
        self.db.add(reminder)
        self.db.commit()
        self.db.refresh(reminder)
        return reminder
    
    def get_by_id(self, reminder_id: str) -> Optional[Reminder]:
        """Get reminder by ID."""
        return self.db.query(Reminder).filter(Reminder.id == reminder_id).first()
    
    def get_by_invoice_id(self, invoice_id: str) -> List[Reminder]:
        """Get all reminders for an invoice."""
        return self.db.query(Reminder)\
            .filter(Reminder.invoice_id == invoice_id)\
            .order_by(Reminder.created_at)\
            .all()
    
    def get_due_reminders(self, now: datetime) -> List[Reminder]:
        """Get reminders that are due to fire."""
        return self.db.query(Reminder)\
            .filter(
                and_(
                    Reminder.status == "scheduled",
                    Reminder.next_fire_at <= now
                )
            )\
            .join(Invoice)\
            .filter(Invoice.payment_status == "unpaid")\
            .all()
    
    def update_next_fire(self, reminder_id: str, next_fire_at: datetime) -> Optional[Reminder]:
        """Update the next fire time for a reminder."""
        reminder = self.get_by_id(reminder_id)
        if reminder:
            reminder.next_fire_at = next_fire_at
            self.db.commit()
            self.db.refresh(reminder)
        return reminder
    
    def update_status(self, reminder_id: str, status: str) -> Optional[Reminder]:
        """Update reminder status."""
        reminder = self.get_by_id(reminder_id)
        if reminder:
            reminder.status = status
            self.db.commit()
            self.db.refresh(reminder)
        return reminder


# Export repository instances for dependency injection
def get_document_repository(db: Session) -> DocumentRepository:
    return DocumentRepository(db)

def get_invoice_repository(db: Session) -> InvoiceRepository:
    return InvoiceRepository(db)

def get_supplier_repository(db: Session) -> SupplierRepository:
    return SupplierRepository(db)

def get_reminder_repository(db: Session) -> ReminderRepository:
    return ReminderRepository(db)
