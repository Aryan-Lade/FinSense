# FinSense OCR Engine & Adapter Architecture (ocr.md)

## 1. Engine Adapter Contract
FinSense decouples document ingestion from specific OCR libraries using the `OcrEngine` protocol:

```python
class OcrEngine(Protocol):
    name: str
    version: str
    def available(self) -> bool: ...
    def warmup(self) -> None: ...
    def recognize(self, image, *, lang_hint=None, page_index=0, options=None) -> OcrPage: ...
    def recognize_region(self, image, bbox_px, *, lang_hint=None, upscale=2, mode="text") -> Optional[OcrBlock]: ...
    def close(self) -> None: ...
```

## 2. Implementations
1. **`PaddleAdapter` (`paddle_adapter.py`):**
   - Reuses the project's existing RapidOCR / PaddleOCR ONNX runtime engine (`app.processors.ocr_processor.OCRProcessor`).
   - Maps raw text blocks to canonical `OcrPage` with normalized `0.0 - 1.0` bounding boxes.
2. **`FakeAdapter` (`fake_adapter.py`):**
   - Deterministic OCR responses for offline testing, CI environments, and demo mode.
3. **`TesseractAdapter` (`tesseract_adapter.py`):**
   - System binary fallback for local deployments.
4. **`NullAdapter` (`null_adapter.py`):**
   - Clean empty result handler when OCR is bypassed or disabled.

## 3. Coordinate System & UI Highlighting
- All OCR bounding boxes are normalized to `[x0, y0, x1, y1]` between `0.0` and `1.0` relative to the display image served by the document endpoint.
- Highlighting boxes in the UI uses SVG/Canvas overlays without coordinate distortion.

## 4. Multi-Language Strategy & Bounded Passes
- **`auto` Strategy:** Pass 1 executes with primary language (English or Hindi).
- If mean confidence < 0.6 or low-confidence block ratio > 40%, Pass 2 executes with the alternate profile.
- Overlapping boxes are merged by Intersection over Union (IoU ≥ 0.5), keeping the higher-scoring text block. Maximum 2 passes per page.
