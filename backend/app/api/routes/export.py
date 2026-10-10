"""
Export API routes for downloading reports and data.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List
import datetime
import io
from app.core.database import get_db
from app.db.repositories import get_document_repository, get_invoice_repository
from app.services.export_service import export_data, export_invoices
from app.core.errors import ProcessingException


router = APIRouter(prefix="/export", tags=["export"])


def get_db_session():
    """Dependency to get database session."""
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()


@router.get("/invoices/csv")
async def export_invoices_csv(
    limit: int = Query(100, ge=1, le=10000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db_session)
):
    """Export invoices to CSV format."""
    try:
        # Get invoice repository
        invoice_repo = get_invoice_repository(db)

        # Get invoices with pagination
        invoices = invoice_repo.get_multi(skip=offset, limit=limit)

        # Convert to dictionary format for export
        invoice_dicts = []
        for invoice in invoices:
            if hasattr(invoice, '__dict__'):
                # Convert SQLAlchemy model to dict
                invoice_dict = {}
                for key, value in invoice.__dict__.items():
                    if not key.startswith('_'):
                        invoice_dict[key] = value
                invoice_dicts.append(invoice_dict)
            else:
                invoice_dicts.append(invoice)

        # Export to CSV
        csv_data = export_invoices(invoice_dicts)

        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(csv_data),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=invoices_{len(invoice_dicts)}.csv"}
        )

    except Exception as e:
        raise ProcessingException(f"Failed to export invoices: {str(e)}", "export_error")


@router.get("/documents/csv")
async def export_documents_csv(
    limit: int = Query(100, ge=1, le=10000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db_session)
):
    """Export documents to CSV format."""
    try:
        # Get document repository
        doc_repo = get_document_repository(db)

        # Get documents with pagination
        documents = doc_repo.get_multi(skip=offset, limit=limit)

        # Convert to dictionary format for export
        document_dicts = []
        for doc in documents:
            if hasattr(doc, '__dict__'):
                # Convert SQLAlchemy model to dict
                doc_dict = {}
                for key, value in doc.__dict__.items():
                    if not key.startswith('_'):
                        doc_dict[key] = value
                doc_dicts.append(doc_dict)
            else:
                document_dicts.append(doc)

        # Export to CSV
        csv_data = export_data(document_dicts, "csv")

        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(csv_data),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=documents_{len(document_dicts)}.csv"}
        )

    except Exception as e:
        raise ProcessingException(f"Failed to export documents: {str(e)}", "export_error")


@router.get("/dashboard/json")
async def export_dashboard_json(
    db: Session = Depends(get_db_session)
):
    """Export dashboard data to JSON format."""
    try:
        # Get repositories
        doc_repo = get_document_repository(db)
        invoice_repo = get_invoice_repository(db)
        from app.db.repositories import get_supplier_repository, get_reminder_repository
        supplier_repo = get_supplier_repository(db)
        reminder_repo = get_reminder_repository(db)

        # Collect dashboard data
        dashboard_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "summary": {
                "total_documents": doc_repo.count(),
                "total_invoices": invoice_repo.count(),
                "total_suppliers": supplier_repo.count(),
                "total_reminders": reminder_repo.count()
            },
            "recent_documents": [
                {
                    "id": str(doc.id),
                    "filename": doc.original_filename,
                    "file_type": doc.mime_type,
                    "processed_at": doc.created_at.isoformat() if doc.created_at else None
                }
                for doc in doc_repo.get_multi(limit=10)
            ],
            "recent_invoices": [
                {
                    "id": str(inv.id),
                    "invoice_number": getattr(inv, 'invoice_number', 'N/A'),
                    "amount": getattr(inv, 'total_amount', 0),
                    "status": getattr(inv, 'processing_status', 'unknown')
                }
                for inv in invoice_repo.get_multi(limit=10)
            ]
        }

        # Export to JSON
        json_data = export_data(dashboard_data, "json")

        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(json_data),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=dashboard_data.json"}
        )

    except Exception as e:
        raise ProcessingException(f"Failed to export dashboard data: {str(e)}", "export_error")


@router.get("/health")
async def export_health_check():
    """Export simple health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "FinSense Export API"
    }