"""
Prioritized Review Queue API endpoints.
Section 12: Deterministic priority scoring, reason breakdown, assignee management.
"""
from fastapi import APIRouter, Depends
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.invoices import Invoice

router = APIRouter(prefix="/review", tags=["review"])


def calculate_priority_score(inv: Invoice) -> Tuple[int, List[Dict[str, Any]]]:
    score = 0
    breakdown = []

    val = inv.validation_json or {}
    errors = val.get("errors", [])
    warnings = val.get("warnings", [])

    if errors:
        score += 100
        breakdown.append({"rule": "Critical validation error", "points": 100})

    if "duplicate_suspect" in (inv.review_reasons or []):
        score += 80
        breakdown.append({"rule": "Duplicate suspect", "points": 80})

    if "missing_critical_field" in (inv.review_reasons or []):
        score += 70
        breakdown.append({"rule": "Missing critical field", "points": 70})

    if "low_confidence_critical_field" in (inv.review_reasons or []):
        score += 60
        breakdown.append({"rule": "Low confidence critical field", "points": 60})

    if warnings:
        score += 20
        breakdown.append({"rule": "Validation warnings", "points": 20})

    return score, breakdown


from typing import Tuple

@router.get("/queue")
def get_review_queue(db: Session = Depends(get_db)):
    """
    Retrieve prioritized review queue ordered by priority score descending.
    """
    invoices = db.query(Invoice).filter(Invoice.review_status != "approved").all()
    queue = []

    for inv in invoices:
        score, breakdown = calculate_priority_score(inv)
        queue.append({
            "id": inv.id,
            "bill_number": inv.bill_number,
            "supplier_name": inv.supplier_name,
            "total_amount": float(inv.total_amount or 0.0),
            "upload_date": inv.upload_date.isoformat() if inv.upload_date else None,
            "validation_status": inv.validation_status,
            "review_status": inv.review_status,
            "priority_score": score,
            "priority_breakdown": breakdown,
            "review_reasons": inv.review_reasons or [],
            "payment_status": inv.payment_status
        })

    # Sort by priority score descending, then upload date ascending
    queue.sort(key=lambda x: (-x["priority_score"], x["upload_date"] or ""))
    return queue
