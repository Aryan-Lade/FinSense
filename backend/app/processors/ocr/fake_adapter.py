"""
Fake OCR adapter for deterministic testing and DEMO_MODE.
Can load from sidecar *.mock.json or return deterministic blocks based on image dimensions.
"""
from typing import Optional, Dict, Any, Tuple, List
import json
from pathlib import Path
from PIL import Image
from .base import OcrEngine, OcrPage, OcrBlock


class FakeAdapter:
    """Deterministic Fake OCR Adapter for tests and offline demo mode."""

    def __init__(self, name: str = "fake", sidecar_data: Optional[Dict[str, Any]] = None):
        self.name = name
        self.version = "1.0.0"
        self._sidecar = sidecar_data or {}

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
        # Check if sidecar data provides blocks
        blocks: List[OcrBlock] = []
        if self._sidecar and "blocks" in self._sidecar:
            for b in self._sidecar["blocks"]:
                blocks.append(
                    OcrBlock(
                        text=b.get("text", ""),
                        bbox=b.get("bbox", [0.1, 0.1, 0.9, 0.2]),
                        score=b.get("score", 0.95),
                        low_conf=b.get("low_conf", False),
                        line_index=b.get("line_index", 0)
                    )
                )
        else:
            # Generate deterministic sample blocks representing an invoice
            sample_lines = [
                ("TAX INVOICE", [0.4, 0.05, 0.6, 0.09], 0.98),
                ("Darshan Engineering", [0.05, 0.12, 0.45, 0.16], 0.95),
                ("GSTIN: 27AAPFU0939F1ZV", [0.05, 0.17, 0.40, 0.20], 0.96),
                ("Invoice No: DE/2026/0491", [0.60, 0.12, 0.92, 0.15], 0.94),
                ("Date: 15/09/2026", [0.60, 0.16, 0.85, 0.19], 0.95),
                ("Billed To: Gujarat Freight Tools", [0.05, 0.23, 0.45, 0.26], 0.92),
                ("GSTIN: 24AAACG1234A1Z5", [0.05, 0.27, 0.40, 0.30], 0.94),
                ("Description HSN Qty Rate Taxable Total", [0.05, 0.35, 0.95, 0.38], 0.91),
                ("Industrial Valves 8481 2 2500 5000.00 5900.00", [0.05, 0.40, 0.95, 0.43], 0.93),
                ("Sub Total: 5000.00", [0.65, 0.50, 0.95, 0.53], 0.95),
                ("IGST @ 18%: 900.00", [0.65, 0.54, 0.95, 0.57], 0.96),
                ("Grand Total: 5900.00", [0.65, 0.60, 0.95, 0.64], 0.98),
            ]
            for idx, (text, bbox, score) in enumerate(sample_lines):
                blocks.append(
                    OcrBlock(
                        text=text,
                        bbox=bbox,
                        score=score,
                        low_conf=score < 0.85,
                        line_index=idx
                    )
                )

        return OcrPage(
            page_index=page_index,
            width=image.width,
            height=image.height,
            blocks=blocks,
            mean_conf=round(sum(b.score for b in blocks if b.score) / max(len(blocks), 1), 4),
            engine=self.name,
            version=self.version,
            langs_used=[lang_hint or "en"],
            passes=1
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
        return OcrBlock(
            text="27AAPFU0939F1ZV" if "gstin" in mode.lower() else "5900.00",
            bbox=[0.1, 0.1, 0.9, 0.9],
            score=0.97
        )

    def close(self) -> None:
        pass
