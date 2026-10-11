"""
Extractor factory resolving auto, mock, heuristic, and VLM extractors.
"""
from typing import Optional
from app.core.config import settings
from .extractor_base import Extractor
from .mock import MockExtractor
from .heuristic import HeuristicExtractor
from .vlm import VLMExtractor


def get_extractor(name: Optional[str] = None) -> Extractor:
    """
    Get or instantiate extractor according to configuration.
    """
    chosen = (name or getattr(settings, "EXTRACTOR", "auto")).lower()

    if chosen == "auto":
        if getattr(settings, "GEMINI_API_KEY", "") or getattr(settings, "VLM_BASE_URL", ""):
            return VLMExtractor()
        elif getattr(settings, "DEMO_MODE", True):
            return MockExtractor()
        else:
            return HeuristicExtractor()

    if chosen == "vlm":
        return VLMExtractor()
    elif chosen == "heuristic":
        return HeuristicExtractor()
    else:
        return MockExtractor()
