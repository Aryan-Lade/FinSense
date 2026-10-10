"""
Storage service for managing file uploads and downloads.
"""
from typing import Optional
from app.adapters.storage_base import StorageBackend, LocalStorageBackend
from app.adapters.storage_supabase import SupabaseStorageBackend
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class StorageService:
    """Service for managing file storage operations."""
    
    def __init__(self):
        self.backend: StorageBackend = self._initialize_backend()
    
    def _initialize_backend(self) -> StorageBackend:
        """Initialize the storage backend based on configuration."""
        if settings.STORAGE_BACKEND == "supabase":
            if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
                logger.warning("Supabase configuration incomplete, falling back to local storage")
                return LocalStorageBackend(settings.UPLOAD_DIR)
            
            logger.info("Initializing Supabase storage backend")
            return SupabaseStorageBackend(
                supabase_url=settings.SUPABASE_URL,
                supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY,
                bucket_name=settings.SUPABASE_BUCKET or "finsense-files"
            )
        else:
            logger.info("Initializing local storage backend")
            return LocalStorageBackend(settings.UPLOAD_DIR)
    
    async def upload_file(
        self, 
        file_data: bytes, 
        path: str, 
        content_type: str
    ) -> str:
        """Upload a file and return its URL."""
        import io
        file_stream = io.BytesIO(file_data)
        url = await self.backend.upload_file(file_stream, path, content_type)
        logger.info(f"File uploaded: {path} -> {url}")
        return url
    
    async def download_file(self, path: str) -> bytes:
        """Download a file and return its contents as bytes."""
        file_stream = await self.backend.download_file(path)
        data = file_stream.read()
        logger.info(f"File downloaded: {path} ({len(data)} bytes)")
        return data
    
    async def delete_file(self, path: str) -> bool:
        """Delete a file."""
        result = await self.backend.delete_file(path)
        if result:
            logger.info(f"File deleted: {path}")
        else:
            logger.warning(f"File not found for deletion: {path}")
        return result
    
    async def get_file_url(self, path: str, expires_in: int = 3600) -> str:
        """Get a URL for accessing the file."""
        url = await self.backend.get_file_url(path, expires_in)
        logger.debug(f"File URL generated: {path} -> {url}")
        return url


# Global storage service instance
storage_service = StorageService()
