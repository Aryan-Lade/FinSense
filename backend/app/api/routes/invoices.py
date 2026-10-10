"""
Invoice management API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.invoices import Invoice
from app.repositories.invoices import InvoiceRepository
from app.schemas.invoices import InvoiceCreate, InvoiceUpdate, InvoiceResponse

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice: InvoiceCreate,
    db: Session = Depends(get_db)
):
    """Create a new invoice."""
    repo = InvoiceRepository(db)
    return repo.create(invoice)


@router.get("/", response_model=List[InvoiceResponse])
async def list_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    supplier_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """List invoices with optional filtering."""
    repo = InvoiceRepository(db)
    if supplier_id:
        return repo.get_by_supplier(supplier_id, skip=skip, limit=limit)
    return repo.get_multi(skip=skip, limit=limit)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific invoice by ID."""
    repo = InvoiceRepository(db)
    invoice = repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: str,
    invoice_update: InvoiceUpdate,
    db: Session = Depends(get_db)
):
    """Update an invoice."""
    repo = InvoiceRepository(db)
    invoice = repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return repo.update(invoice_id, invoice_update)


@router.post("/{invoice_id}/mark-paid", response_model=InvoiceResponse)
async def mark_invoice_paid(
    invoice_id: str,
    db: Session = Depends(get_db)
):
    """Mark invoice as paid."""
    import datetime
    repo = InvoiceRepository(db)
    invoice = repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return repo.update(invoice_id, {
        "payment_status": "paid",
        "paid_at": datetime.datetime.now(datetime.timezone.utc)
    })


@router.post("/{invoice_id}/mark-unpaid", response_model=InvoiceResponse)
async def mark_invoice_unpaid(
    invoice_id: str,
    db: Session = Depends(get_db)
):
    """Mark invoice as unpaid."""
    repo = InvoiceRepository(db)
    invoice = repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return repo.update(invoice_id, {
        "payment_status": "unpaid",
        "paid_at": None
    })


@router.post("/{invoice_id}/approve", response_model=InvoiceResponse)
async def approve_invoice(
    invoice_id: str,
    db: Session = Depends(get_db)
):
    """Approve an invoice in the review queue."""
    repo = InvoiceRepository(db)
    invoice = repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return repo.update(invoice_id, {
        "review_status": "approved"
    })


@router.post("/{invoice_id}/reject", response_model=InvoiceResponse)
async def reject_invoice(
    invoice_id: str,
    db: Session = Depends(get_db)
):
    """Reject an invoice."""
    repo = InvoiceRepository(db)
    invoice = repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return repo.update(invoice_id, {
        "review_status": "rejected"
    })


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: str,
    db: Session = Depends(get_db)
):
    """Delete an invoice."""
    repo = InvoiceRepository(db)
    invoice = repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    repo.delete(invoice_id)
    return None


@router.get("/{invoice_id}/status")
async def get_invoice_status(
    invoice_id: str,
    db: Session = Depends(get_db)
):
    """Get invoice processing status."""
    repo = InvoiceRepository(db)
    invoice = repo.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {
        "invoice_id": invoice.id,
        "processing_status": invoice.processing_status,
        "validation_status": invoice.validation_status,
        "review_status": invoice.review_status,
        "payment_status": invoice.payment_status
    }