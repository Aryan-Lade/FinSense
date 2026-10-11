"""
AI and Extraction module.
"""
from .extractor_base import Extractor
from .mock import MockExtractor
from .heuristic import HeuristicExtractor
from .vlm import VLMExtractor
from .factory import get_extractor
from .normalizer import normalize_invoice_dict, normalize_devanagari_digits
from .prompts import EXTRACTION_SYSTEM_PROMPT, JSON_SCHEMA_EXAMPLE, get_reread_prompt

__all__ = [
    "Extractor",
    "MockExtractor",
    "HeuristicExtractor",
    "VLMExtractor",
    "get_extractor",
    "normalize_invoice_dict",
    "normalize_devanagari_digits",
    "EXTRACTION_SYSTEM_PROMPT",
    "JSON_SCHEMA_EXAMPLE",
    "get_reread_prompt",
]
