"""
OCR engine interface and canonical data structures.
"""
from typing import Protocol, List, Optional, Tuple, Dict, Any
from dataclasses import dataclass, field
from PIL import Image


@dataclass
class OcrBlock:
    """Single OCR text line/block with normalized coordinates."""
    text: str
    bbox: List[float]  # [x0, y0, x1, y1] normalized to 0.0 - 1.0 relative to display image
    poly: Optional[List[List[float]]] = None  # 4-point polygon [[x,y], [x,y], [x,y], [x,y]] normalized
    score: Optional[float] = None
    low_conf: bool = False
    line_index: int = 0


@dataclass
class OcrPage:
    """OCR results for a single document page."""
    page_index: int
    width: int
    height: int
    blocks: List[OcrBlock] = field(default_factory=list)
    mean_conf: float = 0.0
    engine: str = "none"
    version: str = "1.0.0"
    langs_used: List[str] = field(default_factory=lambda: ["en"])
    passes: int = 1
    warnings: List[str] = field(default_factory=list)

    @property
    def full_text(self) -> str:
        """Formatted full text ordered by lines."""
        lines = {}
        for block in self.blocks:
            lines.setdefault(block.line_index, []).append(block.text)
        sorted_lines = [lines[k] for k in sorted(lines.keys())]
        return "\n".join(" ".join(l) for l in sorted_lines)


@dataclass
class OcrResult:
    """Full document OCR result spanning multiple pages."""
    pages: List[OcrPage] = field(default_factory=list)
    full_text: str = ""

    def __post_init__(self):
        if not self.full_text and self.pages:
            self.full_text = "\n\n".join(p.full_text for p in self.pages)


class OcrEngine(Protocol):
    """Protocol implemented by all FinSense OCR engine adapters."""
    name: str
    version: str

    def available(self) -> bool:
        """Check if engine is importable and functional."""
        ...

    def warmup(self) -> None:
        """Idempotently warm up models in memory."""
        ...

    def recognize(
        self, 
        image: Image.Image, 
        *, 
        lang_hint: Optional[str] = None, 
        page_index: int = 0, 
        options: Optional[Dict[str, Any]] = None
    ) -> OcrPage:
        """Recognize full page image and return normalized OcrPage."""
        ...

    def recognize_region(
        self, 
        image: Image.Image, 
        bbox_px: Tuple[int, int, int, int], 
        *, 
        lang_hint: Optional[str] = None, 
        upscale: int = 2, 
        mode: str = "text"
    ) -> Optional[OcrBlock]:
        """Crop and recognize a specific image sub-region."""
        ...

    def close(self) -> None:
        """Clean up engine resources."""
        ...
