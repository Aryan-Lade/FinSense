"""
Storage backend interface for FinSense.
"""
from abc import ABC, abstractmethod
from typing import BinaryIO, Optional
import uuid
from datetime import datetime


class StorageBackend(ABC):
    """Abstract storage backend interface."""

    @abstractmethod
    async def upload_file(
        self, 
        file_data: BinaryIO, 
        path: str, 
        content_type: str
    ) -> str:
        """Upload a file and return its URL."""
        pass

    @abstractmethod
    async def download_file(self, path: str) -> BinaryIO:
        """Download a file by its path."""
        pass

    @abstractmethod
    async def delete_file(self, path: str) -> bool:
        """Delete a file by its path."""
        pass

    @abstractmethod
    async def get_file_url(self, path: str, expires_in: int = 3600) -> str:
        """Get a URL for accessing the file (may be signed/temporary)."""
        pass


class LocalStorageBackend(StorageBackend):
    """Local filesystem storage backend."""

    def __init__(self, base_path: str):
        self.base_path = base_path
        import os
        os.makedirs(base_path, exist_ok=True)

    async def upload_file(
        self, 
        file_data: BinaryIO, 
        path: str, 
        content_type: str
    ) -> str:
        """Upload a file to local storage."""
        import os
        from pathlib import Path
        
        full_path = Path(self.base_path) / path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write file data
        with open(full_path, "wb") as f:
            # Reset file pointer to beginning if possible
            if hasattr(file_data, 'seek'):
                file_data.seek(0)
            # Read and write in chunks
            while chunk := file_data.read(8192):
                f.write(chunk)
        
        # Return path as URL-like string for local storage
        return f"file://{full_path.absolute()}"

    async def download_file(self, path: str) -> BinaryIO:
        """Download a file from local storage."""
        from pathlib import Path
        import io
        
        full_path = Path(self.base_path) / path
        
        if not full_path.exists():
            raise FileNotFoundError(f"File not found: {path}")
        
        # Return as BytesIO for consistency
        data = full_path.read_bytes()
        return io.BytesIO(data)

    async def delete_file(self, path: str) -> bool:
        """Delete a file from local storage."""
        from pathlib import Path
        import os
        
        full_path = Path(self.base_path) / path
        
        if full_path.exists():
            full_path.unlink()
            return True
        return False

    async def get_file_url(self, path: str, expires_in: int = 3600) -> str:
        """Get a URL for accessing the file (local path)."""
        from pathlib import Path
        full_path = Path(self.base_path) / path
        return f"file://{full_path.absolute()}"
