"""
Supabase storage backend adapter.
"""
from typing import BinaryIO, Optional
import httpx
from app.adapters.storage_base import StorageBackend


class SupabaseStorageBackend(StorageBackend):
    """Supabase storage backend implementation."""

    def __init__(
        self, 
        supabase_url: str, 
        supabase_key: str, 
        bucket_name: str = "finsense-files"
    ):
        self.supabase_url = supabase_url.rstrip("/")
        self.supabase_key = supabase_key
        self.bucket_name = bucket_name
        self.client = httpx.AsyncClient(
            base_url=f"{self.supabase_url}/storage/v1",
            headers={
                "Authorization": f"Bearer {self.supabase_key}",
                "Content-Type": "application/json"
            }
        )

    async def upload_file(
        self, 
        file_data: BinaryIO, 
        path: str, 
        content_type: str
    ) -> str:
        """Upload a file to Supabase storage."""
        # Reset file pointer to beginning if possible
        if hasattr(file_data, 'seek'):
            file_data.seek(0)
        
        # Read file data
        file_data.seek(0, 2)  # Seek to end
        file_size = file_data.tell()
        file_data.seek(0)  # Reset to beginning
        
        data = file_data.read(file_size)
        
        # Upload to Supabase
        response = await self.client.post(
            f"/object/{self.bucket_name}/{path}",
            content=data,
            headers={"Content-Type": content_type}
        )
        
        if response.status_code not in (200, 201):
            raise Exception(f"Failed to upload file: {response.text}")
        
        # Return public URL
        return f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}/{path}"

    async def download_file(self, path: str) -> BinaryIO:
        """Download a file from Supabase storage."""
        import io
        
        response = await self.client.get(
            f"/object/{self.bucket_name}/{path}"
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to download file: {response.text}")
        
        return io.BytesIO(response.content)

    async def delete_file(self, path: str) -> bool:
        """Delete a file from Supabase storage."""
        response = await self.client.delete(
            f"/object/{self.bucket_name}/{path}"
        )
        
        if response.status_code == 200:
            return True
        elif response.status_code == 404:
            return False  # Already deleted
        else:
            raise Exception(f"Failed to delete file: {response.text}")

    async def get_file_url(self, path: str, expires_in: int = 3600) -> str:
        """Get a URL for accessing the file."""
        # For Supabase, we can return a public URL or generate a signed URL
        # For simplicity, we'll return the public URL
        return f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}/{path}"

    async def __aexit__(self):
        """Clean up HTTP client."""
        await self.client.aclose()
