"""
Batches API endpoints.
Section 15: Batch upload, list batches, batch detail, report.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from pathlib import Path
import tempfile
from app.services.batches import BatchService
from app.processors.zip_safe import extract_safe_zip, ZipSecurityError

router = APIRouter(tags=["batches"])


@router.get("/batches")
def list_batches():
    """List all processing batches."""
    return BatchService.list_batches()


@router.get("/batches/{batch_id}")
def get_batch(batch_id: str):
    """Get single batch progress and item status."""
    batch = BatchService.get_batch(batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


@router.post("/batches/zip")
async def upload_zip_batch(file: UploadFile = File(...)):
    """Upload safe ZIP archive for multi-document batch ingestion."""
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only ZIP archives accepted on this endpoint.")

    content = await file.read()
    with tempfile.TemporaryDirectory() as tmp_dir:
        try:
            extracted = extract_safe_zip(content, Path(tmp_dir))
        except ZipSecurityError as e:
            raise HTTPException(status_code=400, detail=str(e))

        batch_id = BatchService.create_batch(len(extracted))

        def process_item(item_path: Path):
            return {
                "filename": item_path.name,
                "size_bytes": item_path.stat().st_size,
                "status": "completed",
                "review_status": "approved"
            }

        result = BatchService.process_batch_items(batch_id, extracted, process_item)
        return result
