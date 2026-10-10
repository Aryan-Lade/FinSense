"""
OCR and language detection processor for invoice documents.
Implements the Open-Source PaddleOCR model (https://github.com/PaddlePaddle/PaddleOCR.git):
1. PaddleOCR (PP-OCRv4 bilingual Devanagari & English) with seamless ONNX engine fallback.
2. pdfplumber for high-precision digital vector PDF text and table extraction.
3. pypdfium2 for 200 DPI scanned PDF page rasterization into PaddleOCR.
4. OpenCV for blur detection (Laplacian variance) and image quality screening.
"""
import io
import re
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, List, Optional, Tuple
from app.core.errors import ProcessingException
from app.processors.file_validator import FileType

# Cached PaddleOCR engine instance
_paddle_engine = None
_paddle_engine_type = None


def get_paddle_engine():
    """
    Load Open-Source PaddleOCR engine (https://github.com/PaddlePaddle/PaddleOCR.git).
    Tries native paddleocr first, and gracefully falls back to RapidOCR (PaddleOCR ONNX engine).
    """
    global _paddle_engine, _paddle_engine_type
    if _paddle_engine is not None:
        return _paddle_engine, _paddle_engine_type

    # 1. Try native PaddleOCR
    try:
        from paddleocr import PaddleOCR
        # Initialize with Devanagari for Hindi and English support
        _paddle_engine = PaddleOCR(use_angle_cls=True, lang='devanagari', show_log=False)
        _paddle_engine_type = "paddleocr"
        return _paddle_engine, _paddle_engine_type
    except Exception:
        pass

    # 2. Try RapidOCR (Official PaddleOCR ONNX Runtime port)
    try:
        from rapidocr_onnxruntime import RapidOCR
        _paddle_engine = RapidOCR()
        _paddle_engine_type = "rapidocr"
        return _paddle_engine, _paddle_engine_type
    except Exception:
        pass

    return None, "none"


class OCRProcessor:
    """Process documents using PaddleOCR, PDF extraction, and bilingual language detection."""

    @staticmethod
    def is_ocr_supported(file_type: FileType) -> bool:
        """Check if OCR/text extraction is supported for the given file type."""
        return file_type in [FileType.PDF, FileType.PNG, FileType.JPEG, FileType.WEBP]

    @staticmethod
    def assess_image_quality(img_np: np.ndarray) -> Dict[str, Any]:
        """Assess image readability (blur and contrast) using OpenCV."""
        if len(img_np.shape) == 3:
            gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
        else:
            gray = img_np

        # Laplacian variance for blur detection (< 100 considered blurry)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_blurry = laplacian_var < 100.0

        # Contrast: standard deviation of pixel intensities
        contrast_std = float(np.std(gray))
        is_low_contrast = contrast_std < 35.0

        return {
            "is_blurry": is_blurry,
            "blur_score": round(laplacian_var, 2),
            "contrast_score": round(contrast_std, 2),
            "is_low_contrast": is_low_contrast,
            "quality_rating": "poor" if (is_blurry or is_low_contrast) else "good"
        }

    @classmethod
    def run_paddle_ocr(cls, img: Image.Image) -> Tuple[str, List[Dict[str, Any]], float, str]:
        """
        Run PaddleOCR on a PIL image and return text, word blocks, confidence, and engine name.
        """
        engine, engine_type = get_paddle_engine()
        img_np = np.array(img.convert('RGB'))

        if engine is None:
            return "", [], 0.0, "none"

        text_lines = []
        word_blocks = []
        conf_scores = []

        try:
            if engine_type == "paddleocr":
                # Native PaddleOCR API
                # result structure: [ [ [box_coords], (text, confidence) ], ... ]
                ocr_res = engine.ocr(img_np, cls=True)
                if ocr_res and len(ocr_res) > 0 and ocr_res[0]:
                    for item in ocr_res[0]:
                        box = item[0]
                        text, score = item[1][0], float(item[1][1])
                        text_lines.append(text)
                        conf_scores.append(score)

                        xs = [pt[0] for pt in box]
                        ys = [pt[1] for pt in box]
                        bbox = [round(min(xs), 1), round(min(ys), 1), round(max(xs), 1), round(max(ys), 1)]
                        word_blocks.append({
                            "text": text,
                            "confidence": round(score, 3),
                            "bbox": bbox
                        })

            elif engine_type == "rapidocr":
                # RapidOCR (PaddleOCR ONNX) API
                # result structure: [ [box, text, confidence], ... ]
                ocr_res, _ = engine(img_np)
                if ocr_res:
                    for item in ocr_res:
                        box, text, score = item[0], item[1], float(item[2])
                        text_lines.append(text)
                        conf_scores.append(score)

                        xs = [pt[0] for pt in box]
                        ys = [pt[1] for pt in box]
                        bbox = [round(min(xs), 1), round(min(ys), 1), round(max(xs), 1), round(max(ys), 1)]
                        word_blocks.append({
                            "text": text,
                            "confidence": round(score, 3),
                            "bbox": bbox
                        })

        except Exception as e:
            return "", [], 0.0, engine_type

        full_text = "\n".join(text_lines)
        avg_conf = round(sum(conf_scores) / len(conf_scores), 3) if conf_scores else 0.0
        return full_text, word_blocks, avg_conf, engine_type

    @classmethod
    def extract_text_from_pdf(cls, file_data: bytes) -> Dict[str, Any]:
        """
        Extract text from PDF using direct digital PDF parsing (pdfplumber)
        with fallback to 200 DPI PaddleOCR rasterization for scanned PDFs.
        """
        import pdfplumber

        extracted_text = ""
        word_blocks = []
        pages_count = 0
        is_scanned = False
        avg_confidence = 0.95
        engine_used = "pdfplumber"

        try:
            with pdfplumber.open(io.BytesIO(file_data)) as pdf:
                pages_count = len(pdf.pages)
                page_texts = []
                for p_idx, page in enumerate(pdf.pages):
                    pt = page.extract_text() or ""
                    page_texts.append(pt)
                    words = page.extract_words()
                    for w in words:
                        word_blocks.append({
                            "text": w["text"],
                            "confidence": 0.98,
                            "bbox": [round(w["x0"], 1), round(w["top"], 1), round(w["x1"], 1), round(w["bottom"], 1)],
                            "page": p_idx + 1
                        })
                extracted_text = "\n\n".join(page_texts).strip()
        except Exception:
            extracted_text = ""

        # If direct text is minimal (scanned image PDF), run PaddleOCR
        if len(extracted_text) < 30:
            is_scanned = True
            try:
                import pypdfium2 as pdfium
                pdf = pdfium.PdfDocument(file_data)
                ocr_texts = []
                word_blocks = []
                confidences = []

                for page_idx in range(len(pdf)):
                    page = pdf[page_idx]
                    pil_img = page.render(scale=200 / 72).to_pil()
                    p_text, p_words, p_conf, engine_name = cls.run_paddle_ocr(pil_img)
                    engine_used = f"paddleocr_{engine_name}"
                    if p_text:
                        ocr_texts.append(p_text)
                        for w in p_words:
                            w["page"] = page_idx + 1
                            word_blocks.append(w)
                        if p_conf > 0:
                            confidences.append(p_conf)

                extracted_text = "\n\n".join(ocr_texts).strip()
                avg_confidence = round(sum(confidences) / len(confidences), 3) if confidences else 0.85
            except Exception:
                pass

        return {
            "text": extracted_text,
            "word_blocks": word_blocks,
            "confidence": avg_confidence,
            "is_scanned": is_scanned,
            "pages_count": pages_count or 1,
            "engine_used": engine_used
        }

    @classmethod
    def extract_text_from_image(cls, file_data: bytes) -> Dict[str, Any]:
        """Extract text from PNG/JPEG image using PaddleOCR + OpenCV quality check."""
        try:
            image = Image.open(io.BytesIO(file_data))
            img_np = np.array(image.convert('RGB'))
        except Exception as e:
            raise ProcessingException(f"Failed to read image file: {str(e)}", "invalid_image")

        quality = cls.assess_image_quality(img_np)
        text, word_blocks, conf, engine_name = cls.run_paddle_ocr(image)

        return {
            "text": text,
            "word_blocks": word_blocks,
            "confidence": conf if conf > 0 else 0.80,
            "quality": quality,
            "engine_used": f"paddleocr_{engine_name}"
        }

    @staticmethod
    def detect_language(text: str) -> Dict[str, Any]:
        """
        Detect bilingual status (Devanagari Hindi vs English Latin).
        Recognizes Devanagari Unicode range U+0900 to U+097F.
        """
        if not text:
            return {"language": "en", "confidence": 0.8, "is_hindi": False, "is_mixed": False}

        hindi_chars = len(re.findall(r'[\u0900-\u097F]', text))
        latin_chars = len(re.findall(r'[a-zA-Z]', text))
        total_letters = hindi_chars + latin_chars

        if total_letters == 0:
            return {"language": "en", "confidence": 0.8, "is_hindi": False, "is_mixed": False}

        hindi_ratio = hindi_chars / total_letters

        if hindi_ratio > 0.4:
            lang = "hi"
            is_hindi = True
            is_mixed = latin_chars > 10
            conf = min(0.98, 0.75 + hindi_ratio * 0.25)
        elif hindi_ratio > 0.05:
            lang = "mixed"
            is_hindi = True
            is_mixed = True
            conf = 0.90
        else:
            lang = "en"
            is_hindi = False
            is_mixed = False
            conf = 0.95

        return {
            "language": lang,
            "confidence": round(conf, 2),
            "is_hindi": is_hindi,
            "is_mixed": is_mixed,
            "hindi_char_count": hindi_chars,
            "latin_char_count": latin_chars
        }


def process_document_with_ocr(file_data: bytes, file_type: FileType) -> Dict[str, Any]:
    """
    Process document with PaddleOCR, text extraction, and language detection.
    """
    if not OCRProcessor.is_ocr_supported(file_type):
        return {
            "success": False,
            "error": f"OCR not supported for file type: {file_type.value}",
            "text": "",
            "language_info": {"language": "unknown", "confidence": 0.0}
        }

    try:
        if file_type == FileType.PDF:
            res = OCRProcessor.extract_text_from_pdf(file_data)
        else:
            res = OCRProcessor.extract_text_from_image(file_data)

        text = res.get("text", "")
        language_info = OCRProcessor.detect_language(text)

        return {
            "success": True,
            "text": text,
            "word_blocks": res.get("word_blocks", []),
            "ocr_confidence": res.get("confidence", 0.9),
            "language_info": language_info,
            "character_count": len(text),
            "word_count": len(text.split()) if text else 0,
            "quality": res.get("quality", {"quality_rating": "good"}),
            "model": "PaddleOCR (PP-OCRv4)"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "text": "",
            "language_info": {"language": "unknown", "confidence": 0.0}
        }