"""
Thread-safe OCR engine pool with concurrency management and background warmup.
Section 10.0.4 & 10.0.7.
"""
import threading
from typing import Optional, Dict
from app.core.config import settings
from .base import OcrEngine
from .paddle_adapter import PaddleAdapter
from .fake_adapter import FakeAdapter
from .tesseract_adapter import TesseractAdapter
from .null_adapter import NullAdapter

_pool_lock = threading.Lock()
_engines: Dict[str, OcrEngine] = {}
_concurrency_semaphore: Optional[threading.Semaphore] = None


def get_ocr_semaphore() -> threading.Semaphore:
    """Get or initialize global OCR concurrency semaphore."""
    global _concurrency_semaphore
    if _concurrency_semaphore is None:
        with _pool_lock:
            if _concurrency_semaphore is None:
                concurrency = max(1, getattr(settings, "OCR_CONCURRENCY", 1))
                _concurrency_semaphore = threading.Semaphore(concurrency)
    return _concurrency_semaphore


def get_ocr_engine(engine_name: Optional[str] = None) -> OcrEngine:
    """
    Get or lazily initialize the requested OCR engine.
    Resolves 'auto' to:
      1. paddle if available
      2. tesseract if available
      3. fake if DEMO_MODE=True
      4. null otherwise
    """
    chosen = (engine_name or getattr(settings, "OCR_ENGINE", "auto")).lower()

    if chosen == "auto":
        paddle = PaddleAdapter(min_score=getattr(settings, "OCR_MIN_SCORE", 0.5))
        if paddle.available():
            chosen = "paddle"
        else:
            tess = TesseractAdapter()
            if tess.available():
                chosen = "tesseract"
            elif getattr(settings, "DEMO_MODE", True):
                chosen = "fake"
            else:
                chosen = "none"

    with _pool_lock:
        if chosen in _engines:
            return _engines[chosen]

        engine: OcrEngine
        if chosen in ("paddle", "paddleocr"):
            engine = PaddleAdapter(min_score=getattr(settings, "OCR_MIN_SCORE", 0.5))
        elif chosen == "fake":
            engine = FakeAdapter()
        elif chosen == "tesseract":
            engine = TesseractAdapter(min_score=getattr(settings, "OCR_MIN_SCORE", 0.5))
        else:
            engine = NullAdapter()

        _engines[chosen] = engine
        return engine


def warmup_ocr_background() -> None:
    """Trigger background warmup if OCR_WARMUP is True."""
    if not getattr(settings, "OCR_WARMUP", True):
        return

    def _worker():
        try:
            eng = get_ocr_engine()
            eng.warmup()
        except Exception:
            pass

    t = threading.Thread(target=_worker, daemon=True)
    t.start()
