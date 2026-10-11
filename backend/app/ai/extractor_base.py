"""
Base Extractor protocol and data structures.
"""
from typing import Protocol, List, Dict, Any, Tuple, Optional
from PIL import Image
from app.processors.ocr.base import OcrResult


class Extractor(Protocol):
    """Protocol for all invoice information extractors."""
    name: str

    def extract(
        self,
        images: List[Image.Image],
        ocr_result: OcrResult,
        hints: Optional[Dict[str, Any]] = None
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Extract canonical invoice dictionary and provenance dictionary.
        Returns (raw_invoice_dict, provenance_dict).
        """
        ...

    def reread(
        self,
        images: List[Image.Image],
        ocr_result: OcrResult,
        field_paths: List[str],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Targeted re-read of specific fields (bounded refinement).
        Returns {field_path: new_value}.
        """
        ...
