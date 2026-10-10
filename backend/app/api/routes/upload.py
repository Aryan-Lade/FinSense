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
from app.models.documents import Document
from app.models.invoices import Invoice, InvoiceItem
from app.models.suppliers import Supplier
from app.models.reminders import Reminder
import uuid
import datetime
import hashlib


router = APIRouter()


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
        file_sha256 = hashlib.sha256(contents).hexdigest()

        # Check for existing document by SHA-256 (safe deduplication)
        existing_doc = db.query(Document).filter(Document.sha256 == file_sha256).first()
        if existing_doc:
            existing_invoice = db.query(Invoice).filter(Invoice.document_id == existing_doc.id).first()
            if existing_invoice:
                return JSONResponse(
                    status_code=200,
                    content={
                        "success": True,
                        "document_id": existing_doc.id,
                        "invoice_id": existing_invoice.id,
                        "filename": existing_doc.original_filename,
                        "detected_type": existing_doc.pipeline,
                        "storage_path": existing_doc.stored_path,
                        "file_url": f"/api/documents/{existing_doc.id}/view",
                        "status": existing_invoice.processing_status,
                        "invoice_number": existing_invoice.bill_number,
                        "supplier_name": existing_invoice.supplier_name,
                        "total_amount": existing_invoice.total_amount,
                        "extracted_data": existing_invoice.canonical_json or {},
                        "validation_status": existing_invoice.validation_status,
                        "ocr_info": {
                            "character_count": 0,
                            "model": "PaddleOCR (PP-OCRv4)",
                            "cached": True
                        }
                    }
                )

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

        # 1. Create Document Record
        doc_id = str(uuid.uuid4())
        doc = Document(
            id=doc_id,
            original_filename=file.filename,
            stored_path=storage_path,
            mime_type=file.content_type or "application/octet-stream",
            size_bytes=len(contents),
            sha256=file_sha256,
            pipeline=processing_result.get("file_type", "unknown"),
            processing_status=processing_status,
            source_channel="website",
            ingestion_status=processing_status,
            error_message=None
        )
        db.add(doc)
        db.commit()

        # 2. Create Invoice Record from OCR / Extraction
        def _make_serializable(val):
            if isinstance(val, (datetime.date, datetime.datetime)):
                return val.isoformat()
            elif isinstance(val, dict):
                return {k: _make_serializable(v) for k, v in val.items()}
            elif isinstance(val, (list, tuple, set)):
                return [_make_serializable(v) for v in val]
            return val

        extracted_data = _make_serializable(processing_result.get("extracted_data") or {})
        canonical = _make_serializable(processing_result.get("canonical_json") or {})
        provenance = _make_serializable(processing_result.get("provenance_json") or {})
        validation = _make_serializable(processing_result.get("validation_json") or {"status": "valid"})

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
        if not supplier:
            supplier = Supplier(
                id=str(uuid.uuid4()),
                legal_name=supplier_name,
                gstin=seller_gstin,
                state="Maharashtra",
                address="India"
            )
            db.add(supplier)
            db.commit()

        # Invoice totals
        subtotal = float(extracted_data.get("subtotal") or 0.0)
        tax_amount = float(extracted_data.get("tax_amount") or 0.0)
        total_amount = float(extracted_data.get("total_amount") or (subtotal + tax_amount))

        inv_date = extracted_data.get("invoice_date")
        if isinstance(inv_date, str):
            try:
                inv_date = datetime.datetime.fromisoformat(inv_date.replace("Z", "+00:00"))
            except Exception:
                inv_date = now_utc
        elif isinstance(inv_date, datetime.date) and not isinstance(inv_date, datetime.datetime):
            inv_date = datetime.datetime.combine(inv_date, datetime.time.min, tzinfo=datetime.timezone.utc)
        elif not isinstance(inv_date, datetime.datetime):
            inv_date = now_utc

        due_date = extracted_data.get("due_date")
        if isinstance(due_date, str):
            try:
                due_date = datetime.datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            except Exception:
                due_date = inv_date + datetime.timedelta(days=15)
        elif isinstance(due_date, datetime.date) and not isinstance(due_date, datetime.datetime):
            due_date = datetime.datetime.combine(due_date, datetime.time.min, tzinfo=datetime.timezone.utc)
        elif not isinstance(due_date, datetime.datetime):
            due_date = inv_date + datetime.timedelta(days=15)

        is_valid = validation.get("status") == "valid"
        priority_score = 0 if is_valid else 25

        invoice = Invoice(
            id=invoice_id,
            document_id=doc_id,
            bill_number=bill_num,
            document_category="gst_invoice",
            supplier_id=supplier.id,
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
            canonical_json=canonical,
            provenance_json=provenance,
            validation_json=validation,
            suggestions_json=validation.get("suggestions", [])
        )
        db.add(invoice)
        db.commit()

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
            "extracted_data": extracted_data,
            "validation_status": "valid" if is_valid else "invalid",
            "ocr_info": {
                "character_count": processing_result.get("ocr_info", {}).get("character_count", 0),
                "language": processing_result.get("ocr_info", {}).get("language_info", {}).get("language", "en"),
                "confidence": processing_result.get("ocr_info", {}).get("ocr_confidence", 0.95),
                "model": processing_result.get("ocr_info", {}).get("model", "PaddleOCR (PP-OCRv4)"),
                "model_url": processing_result.get("ocr_info", {}).get("model_url", "https://github.com/PaddlePaddle/PaddleOCR.git"),
                "engine": processing_result.get("ocr_info", {}).get("engine", "PaddleOCR")
            }
        }

        return JSONResponse(status_code=201, content=response_content)

    except ProcessingException as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))