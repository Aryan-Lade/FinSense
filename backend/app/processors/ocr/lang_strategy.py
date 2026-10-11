"""
Language strategy and multi-pass OCR merging based on IoU.
Implements Section 10.0.4: auto strategy, bounded 2 passes, IoU box merge.
"""
from typing import List, Tuple, Optional
from PIL import Image
from .base import OcrEngine, OcrPage, OcrBlock


def calculate_iou(box1: List[float], box2: List[float]) -> float:
    """Calculate Intersection over Union for two normalized boxes [x0, y0, x1, y1]."""
    x_left = max(box1[0], box2[0])
    y_top = max(box1[1], box2[1])
    x_right = min(box1[2], box2[2])
    y_bottom = min(box1[3], box2[3])

    if x_right < x_left or y_bottom < y_top:
        return 0.0

    intersection_area = (x_right - x_left) * (y_bottom - y_top)
    box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
    box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])

    union_area = box1_area + box2_area - intersection_area
    if union_area <= 0:
        return 0.0

    return intersection_area / union_area


def merge_ocr_passes(page1: OcrPage, page2: OcrPage, iou_threshold: float = 0.5) -> OcrPage:
    """
    Merge two OCR passes by IoU:
    For overlapping boxes, keep the higher-scoring text.
    Keep non-overlapping boxes from both passes.
    """
    merged_blocks: List[OcrBlock] = []
    matched_page2_indices = set()

    for b1 in page1.blocks:
        best_match_idx = -1
        best_iou = 0.0

        for idx, b2 in enumerate(page2.blocks):
            if idx in matched_page2_indices:
                continue
            iou = calculate_iou(b1.bbox, b2.bbox)
            if iou > best_iou:
                best_iou = iou
                best_match_idx = idx

        if best_iou >= iou_threshold and best_match_idx >= 0:
            matched_page2_indices.add(best_match_idx)
            b2 = page2.blocks[best_match_idx]
            # Keep higher scoring block
            score1 = b1.score or 0.0
            score2 = b2.score or 0.0
            if score2 > score1:
                merged_blocks.append(b2)
            else:
                merged_blocks.append(b1)
        else:
            merged_blocks.append(b1)

    # Add remaining unmatched blocks from page2
    for idx, b2 in enumerate(page2.blocks):
        if idx not in matched_page2_indices:
            merged_blocks.append(b2)

    # Sort blocks top-to-bottom, left-to-right
    merged_blocks.sort(key=lambda b: (b.bbox[1], b.bbox[0]))
    for idx, b in enumerate(merged_blocks):
        b.line_index = idx

    mean_score = (
        round(sum(b.score for b in merged_blocks if b.score is not None) / max(len(merged_blocks), 1), 4)
        if merged_blocks else 0.0
    )

    combined_langs = list(set(page1.langs_used + page2.langs_used))

    return OcrPage(
        page_index=page1.page_index,
        width=page1.width,
        height=page1.height,
        blocks=merged_blocks,
        mean_conf=mean_score,
        engine=page1.engine,
        version=page1.version,
        langs_used=combined_langs,
        passes=page1.passes + page2.passes,
        warnings=page1.warnings + page2.warnings
    )


def execute_lang_strategy(
    engine: OcrEngine,
    image: Image.Image,
    *,
    strategy: str = "auto",
    page_index: int = 0,
    allowed_langs: Tuple[str, ...] = ("en", "hi")
) -> OcrPage:
    """
    Execute OCR using specified language strategy.
    Strategy 'auto':
      - Pass 1 with primary language (en or hi).
      - If mean score < 0.6 or > 40% low-conf blocks, run pass 2 with other language.
      - Merge passes by IoU (bounded to max 2 passes).
    """
    if strategy in ("en", "hi"):
        return engine.recognize(image, lang_hint=strategy, page_index=page_index)

    # Strategy: auto
    primary_lang = "en"
    pass1 = engine.recognize(image, lang_hint=primary_lang, page_index=page_index)
    pass1.passes = 1

    low_conf_count = sum(1 for b in pass1.blocks if b.low_conf or (b.score and b.score < 0.6))
    total_blocks = len(pass1.blocks)
    needs_second_pass = False

    if total_blocks == 0 or (pass1.mean_conf < 0.6 and "hi" in allowed_langs):
        needs_second_pass = True
    elif total_blocks > 0 and (low_conf_count / total_blocks) > 0.4 and "hi" in allowed_langs:
        needs_second_pass = True

    if needs_second_pass and "hi" in allowed_langs:
        pass2 = engine.recognize(image, lang_hint="hi", page_index=page_index)
        pass2.passes = 1
        return merge_ocr_passes(pass1, pass2)

    return pass1
