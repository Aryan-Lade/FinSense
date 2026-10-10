"""
Dashboard charts and metrics API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.db.repositories import get_document_repository, get_invoice_repository, get_supplier_repository
from app.services.reminder_service import ReminderService
from app.core.errors import ProcessingException
import uuid
from datetime import datetime, timedelta


router = APIRouter(prefix="/charts", tags=["charts"])


def get_db_session():
    """Dependency to get database session."""
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()


@router.get("/overview")
async def get_overview_metrics(db: Session = Depends(get_db_session)):
    """Get overview metrics for the dashboard."""
    try:
        # Get repositories
        doc_repo = get_document_repository(db)
        invoice_repo = get_invoice_repository(db)
        supplier_repo = get_supplier_repository(db)

        # Get counts
        total_documents = doc_repo.count()
        total_invoices = invoice_repo.count()
        total_suppliers = supplier_repo.count()

        # Get recent activity (simplified)
        recent_documents = doc_repo.get_multi(limit=5)
        recent_invoices = invoice_repo.get_multi(limit=5)

        # Calculate processing status breakdown
        # In a real implementation, we'd query by processing_status
        # For now, we'll return placeholder data

        return {
            "total_documents": total_documents,
            "total_invoices": total_invoices,
            "total_suppliers": total_suppliers,
            "processing_status": {
                "queued": 10,  # Placeholder
                "processing": 5,
                "completed": 80,
                "failed": 2
            },
            "recent_activity": {
                "documents": [
                    {
                        "id": str(doc.id),
                        "filename": doc.original_filename,
                        "processed_at": doc.created_at.isoformat() if doc.created_at else None
                    }
                    for doc in recent_documents
                ],
                "invoices": [
                    {
                        "id": str(inv.id),
                        "invoice_number": getattr(inv, 'invoice_number', 'N/A'),
                        "amount": getattr(inv, 'total_amount', 0),
                        "status": getattr(inv, 'processing_status', 'unknown')
                    }
                    for inv in recent_invoices
                ]
            }
        }

    except Exception as e:
        raise ProcessingException(f"Failed to get overview metrics: {str(e)}", "metrics_error")


@router.get("/invoice-trends")
async def get_invoice_trends(
    period: str = Query("monthly", regex="^(daily|weekly|monthly)$"),
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db_session)
):
    """Get invoice trends over time."""
    try:
        # In a real implementation, we would group invoices by time period
        # For now, we'll return placeholder data

        labels = []
        data = []

        if period == "monthly":
            for i in range(months):
                date = datetime.now() - timedelta(days=30*i)
                labels.append(date.strftime("%b %y"))
                # Placeholder data - in reality, this would come from DB query
                data.append(max(0, 20 - i + (i % 3)))  # Some variation

        labels.reverse()  # Most recent last
        data.reverse()

        return {
            "period": period,
            "labels": labels,
            "datasets": [
                {
                    "label": "Invoice Count",
                    "data": data,
                    "borderColor": "rgb(75, 192, 192)",
                    "backgroundColor": "rgba(75, 192, 192, 0.2)"
                }
            ]
        }

    except Exception as e:
        raise ProcessingException(f"Failed to get invoice trends: {str(e)}", "trends_error")


@router.get("/supplier-distribution")
async def get_supplier_distribution(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db_session)
):
    """Get supplier distribution chart data."""
    try:
        # Get supplier repository
        supplier_repo = get_supplier_repository(db)

        # In a real implementation, we would get top suppliers by invoice count or value
        # For now, we'll return placeholder data

        suppliers = supplier_repo.get_multi(limit=limit)

        labels = []
        data = []

        for supplier in suppliers:
            labels.append(supplier.legal_name or supplier.gstin or f"Supplier {supplier.id}")
            # Placeholder data - in reality, this would be invoice count or total value
            data.append(max(1, 10 - len(labels) + 1))  # Decreasing values

        return {
            "labels": labels,
            "datasets": [
                {
                    "label": "Invoice Count by Supplier",
                    "data": data,
                    "backgroundColor": [
                        "rgba(255, 99, 132, 0.5)",
                        "rgba(54, 162, 235, 0.5)",
                        "rgba(255, 206, 86, 0.5)",
                        "rgba(75, 192, 192, 0.5)",
                        "rgba(153, 102, 255, 0.5)",
                        "rgba(255, 159, 64, 0.5)",
                        "rgba(199, 199, 199, 0.5)",
                        "rgba(83, 102, 255, 0.5)",
                        "rgba(40, 176, 255, 0.5)",
                        "rgba(210, 105, 30, 0.5)"
                    ][:len(labels)]
                }
            ]
        }

    except Exception as e:
        raise ProcessingException(f"Failed to get supplier distribution: {str(e)}", "distribution_error")


@router.get("/reminder-stats")
async def get_reminder_stats(db: Session = Depends(get_db_session)):
    """Get reminder statistics."""
    try:
        # Get reminder repository
        from app.db.repositories import get_reminder_repository
        reminder_repo = get_reminder_repository(db)

        # Get all reminders (in practice, we'd paginate or filter)
        reminders = reminder_repo.get_multi(limit=1000)

        # Count by status
        status_counts = {}
        for reminder in reminders:
            status = reminder.status
            status_counts[status] = status_counts.get(status, 0) + 1

        # Count by rule type
        rule_type_counts = {}
        for reminder in reminders:
            rule_type = reminder.rule_type
            rule_type_counts[rule_type] = rule_type_counts.get(rule_type, 0) + 1

        return {
            "total_reminders": len(reminders),
            "by_status": status_counts,
            "by_rule_type": rule_type_counts,
            "average_interval_days": sum(
                r.interval_days for r in reminders if r.interval_days
            ) / max(1, len([r for r in reminders if r.interval_days]))
        }

    except Exception as e:
        raise ProcessingException(f"Failed to get reminder stats: {str(e)}", "stats_error")


@router.get("/processing-performance")
async def get_processing_performance(
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db_session)
):
    """Get processing performance metrics."""
    try:
        # Get document repository
        doc_repo = get_document_repository(db)

        # In a real implementation, we would query processing times
        # For now, we'll return placeholder data

        labels = []
        processing_times = []
        success_rates = []

        for i in range(days):
            date = datetime.now() - timedelta(days=i)
            labels.append(date.strftime("%m/%d"))
            # Placeholder data
            processing_times.append(max(10, 60 - i*2))  # Decreasing processing time
            success_rates.append(min(99, 85 + i*1.5))  # Increasing success rate

        labels.reverse()
        processing_times.reverse()
        success_rates.reverse()

        return {
            "labels": labels,
            "datasets": [
                {
                    "label": "Average Processing Time (seconds)",
                    "data": processing_times,
                    "borderColor": "rgb(255, 99, 132)",
                    "yAxisID": "y1"
                },
                {
                    "label": "Success Rate (%)",
                    "data": success_rates,
                    "borderColor": "rgb(54, 162, 235)",
                    "yAxisID": "y2"
                }
            ],
            "options": {
                "scales": {
                    "y1": {
                        "type": "linear",
                        "position": "left",
                        "title": {
                            "display": true,
                            "text": "Processing Time (seconds)"
                        }
                    },
                    "y2": {
                        "type": "linear",
                        "position": "right",
                        "title": {
                            "display": true,
                            "text": "Success Rate (%)"
                        },
                        "grid": {
                            "drawOnChartArea": false
                        }
                    }
                }
            }
        }

    except Exception as e:
        raise ProcessingException(f"Failed to get processing performance: {str(e)}", "performance_error")