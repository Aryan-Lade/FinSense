"""
Demo routes for seeding sample data, resetting, and testing.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid
import datetime
from app.core.database import get_db
from app.models.invoices import Invoice, InvoiceItem
from app.models.suppliers import Supplier
from app.models.reminders import Reminder
from app.models.documents import Document
from app.core.clock import clock

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/seed")
async def seed_demo_data(db: Session = Depends(get_db)):
    """Seed comprehensive demo invoices according to the Master Spec."""
    # Clean any partial seed
    db.query(Reminder).delete()
    db.query(InvoiceItem).delete()
    db.query(Invoice).delete()
    db.query(Supplier).delete()
    db.query(Document).delete()
    db.commit()

    # 1. Supplier 1: TechNova Solutions
    sup1 = Supplier(
        id=str(uuid.uuid4()),
        gstin="27AAPFU0939F1ZV",
        legal_name="TechNova Solutions Pvt Ltd",
        trade_name="TechNova Cloud",
        state="Maharashtra",
        address="Bandra Kurla Complex, Mumbai, Maharashtra 400051",
        invoice_count=3,
        total_purchase_value=245000.0,
        average_purchase_value=81666.67,
    )
    # Supplier 2: Bharat Office Supplies (Hindi labels)
    sup2 = Supplier(
        id=str(uuid.uuid4()),
        gstin="07AABCB1234D1ZP",
        legal_name="भारत कार्यालय सामग्री (Bharat Supplies)",
        trade_name="Bharat Stationery",
        state="Delhi",
        address="Connaught Place, New Delhi 110001",
        invoice_count=2,
        total_purchase_value=48200.0,
        average_purchase_value=24100.0,
    )
    # Supplier 3: Apex Hardware
    sup3 = Supplier(
        id=str(uuid.uuid4()),
        gstin="29ABCDE1234F1ZW",
        legal_name="Apex Hardware & Networks",
        trade_name="Apex Hub",
        state="Karnataka",
        address="MG Road, Bangalore, Karnataka 560001",
        invoice_count=1,
        total_purchase_value=112000.0,
        average_purchase_value=112000.0,
    )
    db.add_all([sup1, sup2, sup3])
    db.commit()

    # Documents
    doc1 = Document(
        id=str(uuid.uuid4()),
        original_filename="TechNova_Cloud_Invoice_INV2026_089.pdf",
        stored_path="uploads/technova_inv.pdf",
        mime_type="application/pdf",
        size_bytes=248102,
        sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        pipeline="pdf_image",
        processing_status="completed",
    )
    doc2 = Document(
        id=str(uuid.uuid4()),
        original_filename="Bharat_Supplies_Challan_BS_901.pdf",
        stored_path="uploads/bharat_supplies.pdf",
        mime_type="application/pdf",
        size_bytes=314050,
        sha256="5d41402abc4b2a76b9719d911017c592",
        pipeline="pdf_image",
        processing_status="completed",
    )
    doc3 = Document(
        id=str(uuid.uuid4()),
        original_filename="Apex_Hardware_Mismatch_AX_442.pdf",
        stored_path="uploads/apex_hardware.pdf",
        mime_type="application/pdf",
        size_bytes=184900,
        sha256="098f6bcd4621d373cade4e832627b4f6",
        pipeline="pdf_image",
        processing_status="completed",
    )
    doc4 = Document(
        id=str(uuid.uuid4()),
        original_filename="TechNova_Cloud_Invoice_INV2026_012.pdf",
        stored_path="uploads/technova_inv_old.pdf",
        mime_type="application/pdf",
        size_bytes=219400,
        sha256="4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
        pipeline="pdf_image",
        processing_status="completed",
    )
    db.add_all([doc1, doc2, doc3, doc4])
    db.commit()

    now_utc = datetime.datetime.now(datetime.timezone.utc)
    due_15d = now_utc + datetime.timedelta(days=15)
    past_due = now_utc - datetime.timedelta(days=4)

    # Invoice 1: Clean English Invoice - Valid, Unpaid
    inv1_id = str(uuid.uuid4())
    inv1 = Invoice(
        id=inv1_id,
        document_id=doc1.id,
        bill_number="INV-2026-089",
        document_category="gst_invoice",
        supplier_id=sup1.id,
        supplier_name="TechNova Solutions Pvt Ltd",
        buyer_name="FinSense Demo Enterprise",
        invoice_date=now_utc - datetime.timedelta(days=2),
        due_date=due_15d,
        currency="INR",
        subtotal=100000.0,
        tax_amount=18000.0,
        total_amount=118000.0,
        processing_status="completed",
        validation_status="valid",
        review_status="approved",
        payment_status="unpaid",
        priority_score=0,
        canonical_json={
            "meta": {"invoice_number": "INV-2026-089", "document_category": "gst_invoice", "currency": "INR"},
            "seller": {"legal_name": "TechNova Solutions Pvt Ltd", "gstin": "27AAPFU0939F1ZV", "state_code": "27"},
            "buyer": {"legal_name": "FinSense Demo Enterprise", "gstin": "27BBBFU1111F1Z1", "state_code": "27"},
            "totals": {"total_taxable_value": 100000.0, "total_cgst": 9000.0, "total_sgst": 9000.0, "total_amount": 118000.0}
        },
        validation_json={
            "status": "valid",
            "results": [
                {"rule_id": "R004", "rule_key": "gstin_check_digit_valid", "status": "passed", "severity": "error", "message": "GSTIN check digit matches algorithmic verification"}
            ],
            "errors": [],
            "warnings": [],
            "checks_passed": ["gstin_format", "gstin_checksum", "tax_arithmetic", "dates_valid"]
        },
        provenance_json={
            "seller.gstin": {"confidence": 0.98, "source": "text_layer", "status": "accepted"},
            "totals.total_amount": {"confidence": 0.99, "source": "text_layer", "status": "accepted"}
        }
    )

    # Invoice 2: Hindi labels - Valid, Unpaid
    inv2_id = str(uuid.uuid4())
    inv2 = Invoice(
        id=inv2_id,
        document_id=doc2.id,
        bill_number="BS-901-HI",
        document_category="gst_invoice",
        supplier_id=sup2.id,
        supplier_name="भारत कार्यालय सामग्री (Bharat Supplies)",
        buyer_name="FinSense Demo Enterprise",
        invoice_date=now_utc - datetime.timedelta(days=5),
        due_date=now_utc + datetime.timedelta(days=10),
        currency="INR",
        subtotal=40000.0,
        tax_amount=7200.0,
        total_amount=47200.0,
        processing_status="completed",
        validation_status="valid",
        review_status="approved",
        payment_status="unpaid",
        priority_score=10,
        canonical_json={
            "meta": {"invoice_number": "BS-901-HI", "document_category": "gst_invoice", "language_detected": ["hi", "en"]},
            "seller": {"legal_name": "भारत कार्यालय सामग्री (Bharat Supplies)", "gstin": "07AABCB1234D1ZP"},
            "totals": {"total_taxable_value": 40000.0, "total_tax": 7200.0, "total_amount": 47200.0}
        },
        validation_json={"status": "valid", "errors": [], "warnings": [], "checks_passed": ["gstin_format", "arithmetic"]}
    )

    # Invoice 3: Needs Review - Tax Arithmetic Discrepancy & Check digit suspect
    inv3_id = str(uuid.uuid4())
    inv3 = Invoice(
        id=inv3_id,
        document_id=doc3.id,
        bill_number="AX-442-REV",
        document_category="gst_invoice",
        supplier_id=sup3.id,
        supplier_name="Apex Hardware & Networks",
        buyer_name="FinSense Demo Enterprise",
        invoice_date=now_utc - datetime.timedelta(days=12),
        due_date=past_due,
        currency="INR",
        subtotal=100000.0,
        tax_amount=12000.0,
        total_amount=115000.0, # Deliberate math mismatch (100k + 12k != 115k)
        processing_status="completed",
        validation_status="invalid",
        review_status="needs_review",
        payment_status="unpaid",
        priority_score=120,
        review_reasons=["validation_error", "conflicting_values"],
        canonical_json={
            "meta": {"invoice_number": "AX-442-REV"},
            "seller": {"legal_name": "Apex Hardware & Networks", "gstin": "29ABCDE1234F1Z5"}, # Deliberate wrong check digit
            "totals": {"total_taxable_value": 100000.0, "total_tax": 12000.0, "total_amount": 115000.0}
        },
        validation_json={
            "status": "invalid",
            "errors": [
                {
                    "rule_id": "R004",
                    "rule_key": "gstin_check_digit_valid",
                    "name": "GSTIN Check Digit Verification",
                    "status": "failed",
                    "severity": "error",
                    "field_path": "seller.gstin",
                    "message": "Invalid GSTIN check digit '5'. Expected checksum 'W'.",
                    "expected": "29ABCDE1234F1ZW",
                    "actual": "29ABCDE1234F1Z5",
                    "suggestion": "29ABCDE1234F1ZW"
                },
                {
                    "rule_id": "R024",
                    "rule_key": "total_equals_taxable_plus_tax",
                    "name": "Invoice Total Arithmetic",
                    "status": "failed",
                    "severity": "error",
                    "field_path": "totals.total_amount",
                    "message": "Arithmetic mismatch: Subtotal 100,000.00 + Tax 12,000.00 = 112,000.00 != Total 115,000.00 (diff: 3,000.00)",
                    "expected": 112000.0,
                    "actual": 115000.0
                }
            ],
            "warnings": [],
            "checks_passed": ["required_fields", "state_code_valid"]
        },
        suggestions_json={
            "seller.gstin": "29ABCDE1234F1ZW",
            "totals.total_amount": 112000.0
        }
    )

    # Invoice 4: Paid invoice (History)
    inv4_id = str(uuid.uuid4())
    inv4 = Invoice(
        id=inv4_id,
        document_id=doc4.id,
        bill_number="INV-2026-012",
        document_category="gst_invoice",
        supplier_id=sup1.id,
        supplier_name="TechNova Solutions Pvt Ltd",
        buyer_name="FinSense Demo Enterprise",
        invoice_date=now_utc - datetime.timedelta(days=35),
        due_date=now_utc - datetime.timedelta(days=15),
        currency="INR",
        subtotal=127000.0,
        tax_amount=22860.0,
        total_amount=149860.0,
        processing_status="completed",
        validation_status="valid",
        review_status="approved",
        payment_status="paid",
        paid_at=now_utc - datetime.timedelta(days=16),
        payment_note="NEFT Transaction ID: N19283746501",
        priority_score=0
    )

    db.add_all([inv1, inv2, inv3, inv4])
    db.commit()

    # Reminders for unpaid invoices
    rem1 = Reminder(
        id=str(uuid.uuid4()),
        invoice_id=inv1_id,
        rule_type="after_receipt",
        interval_days=10,
        repeat_every_days=2,
        first_fire_at=now_utc + datetime.timedelta(days=8),
        next_fire_at=now_utc + datetime.timedelta(days=8),
        timezone="Asia/Kolkata",
        status="scheduled",
        calendar_sync_status="pending_confirmation",
        idempotency_key=f"rem_{inv1_id}_after_receipt"
    )
    rem2 = Reminder(
        id=str(uuid.uuid4()),
        invoice_id=inv3_id,
        rule_type="on_due_date",
        interval_days=0,
        repeat_every_days=2,
        first_fire_at=past_due,
        next_fire_at=now_utc,
        timezone="Asia/Kolkata",
        status="scheduled",
        calendar_sync_status="not_connected",
        idempotency_key=f"rem_{inv3_id}_on_due_date"
    )
    db.add_all([rem1, rem2])
    db.commit()

    return {
        "status": "success",
        "message": "Demo data successfully seeded with 4 bills, suppliers, validations, and reminders.",
        "invoices_seeded": 4,
        "suppliers_seeded": 3
    }


@router.post("/reset")
async def reset_demo_data(db: Session = Depends(get_db)):
    """Reset all seeded demo data."""
    db.query(Reminder).delete()
    db.query(InvoiceItem).delete()
    db.query(Invoice).delete()
    db.query(Supplier).delete()
    db.query(Document).delete()
    db.commit()
    return {"status": "success", "message": "Demo database reset cleanly."}


@router.post("/advance-clock")
async def advance_demo_clock(days: int = 2):
    """Advance the demo clock by specified number of days."""
    clock.advance(days * 86400)
    return {
        "status": "success",
        "advanced_days": days,
        "simulated_now": clock.now().isoformat()
    }
