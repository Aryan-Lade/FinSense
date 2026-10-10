"""
File upload API routes.
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.core.errors import ProcessingException
from app.processors.file_validator import FileType
from app.processors.pipeline_router import process_uploaded_file
from app.services.storage import storage_service
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.db.repositories import get_document_repository
import uuid
from datetime import datetime


router = APIRouter()


def get_db_session():
    """Dependency to get database session."""
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db_session)
):
    """
    Upload a file for processing.

    This endpoint handles file uploads, processes the file through the appropriate pipeline,
    stores it, and returns a document ID for tracking.
    """
    try:
        # Read file contents
        contents = await file.read()

        # Process the file through the appropriate pipeline
        processing_result = process_uploaded_file(
            contents,
            file.filename,
            file.content_type
        )

        # Upload to storage (using the storage path from processing result if available)
        storage_path = processing_result.get("storage_path", f"uploads/{uuid.uuid4()}")
        file_url = await storage_service.upload_file(
            contents,
            storage_path,
            file.content_type or "application/octet-stream"
        )

        # Create document record
        doc_repo = get_document_repository(db)

        # Determine processing status based on pipeline results
        processing_status = "completed" if processing_result.get("success") else "failed"

        document_data = {
            "original_filename": file.filename,
            "stored_path": storage_path,
            "mime_type": file.content_type or "application/octet-stream",
            "size_bytes": len(contents),
            "sha256": str(uuid.uuid5(uuid.NAMESPACE_DNS, contents)),  # Simplified hash
            "pipeline": processing_result.get("file_type", "unknown"),
            "processing_status": processing_status,
            "source_channel": "website",  # Default for now
            "ingestion_status": "completed" if processing_result.get("success") else "failed",
            # Store processing results as JSON in the document record or a related table
            # For now, we'll store key information in the document itself
            "processing_result": str(processing_result)[:1000] if processing_result else ""  # Limit size
        }

        document = doc_repo.create(document_data)

        # Prepare response
        response_content = {
            "document_id": str(document.id),
            "filename": file.filename,
            "detected_type": processing_result.get("file_type", "unknown"),
            "storage_path": storage_path,
            "file_url": file_url,
            "status": processing_status,
            "message": "File uploaded and processed successfully" if processing_result.get("success") else "File uploaded but processing failed"
        }

        # Add processing details if available
        if processing_result.get("extracted_data"):
            response_content["extracted_data"] = processing_result["extracted_data"]

        if processing_result.get("quality_assessment"):
            response_content["quality_assessment"] = processing_result["quality_assessment"]

        return JSONResponse(
            status_code=202 if processing_result.get("success") else 200,
            content=response_content
        )

    except ProcessingException as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))