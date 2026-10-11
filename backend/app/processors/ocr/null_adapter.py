"""
Null OCR adapter for when OCR is disabled or not applicable.
"""
from typing import Optional, Dict, Any, Tuple
from PIL import Image
from .base import OcrEngine, OcrPage, OcrBlock


class NullAdapter:
    """Null adapter that returns empty blocks cleanly."""

    def __init__(self):
        self.name = "none"
        self.version = "1.0.0"

    def available(self) -> bool:
        return True

    def warmup(self) -> None:
        pass

    def recognize(
        self, 
        image: Image.Image, 
        *, 
        lang_hint: Optional[str] = None, 
        page_index: int = 0, 
        options: Optional[Dict[str, Any]] = None
    ) -> OcrPage:
        return OcrPage(
            page_index=page_index,
            width=image.width,
            height=image.height,
            blocks=[],
            mean_conf=0.0,
            engine="none",
            version=self.version,
            langs_used=[],
            passes=0,
            warnings=["OCR disabled or none engine selected"]
        )

    def recognize_region(
        self, 
        image: Image.Image, 
        bbox_px: Tuple[int, int, int, int], 
        *, 
        lang_hint: Optional[str] = None, 
        upscale: int = 2, 
        mode: str = "text"
    ) -> Optional[OcrBlock]:
        return None

    def close(self) -> None:
        pass
