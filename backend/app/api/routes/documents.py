"""
Document API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.db.repositories import get_document_repository, get_invoice_repository


router = APIRouter()


def get_db_session():
    """Dependency to get database session."""
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()


@router.get("/documents/{document_id}")
async def get_document(document_id: str, db: Session = Depends(get_db_session)):
    """Get document status and information."""
    doc_repo = get_document_repository(db)
    document = doc_repo.get_by_id(document_id)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "document_id": str(document.id),
        "original_filename": document.original_filename,
        "stored_path": document.stored_path,
        "mime_type": document.mime_type,
        "size_bytes": document.size_bytes,
        "processing_status": document.processing_status,
        "ingestion_status": document.ingestion_status,
        "created_at": document.created_at.isoformat() if document.created_at else None,
        "updated_at": document.updated_at.isoformat() if document.updated_at else None
    }


@router.get("/documents/{document_id}/file")
async def get_document_file(document_id: str, db: Session = Depends(get_db_session)):
    """Get the original file for a document."""
    doc_repo = get_document_repository(db)
    document = doc_repo.get_by_id(document_id)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # In a real implementation, this would return the actual file
    # For now, we'll return metadata about the file
    return {
        "document_id": str(document.id),
        "original_filename": document.original_filename,
        "stored_path": document.stored_path,
        "mime_type": document.mime_type,
        "size_bytes": document.size_bytes,
        "message": "File download endpoint - use stored_path with storage service to retrieve file"
    }


@router.get("/documents")
async def list_documents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db_session)
):
    """List documents with pagination."""
    doc_repo = get_document_repository(db)
    documents = doc_repo.list(skip=skip, limit=limit)
    total = doc_repo.count()
    
    return {
        "documents": [
            {
                "document_id": str(doc.id),
                "original_filename": doc.original_filename,
                "mime_type": doc.mime_type,
                "size_bytes": doc.size_bytes,
                "processing_status": doc.processing_status,
                "ingestion_status": doc.ingestion_status,
                "created_at": doc.created_at.isoformat() if doc.created_at else None
            }
            for doc in documents
        ],
        "total": total,
        "skip": skip,
        "limit": limit
    }
