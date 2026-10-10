"""
File validator for detecting file types and validating uploads.
"""
import io
from typing import BinaryIO, Tuple, Optional
from app.core.errors import ProcessingException
from enum import Enum


class FileType(str, Enum):
    """Supported file types."""
    PDF = "pdf"
    PNG = "png"
    JPEG = "jpeg"
    CSV = "csv"
    TSV = "tsv"
    XLSX = "xlsx"
    ZIP = "zip"
    UNKNOWN = "unknown"


def detect_file_type(file_data: BinaryIO) -> FileType:
    """
    Detect file type by examining magic bytes.
    """
    # Save current position
    initial_pos = file_data.tell()
    
    try:
        file_data.seek(0)
        header = file_data.read(8)
        
        # Check against known signatures
        if header.startswith(b"%PDF"):
            return FileType.PDF
        elif header.startswith(b"\x89PNG\r\n\x1a\n"):
            return FileType.PNG
        elif header.startswith(b"\xff\xd8\xff"):
            return FileType.JPEG
        elif header.startswith(b"PK\x03\x04"):
            return FileType.ZIP
        
        # If no magic signature matched, try to detect as text-based (CSV/TSV)
        file_data.seek(0)
        chunk = file_data.read(1024)
        try:
            text_chunk = chunk.decode('utf-8')
            if ',' in text_chunk and '\n' in text_chunk:
                lines = text_chunk.strip().split('\n')
                if len(lines) > 1:
                    first_line_commas = lines[0].count(',')
                    if first_line_commas > 0:
                        similar_count = sum(1 for line in lines[1:] if line.count(',') == first_line_commas)
                        if similar_count >= len(lines) * 0.5:
                            return FileType.CSV
            if '\t' in text_chunk and '\n' in text_chunk:
                lines = text_chunk.strip().split('\n')
                if len(lines) > 1:
                    first_line_tabs = lines[0].count('\t')
                    if first_line_tabs > 0:
                        similar_count = sum(1 for line in lines[1:] if line.count('\t') == first_line_tabs)
                        if similar_count >= len(lines) * 0.5:
                            return FileType.TSV
        except UnicodeDecodeError:
            pass
        
        return FileType.UNKNOWN
        
    finally:
        # Restore original position
        file_data.seek(initial_pos)


def validate_file_type(file_type: FileType, filename: str) -> Tuple[bool, Optional[str]]:
    """Validate that the file type matches the extension and is supported."""
    if file_type == FileType.UNKNOWN:
        return False, "Unable to detect file type"
    
    extension = filename.lower().split('.')[-1] if '.' in filename else ''
    
    allowed_extensions = {
        FileType.PDF: ['pdf'],
        FileType.PNG: ['png'],
        FileType.JPEG: ['jpg', 'jpeg'],
        FileType.CSV: ['csv'],
        FileType.TSV: ['tsv'],
        FileType.XLSX: ['xlsx'],
        FileType.ZIP: ['zip'],
    }
    
    if file_type in allowed_extensions:
        if extension not in allowed_extensions[file_type]:
            return False, f"File extension '.{extension}' does not match detected file type {file_type.value}"
    
    supported_types = {
        FileType.PDF, FileType.PNG, FileType.JPEG, 
        FileType.CSV, FileType.TSV, FileType.XLSX, FileType.ZIP
    }
    
    if file_type not in supported_types:
        return False, f"File type {file_type.value} is not supported"
    
    return True, None


def validate_file_size(file_size: int, max_size_mb: int = 15) -> Tuple[bool, Optional[str]]:
    """Validate that file size is within limits."""
    max_size_bytes = max_size_mb * 1024 * 1024
    if file_size > max_size_bytes:
        return False, f"File size ({file_size} bytes) exceeds maximum allowed size ({max_size_mb} MB)"
    return True, None


def validate_upload_file(
    file_data: bytes, 
    filename: str,
    max_size_mb: int = 15
) -> Tuple[FileType, str]:
    """
    Comprehensive file validation for uploads.
    """
    # Validate file size
    is_valid, error_msg = validate_file_size(len(file_data), max_size_mb)
    if not is_valid:
        raise ProcessingException(error_msg, "file_size_exceeded")
    
    # Create file stream for type detection
    file_stream = io.BytesIO(file_data)
    
    # Detect file type
    detected_type = detect_file_type(file_stream)
    
    # Validate file type matches extension
    is_valid, error_msg = validate_file_type(detected_type, filename)
    if not is_valid:
        raise ProcessingException(error_msg, "file_type_mismatch")
    
    # For now, skip detailed content validation to keep it simple
    # In production, you would add more detailed validation here
    
    # Generate storage path
    import uuid
    from datetime import datetime
    
    # Create unique filename: {uuid}.{extension}
    file_extension = filename.split('.')[-1] if '.' in filename else ''
    unique_filename = f"{uuid.uuid4()}.{file_extension}" if file_extension else str(uuid.uuid4())
    
    # Create path structure: {year}/{month}/{day}/{uuid}.{extension}
    now = datetime.now()
    file_path = f"{now.year}/{now.month:02d}/{now.day:02d}/{unique_filename}"
    
    return detected_type, file_path
