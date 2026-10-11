"""
Safe ZIP archive extraction with zip-slip protection and quota guards.
Section 15: Safe ZIP processing, path traversal guard, compression-bomb limit.
"""
from typing import List, Tuple
import os
import zipfile
from pathlib import Path
from app.core.config import settings

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".csv", ".xlsx"}
MAX_COMPRESSION_RATIO = 100  # Avoid decompression bomb


class ZipSecurityError(Exception):
    pass


def extract_safe_zip(
    zip_bytes: bytes,
    destination_dir: Path,
    max_files: int = 50
) -> List[Path]:
    """
    Safely extract archive guarding against zip-slip and decompression bombs.
    Returns list of extracted file paths.
    """
    destination_dir = destination_dir.resolve()
    destination_dir.mkdir(parents=True, exist_ok=True)
    extracted_paths: List[Path] = []

    import io
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        infolist = zf.infolist()
        valid_entries = [
            i for i in infolist 
            if not i.is_dir() 
            and not i.filename.startswith("__MACOSX") 
            and not os.path.basename(i.filename).startswith(".")
        ]

        if len(valid_entries) > max_files:
            raise ZipSecurityError(f"ZIP contains {len(valid_entries)} files, exceeding limit of {max_files}.")

        total_uncompressed = 0
        total_compressed = len(zip_bytes)

        for info in valid_entries:
            ext = Path(info.filename).suffix.lower()
            if ext not in ALLOWED_EXTENSIONS:
                continue

            total_uncompressed += info.file_size
            if total_compressed > 0 and (total_uncompressed / total_compressed) > MAX_COMPRESSION_RATIO:
                raise ZipSecurityError("Decompression ratio exceeds safe threshold (possible zip bomb).")

            # Zip slip guard
            target_path = (destination_dir / info.filename).resolve()
            if not str(target_path).startswith(str(destination_dir)):
                raise ZipSecurityError(f"Illegal path traversal detected in entry: {info.filename}")

            target_path.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(info) as src, open(target_path, "wb") as dst:
                dst.write(src.read())

            extracted_paths.append(target_path)

    return extracted_paths
