"""
Tesseract OCR adapter for FinSense fallback.
"""
from typing import Optional, Dict, Any, Tuple, List
from PIL import Image
from .base import OcrEngine, OcrPage, OcrBlock


class TesseractAdapter:
    """Tesseract adapter utilizing pytesseract if installed."""

    def __init__(self, min_score: float = 0.5):
        self.name = "tesseract"
        self.version = "5.0.0"
        self.min_score = min_score
        self._available = False
        try:
            import pytesseract
            self._pt = pytesseract
            self._available = True
        except ImportError:
            self._pt = None
            self._available = False

    def available(self) -> bool:
        return self._available

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
        if not self.available():
            return OcrPage(
                page_index=page_index,
                width=image.width,
                height=image.height,
                blocks=[],
                mean_conf=0.0,
                engine="tesseract",
                warnings=["Tesseract not available on system"]
            )

        lang = "hin+eng" if lang_hint == "hi" else "eng"
        try:
            data = self._pt.image_to_data(image, lang=lang, output_type=self._pt.Output.DICT)
            blocks: List[OcrBlock] = []
            n_boxes = len(data['text'])
            w, h = image.width, image.height
            for i in range(n_boxes):
                text = data['text'][i].strip()
                conf_val = float(data['conf'][i])
                if not text or conf_val < 0:
                    continue
                score = round(conf_val / 100.0, 4)
                x0 = float(data['left'][i]) / w
                y0 = float(data['top'][i]) / h
                x1 = float(data['left'][i] + data['width'][i]) / w
                y1 = float(data['top'][i] + data['height'][i]) / h
                blocks.append(
                    OcrBlock(
                        text=text,
                        bbox=[x0, y0, x1, y1],
                        score=score,
                        low_conf=score < self.min_score,
                        line_index=int(data['line_num'][i])
                    )
                )

            mean_c = round(sum(b.score for b in blocks if b.score) / max(len(blocks), 1), 4)
            return OcrPage(
                page_index=page_index,
                width=w,
                height=h,
                blocks=blocks,
                mean_conf=mean_c,
                engine="tesseract",
                version=self.version,
                langs_used=[lang]
            )
        except Exception as e:
            return OcrPage(
                page_index=page_index,
                width=image.width,
                height=image.height,
                blocks=[],
                mean_conf=0.0,
                engine="tesseract",
                warnings=[str(e)]
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
        if not self.available():
            return None
        x0, y0, x1, y1 = bbox_px
        crop = image.crop((x0, y0, x1, y1))
        page = self.recognize(crop, lang_hint=lang_hint)
        if page.blocks:
            return page.blocks[0]
        return None

    def close(self) -> None:
        pass
