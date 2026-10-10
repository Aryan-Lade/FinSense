"""
File upload and OCR processing API route.
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.core.errors import ProcessingException
from app.processors.file_validator import FileType
from app.processors.pipeline_router import process_uploaded_file
from app.services.storage import storage_service
from app.core.database import get_db
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.documents import Document
from app.models.invoices import Invoice, InvoiceItem
from app.models.suppliers import Supplier
from app.models.reminders import Reminder
import uuid
import datetime
import hashlib


router = APIRouter()


def to_json_compatible(obj):
    """
    Recursively convert dates, datetimes, decimals, and UUIDs to JSON serializable objects.
    Prevents (builtins.TypeError) Object of type date is not JSON serializable.
    """
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    elif isinstance(obj, uuid.UUID):
        return str(obj)
    elif isinstance(obj, dict):
        return {str(k): to_json_compatible(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple, set)):
        return [to_json_compatible(item) for item in obj]
    return obj


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a document (PDF, PNG, JPG, CSV, XLSX).
    Extracts text and fields with RapidOCR + pdfplumber + OpenCV,
    validates GST rules, stores the invoice, and schedules payment reminders.
    """
    try:
        # Read file contents
        contents = await file.read()

        # Compute SHA-256 for cryptographic deduplication
        real_sha256 = hashlib.sha256(contents).hexdigest()
        legacy_sha256 = str(uuid.uuid5(uuid.NAMESPACE_DNS, str(len(contents)) + file.filename))

        # Check if this exact file was already uploaded
        existing_doc = db.query(Document).filter(
            (Document.sha256 == real_sha256) | (Document.sha256 == legacy_sha256)
        ).first()

        if existing_doc:
            # Check if an invoice was already created for this document
            existing_invoice = db.query(Invoice).filter(Invoice.document_id == existing_doc.id).first()
            if existing_invoice:
                # Document & invoice already exist in ledger! Return existing record cleanly
                return JSONResponse(status_code=200, content={
                    "success": True,
                    "document_id": existing_doc.id,
                    "invoice_id": existing_invoice.id,
                    "filename": file.filename,
                    "detected_type": existing_doc.pipeline or "image",
                    "storage_path": existing_doc.stored_path,
                    "file_url": f"/api/documents/{existing_doc.id}/file",
                    "status": "completed",
                    "invoice_number": existing_invoice.bill_number,
                    "supplier_name": existing_invoice.supplier_name,
                    "total_amount": existing_invoice.total_amount,
                    "extracted_data": to_json_compatible(existing_invoice.canonical_json or {}),
                    "validation_status": existing_invoice.validation_status,
                    "duplicate": True,
                    "message": f"Invoice already recorded in ledger as {existing_invoice.bill_number}",
                    "ocr_info": {
                        "character_count": 0,
                        "language": "en",
                        "confidence": 0.95
                    }
                })

        # Process the file through the appropriate pipeline
        processing_result = process_uploaded_file(
            contents,
            file.filename,
            file.content_type
        )

        storage_path = processing_result.get("storage_path", f"uploads/{uuid.uuid4()}_{file.filename}")
        file_url = await storage_service.upload_file(
            contents,
            storage_path,
            file.content_type or "application/octet-stream"
        )

        processing_status = "completed" if processing_result.get("success") else "failed"

        # 1. Create or Reuse Document Record
        if existing_doc:
            doc = existing_doc
            doc_id = doc.id
            doc.sha256 = real_sha256
            doc.stored_path = storage_path
            doc.processing_status = processing_status
            doc.ingestion_status = processing_status
        else:
            doc_id = str(uuid.uuid4())
            doc = Document(
                id=doc_id,
                original_filename=file.filename,
                stored_path=storage_path,
                mime_type=file.content_type or "application/octet-stream",
                size_bytes=len(contents),
                sha256=real_sha256,
                pipeline=processing_result.get("file_type", "unknown"),
                processing_status=processing_status,
                source_channel="website",
                ingestion_status=processing_status,
                error_message=None
            )
            db.add(doc)

        # 2. Create Invoice Record from OCR / Extraction
        extracted_data = processing_result.get("extracted_data") or {}
        canonical = processing_result.get("canonical_json") or {}
        provenance = processing_result.get("provenance_json") or {}
        validation = processing_result.get("validation_json") or {"status": "valid"}

        invoice_id = str(uuid.uuid4())
        bill_num = extracted_data.get("bill_number") or f"BILL-{uuid.uuid4().hex[:6].upper()}"
        supplier_name = extracted_data.get("supplier_name") or "Direct Vendor"
        seller_gstin = extracted_data.get("seller_gstin")
        buyer_name = extracted_data.get("buyer_name") or "FinSense Enterprise"
        now_utc = datetime.datetime.now(datetime.timezone.utc)

        # Upsert supplier
        supplier = None
        if seller_gstin:
            supplier = db.query(Supplier).filter(Supplier.gstin == seller_gstin).first()
        elif supplier_name:
            supplier = db.query(Supplier).filter(Supplier.legal_name == supplier_name).first()

        if not supplier and (seller_gstin or supplier_name):
            supplier = Supplier(
                id=str(uuid.uuid4()),
                legal_name=supplier_name or "Direct Vendor",
                gstin=seller_gstin,
                state="Maharashtra",
                address="India"
            )
            db.add(supplier)

        # Invoice totals
        subtotal = float(extracted_data.get("subtotal") or 0.0)
        tax_amount = float(extracted_data.get("tax_amount") or 0.0)
        total_amount = float(extracted_data.get("total_amount") or (subtotal + tax_amount))

        inv_date = extracted_data.get("invoice_date")
        if isinstance(inv_date, str):
            try:
                inv_date = datetime.date.fromisoformat(inv_date)
            except Exception:
                inv_date = None
        if isinstance(inv_date, datetime.date) and not isinstance(inv_date, datetime.datetime):
            inv_date = datetime.datetime.combine(inv_date, datetime.time.min, tzinfo=datetime.timezone.utc)
        elif not inv_date:
            inv_date = now_utc

        due_date = extracted_data.get("due_date")
        if isinstance(due_date, str):
            try:
                due_date = datetime.date.fromisoformat(due_date)
            except Exception:
                due_date = None
        if isinstance(due_date, datetime.date) and not isinstance(due_date, datetime.datetime):
            due_date = datetime.datetime.combine(due_date, datetime.time.min, tzinfo=datetime.timezone.utc)
        elif not due_date:
            due_date = inv_date + datetime.timedelta(days=15)

        is_valid = validation.get("status") == "valid"
        priority_score = 0 if is_valid else 25

        invoice = Invoice(
            id=invoice_id,
            document_id=doc_id,
            bill_number=bill_num,
            document_category="gst_invoice",
            supplier_id=supplier.id if supplier else None,
            supplier_name=supplier_name,
            buyer_name=buyer_name,
            invoice_date=inv_date,
            due_date=due_date,
            currency="INR",
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            processing_status="completed",
            validation_status="valid" if is_valid else "invalid",
            review_status="approved" if is_valid else "needs_review",
            payment_status="unpaid",
            priority_score=priority_score,
            canonical_json=to_json_compatible(canonical),
            provenance_json=to_json_compatible(provenance),
            validation_json=to_json_compatible(validation),
            suggestions_json=to_json_compatible(validation.get("suggestions", []))
        )
        db.add(invoice)

        # 3. Schedule payment reminder for unpaid bill
        reminder_id = str(uuid.uuid4())
        reminder = Reminder(
            id=reminder_id,
            invoice_id=invoice_id,
            rule_type="after_receipt",
            interval_days=10,
            repeat_every_days=2,
            first_fire_at=now_utc + datetime.timedelta(days=10),
            next_fire_at=now_utc + datetime.timedelta(days=10),
            timezone="Asia/Kolkata",
            status="scheduled",
            calendar_sync_status="not_connected",
            idempotency_key=f"rem_{invoice_id}_after_receipt"
        )
        db.add(reminder)

        # Atomic commit for the entire transaction
        db.commit()

        # Response
        response_content = {
            "success": True,
            "document_id": doc_id,
            "invoice_id": invoice_id,
            "filename": file.filename,
            "detected_type": processing_result.get("file_type", "unknown"),
            "storage_path": storage_path,
            "file_url": file_url,
            "status": "completed",
            "invoice_number": bill_num,
            "supplier_name": supplier_name,
            "total_amount": total_amount,
            "extracted_data": to_json_compatible(extracted_data),
            "validation_status": "valid" if is_valid else "invalid",
            "ocr_info": {
                "character_count": processing_result.get("ocr_info", {}).get("character_count", 0),
                "language": processing_result.get("ocr_info", {}).get("language_info", {}).get("language", "en"),
                "confidence": processing_result.get("ocr_info", {}).get("ocr_confidence", 0.95)
            }
        }

        return JSONResponse(status_code=201, content=response_content)

    except IntegrityError:
        db.rollback()
        # Find existing document and invoice for seamless fallback
        existing_doc = db.query(Document).filter(
            (Document.sha256 == real_sha256) | (Document.sha256 == legacy_sha256)
        ).first()
        if existing_doc:
            existing_invoice = db.query(Invoice).filter(Invoice.document_id == existing_doc.id).first()
            if existing_invoice:
                return JSONResponse(status_code=200, content={
                    "success": True,
                    "document_id": existing_doc.id,
                    "invoice_id": existing_invoice.id,
                    "filename": file.filename,
                    "detected_type": existing_doc.pipeline or "image",
                    "storage_path": existing_doc.stored_path,
                    "file_url": f"/api/documents/{existing_doc.id}/file",
                    "status": "completed",
                    "invoice_number": existing_invoice.bill_number,
                    "supplier_name": existing_invoice.supplier_name,
                    "total_amount": existing_invoice.total_amount,
                    "extracted_data": to_json_compatible(existing_invoice.canonical_json or {}),
                    "validation_status": existing_invoice.validation_status,
                    "duplicate": True,
                    "message": f"Invoice already recorded in ledger as {existing_invoice.bill_number}",
                    "ocr_info": {
                        "character_count": 0,
                        "language": "en",
                        "confidence": 0.95
                    }
                })
        raise HTTPException(
            status_code=409,
            detail="This document has already been uploaded or recorded in the ledger."
        )
    except ProcessingException as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))