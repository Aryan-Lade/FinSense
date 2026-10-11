"""
PaddleOCR / RapidOCR adapter for FinSense.
Wraps the project's existing OCR implementation behind the canonical OcrEngine protocol.
"""
from typing import Optional, Dict, Any, Tuple, List
import numpy as np
from PIL import Image
from .base import OcrEngine, OcrPage, OcrBlock
from .result_mapper import map_raw_ocr_to_page
from app.processors.ocr_processor import get_paddle_engine, OCRProcessor


class PaddleAdapter:
    """PaddleOCR / RapidOCR Engine Adapter."""

    def __init__(self, name: str = "paddleocr", min_score: float = 0.5):
        self.name = name
        self.version = "3.0.0"
        self.min_score = min_score
        self._engine, self._engine_type = get_paddle_engine()

    def available(self) -> bool:
        """Check if engine is functional."""
        return self._engine is not None

    def warmup(self) -> None:
        """Warm up engine by running a 64x64 dummy image."""
        if self._engine is not None:
            try:
                dummy = np.zeros((64, 64, 3), dtype=np.uint8)
                if hasattr(self._engine, '__call__'):
                    self._engine(dummy)
                elif hasattr(self._engine, 'ocr'):
                    self._engine.ocr(dummy, cls=True)
            except Exception:
                pass

    def recognize(
        self, 
        image: Image.Image, 
        *, 
        lang_hint: Optional[str] = None, 
        page_index: int = 0, 
        options: Optional[Dict[str, Any]] = None
    ) -> OcrPage:
        """Run OCR on image and return canonical OcrPage."""
        if not self.available():
            return OcrPage(
                page_index=page_index,
                width=image.width,
                height=image.height,
                blocks=[],
                mean_conf=0.0,
                engine="none",
                warnings=["PaddleOCR engine unavailable"]
            )

        # Use the project's existing preprocessed OCR pipeline
        text, blocks, mean_conf, engine_type = OCRProcessor.run_paddle_ocr(image)

        # Map to canonical OcrPage
        return map_raw_ocr_to_page(
            raw_output=blocks,
            image_width=image.width,
            image_height=image.height,
            page_index=page_index,
            engine_name=self._engine_type or self.name,
            engine_version=self.version,
            min_score=self.min_score,
            langs_used=[lang_hint or "en"]
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
        """Crop and recognize a specific sub-region."""
        if not self.available():
            return None

        x0, y0, x1, y1 = bbox_px
        crop = image.crop((x0, y0, x1, y1))
        if upscale > 1:
            crop = crop.resize((crop.width * upscale, crop.height * upscale), Image.Resampling.BICUBIC)

        page = self.recognize(crop, lang_hint=lang_hint)
        if page.blocks:
            # Return merged block
            merged_text = " ".join(b.text for b in page.blocks)
            avg_score = float(np.mean([b.score for b in page.blocks if b.score is not None])) if page.blocks else 0.9
            return OcrBlock(
                text=merged_text,
                bbox=[float(x0)/image.width, float(y0)/image.height, float(x1)/image.width, float(y1)/image.height],
                score=round(avg_score, 4)
            )
        return None

    def close(self) -> None:
        """Cleanup resources."""
        pass
