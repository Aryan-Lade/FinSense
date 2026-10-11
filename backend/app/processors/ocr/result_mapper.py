"""
Result mapper for converting heterogeneous OCR engine raw outputs into canonical OcrPage.
"""
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from .base import OcrBlock, OcrPage


def map_raw_ocr_to_page(
    raw_output: Any,
    image_width: int,
    image_height: int,
    page_index: int = 0,
    engine_name: str = "paddleocr",
    engine_version: str = "3.0.0",
    min_score: float = 0.5,
    langs_used: Optional[List[str]] = None
) -> OcrPage:
    """
    Map raw engine outputs (RapidOCR or PaddleOCR 2.x/3.x) into canonical OcrPage
    with normalized 0.0 - 1.0 bounding boxes and reading-order line grouping.
    """
    raw_blocks: List[Dict[str, Any]] = []
    warnings: List[str] = []

    if not raw_output:
        return OcrPage(
            page_index=page_index,
            width=image_width,
            height=image_height,
            blocks=[],
            mean_conf=0.0,
            engine=engine_name,
            version=engine_version,
            langs_used=langs_used or ["en"],
            warnings=["Blank page or no text recognized"]
        )

    # 1. Detect output format
    # Case A: RapidOCR or PaddleOCR 2.x format: [[ [poly], (text, score) ], ...]
    if isinstance(raw_output, (list, tuple)):
        # Sometimes RapidOCR returns (results, time_cost)
        items = raw_output[0] if (len(raw_output) == 2 and isinstance(raw_output[1], (float, int, dict))) else raw_output

        if isinstance(items, (list, tuple)):
            for item in items:
                if not item:
                    continue
                try:
                    # RapidOCR / Paddle 2.x item format: [poly, text, score] or [poly, (text, score)]
                    poly = None
                    text = ""
                    score = 0.95

                    if len(item) == 2 and isinstance(item[1], (tuple, list)):
                        poly = item[0]
                        text = str(item[1][0]).strip()
                        score = float(item[1][1])
                    elif len(item) == 3:
                        poly = item[0]
                        text = str(item[1]).strip()
                        score = float(item[2])
                    elif isinstance(item, dict):
                        text = item.get("text", "")
                        score = float(item.get("score", 0.9))
                        poly = item.get("poly") or item.get("box")

                    if text and poly:
                        # Normalize polygon and compute bounding box
                        pts = np.array(poly, dtype=np.float32)
                        x0 = max(0.0, min(1.0, float(np.min(pts[:, 0])) / image_width))
                        y0 = max(0.0, min(1.0, float(np.min(pts[:, 1])) / image_height))
                        x1 = max(0.0, min(1.0, float(np.max(pts[:, 0])) / image_width))
                        y1 = max(0.0, min(1.0, float(np.max(pts[:, 1])) / image_height))

                        norm_poly = [[float(p[0]) / image_width, float(p[1]) / image_height] for p in pts]

                        raw_blocks.append({
                            "text": text,
                            "bbox": [x0, y0, x1, y1],
                            "poly": norm_poly,
                            "score": score,
                            "low_conf": score < min_score,
                            "y_center": (y0 + y1) / 2.0,
                            "x_center": (x0 + x1) / 2.0,
                            "height": y1 - y0
                        })
                except Exception as e:
                    warnings.append(f"Failed to parse OCR block: {str(e)}")

    # 2. Reading order line grouping (by y-center clustering)
    if not raw_blocks:
        return OcrPage(
            page_index=page_index,
            width=image_width,
            height=image_height,
            blocks=[],
            mean_conf=0.0,
            engine=engine_name,
            version=engine_version,
            langs_used=langs_used or ["en"],
            warnings=warnings
        )

    # Calculate median block height
    median_h = float(np.median([b["height"] for b in raw_blocks])) if raw_blocks else 0.02
    y_tolerance = max(0.008, 0.5 * median_h)

    # Sort blocks primarily by y_center
    sorted_by_y = sorted(raw_blocks, key=lambda b: b["y_center"])

    lines: List[List[Dict[str, Any]]] = []
    for b in sorted_by_y:
        placed = False
        for line in lines:
            # Check if block fits within y-tolerance of line average y-center
            avg_y = sum(item["y_center"] for item in line) / len(line)
            if abs(b["y_center"] - avg_y) <= y_tolerance:
                line.append(b)
                placed = True
                break
        if not placed:
            lines.append([b])

    # Sort lines from top to bottom
    lines.sort(key=lambda l: sum(b["y_center"] for b in l) / len(l))

    # Sort blocks within each line from left to right (x_center)
    final_blocks: List[OcrBlock] = []
    total_scores = []

    for line_idx, line in enumerate(lines):
        line.sort(key=lambda b: b["x_center"])
        for b in line:
            final_blocks.append(OcrBlock(
                text=b["text"],
                bbox=b["bbox"],
                poly=b["poly"],
                score=b["score"],
                low_conf=b["low_conf"],
                line_index=line_idx
            ))
            if b["score"] is not None:
                total_scores.append(b["score"])

    mean_conf = float(np.mean(total_scores)) if total_scores else 0.0

    return OcrPage(
        page_index=page_index,
        width=image_width,
        height=image_height,
        blocks=final_blocks,
        mean_conf=round(mean_conf, 4),
        engine=engine_name,
        version=engine_version,
        langs_used=langs_used or ["en"],
        passes=1,
        warnings=warnings
    )
