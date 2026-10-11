"""
OCR engine interface, adapters, and pool.
"""
from .base import OcrEngine, OcrBlock, OcrPage, OcrResult
from .paddle_adapter import PaddleAdapter
from .fake_adapter import FakeAdapter
from .tesseract_adapter import TesseractAdapter
from .null_adapter import NullAdapter
from .result_mapper import map_raw_ocr_to_page
from .lang_strategy import execute_lang_strategy, merge_ocr_passes, calculate_iou
from .region_reread import reread_field_region
from .pool import get_ocr_engine, get_ocr_semaphore, warmup_ocr_background

__all__ = [
    "OcrEngine",
    "OcrBlock",
    "OcrPage",
    "OcrResult",
    "PaddleAdapter",
    "FakeAdapter",
    "TesseractAdapter",
    "NullAdapter",
    "map_raw_ocr_to_page",
    "execute_lang_strategy",
    "merge_ocr_passes",
    "calculate_iou",
    "reread_field_region",
    "get_ocr_engine",
    "get_ocr_semaphore",
    "warmup_ocr_background",
]
