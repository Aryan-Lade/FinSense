"""
Tests for OCR processor and bilingual Indian GST invoice extraction.
"""
import io
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import pytest
from app.processors.ocr_processor import OCRProcessor, process_document_with_ocr
from app.processors.invoice_extractor import InvoiceDataExtractor
from app.processors.file_validator import FileType


def test_language_detection():
    """Verify bilingual language detection for English, Hindi, and mixed text."""
    en_text = "Tax Invoice from TechNova Solutions. Total amount due is 15000 INR."
    hi_text = "भारत कार्यालय सामग्री चालान संख्या ८९० कुल देय राशि ५००० रुपये"
    mixed_text = "Invoice INV-902 भारत सप्लायर्स GSTIN 27AAPFU0939F1ZV Total 45000"

    res_en = OCRProcessor.detect_language(en_text)
    assert res_en["language"] == "en"
    assert res_en["is_hindi"] is False

    res_hi = OCRProcessor.detect_language(hi_text)
    assert res_hi["language"] == "hi"
    assert res_hi["is_hindi"] is True

    res_mixed = OCRProcessor.detect_language(mixed_text)
    assert res_mixed["is_hindi"] is True


def test_image_quality_assessment():
    """Verify OpenCV blur and contrast quality scoring."""
    # Create sharp high-contrast image
    sharp_img = np.zeros((200, 200, 3), dtype=np.uint8)
    sharp_img[50:150, 50:150] = 255
    res = OCRProcessor.assess_image_quality(sharp_img)
    assert "is_blurry" in res
    assert "blur_score" in res
    assert res["quality_rating"] in ["good", "poor"]


def test_invoice_data_extractor():
    """Verify deterministic field extraction from bilingual GST invoice text."""
    sample_invoice_text = """
    TechNova Solutions Private Limited
    Plot 45, MIDC Industrial Area, Pune 411018
    GSTIN: 27AAPFU0939F1ZV
    
    TAX INVOICE
    Invoice No: INV-2026-888
    Invoice Date: 15/05/2026
    Due Date: 30/05/2026
    
    Billed To:
    Apex Global Technologies Ltd
    GSTIN: 27BBBFU1111F1Z1
    
    Description        Qty   Rate       Total
    1 Cloud Hosting    2     25000.00   50000.00
    
    Taxable Value: 50,000.00
    CGST (9%): 4,500.00
    SGST (9%): 4,500.00
    Grand Total: ₹ 59,000.00
    """

    res = InvoiceDataExtractor.extract(sample_invoice_text)
    fields = res["extracted_fields"]
    canonical = res["canonical"]

    assert fields["bill_number"] == "INV-2026-888"
    assert fields["seller_gstin"] == "27AAPFU0939F1ZV"
    assert fields["buyer_gstin"] == "27BBBFU1111F1Z1"
    assert fields["total_amount"] == 59000.0
    assert fields["subtotal"] == 50000.0
    assert fields["tax_amount"] == 9000.0
    assert fields["supplier_name"] == "TechNova Solutions Private Limited"
    assert "Apex Global Technologies" in fields["buyer_name"]

    assert canonical["totals"]["total_amount"] == 59000.0
    assert canonical["seller"]["gstin"] == "27AAPFU0939F1ZV"


def test_rapid_ocr_image_execution():
    """Verify RapidOCR pipeline executes on image bytes."""
    # Generate clean image with text
    img = Image.new('RGB', (400, 100), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((20, 35), "INVOICE 12345", fill=(0, 0, 0))

    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_data = img_bytes.getvalue()

    result = process_document_with_ocr(img_data, FileType.PNG)
    assert result["success"] is True
    assert "INVOICE" in result["text"].upper() or result["character_count"] > 0
    assert "language_info" in result
