"""
Reminder management API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.reminders import Reminder
from app.repositories.reminders import ReminderRepository
from app.schemas.reminders import ReminderCreate, ReminderUpdate, ReminderResponse

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.post("/", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder(
    reminder: ReminderCreate,
    db: Session = Depends(get_db)
):
    """Create a new reminder."""
    repo = ReminderRepository(db)
    return repo.create(reminder)


@router.get("/", response_model=List[ReminderResponse])
async def list_reminders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    invoice_id: Optional[int] = Query(None),
    is_sent: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """List reminders with optional filtering."""
    repo = ReminderRepository(db)
    if invoice_id:
        return repo.get_by_invoice(invoice_id, skip=skip, limit=limit)
    if is_sent is not None:
        return repo.get_by_sent_status(is_sent, skip=skip, limit=limit)
    return repo.get_multi(skip=skip, limit=limit)


@router.get("/{reminder_id}", response_model=ReminderResponse)
async def get_reminder(
    reminder_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific reminder by ID."""
    repo = ReminderRepository(db)
    reminder = repo.get(reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder


@router.put("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: str,
    reminder_update: ReminderUpdate,
    db: Session = Depends(get_db)
):
    """Update a reminder."""
    repo = ReminderRepository(db)
    reminder = repo.get(reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return repo.update(reminder_id, reminder_update)


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(
    reminder_id: str,
    db: Session = Depends(get_db)
):
    """Delete a reminder."""
    repo = ReminderRepository(db)
    reminder = repo.get(reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    repo.delete(reminder_id)
    return None


@router.post("/{reminder_id}/send", response_model=ReminderResponse)
async def send_reminder(
    reminder_id: str,
    db: Session = Depends(get_db)
):
    """Send a reminder."""
    repo = ReminderRepository(db)
    reminder = repo.get(reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    # Mark as sent (in a real implementation, this would trigger actual sending)
    reminder.is_sent = True
    db.commit()
    db.refresh(reminder)
    return reminder