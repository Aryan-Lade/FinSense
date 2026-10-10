"""
Supplier management API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.suppliers import Supplier
from app.repositories.suppliers import SupplierRepository
from app.schemas.suppliers import SupplierCreate, SupplierUpdate, SupplierResponse

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


@router.post("/", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    supplier: SupplierCreate,
    db: Session = Depends(get_db)
):
    """Create a new supplier."""
    repo = SupplierRepository(db)
    return repo.create(supplier)


@router.get("/", response_model=List[SupplierResponse])
async def list_suppliers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """List suppliers."""
    repo = SupplierRepository(db)
    return repo.get_multi(skip=skip, limit=limit)


@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(
    supplier_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific supplier by ID."""
    repo = SupplierRepository(db)
    supplier = repo.get(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: str,
    supplier_update: SupplierUpdate,
    db: Session = Depends(get_db)
):
    """Update a supplier."""
    repo = SupplierRepository(db)
    supplier = repo.get(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return repo.update(supplier_id, supplier_update)


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_supplier(
    supplier_id: str,
    db: Session = Depends(get_db)
):
    """Delete a supplier."""
    repo = SupplierRepository(db)
    supplier = repo.get(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    repo.delete(supplier_id)
    return None