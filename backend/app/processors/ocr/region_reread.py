"""
Region re-reading implementation for targeted field refinement.
Section 10.0.6: bounded validator-guided region re-read without whole-image re-OCR.
"""
from typing import Optional, List, Dict, Any, Tuple
from PIL import Image, ImageFilter
from .base import OcrEngine, OcrBlock


def reread_field_region(
    engine: OcrEngine,
    image: Image.Image,
    bbox_normalized: List[float],
    *,
    padding: float = 0.10,
    upscale: int = 2,
    mode: str = "text",
    lang_hint: Optional[str] = None
) -> Optional[OcrBlock]:
    """
    Crops normalized bbox [x0, y0, x1, y1] with padding, upscales, and re-runs OCR.
    """
    if not engine.available() or not bbox_normalized or len(bbox_normalized) < 4:
        return None

    w, h = image.width, image.height
    x0, y0, x1, y1 = bbox_normalized

    box_w = x1 - x0
    box_h = y1 - y0

    # Apply padding
    px0 = max(0.0, x0 - box_w * padding)
    py0 = max(0.0, y0 - box_h * padding)
    px1 = min(1.0, x1 + box_w * padding)
    py1 = min(1.0, y1 + box_h * padding)

    # Convert to pixels
    crop_px = (
        int(px0 * w),
        int(py0 * h),
        int(px1 * w),
        int(py1 * h)
    )

    if crop_px[2] <= crop_px[0] or crop_px[3] <= crop_px[1]:
        return None

    crop_img = image.crop(crop_px)

    if upscale > 1:
        crop_img = crop_img.resize(
            (crop_img.width * upscale, crop_img.height * upscale),
            Image.Resampling.BICUBIC
        )

    # Light sharpening for small cropped characters
    crop_img = crop_img.filter(ImageFilter.SHARPEN)

    res = engine.recognize_region(
        image=image,
        bbox_px=crop_px,
        lang_hint=lang_hint,
        upscale=upscale,
        mode=mode
    )

    if res:
        # Constrain candidates for specific modes
        text = res.text.strip()
        if mode == "gstin":
            # Keep alphanumeric uppercase only
            cleaned = "".join(c.upper() for c in text if c.isalnum())
            res.text = cleaned
        elif mode == "amount":
            # Keep digits, dot, comma
            cleaned = "".join(c for c in text if c.isdigit() or c in ".,")
            res.text = cleaned

    return res
