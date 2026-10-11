# Testing Guide for FinSense OCR Improvements

## Overview
This guide provides instructions for testing the OCR improvements made to the FinSense project, including:
1. Fixes for invoice data extraction (tax amount parsing)
2. Enhancements for handwritten text recognition

## Local Testing Instructions

### 1. Testing OCR Functionality Directly

You can test the OCR processing using the Python interface:

```bash
# Navigate to backend directory
cd F:\03. Interview's\02. Project\MLH IIIT\FinSense\backend

# Run a simple OCR test
python -c "
import os
from app.processors.ocr_processor import process_document_with_ocr
from app.processors.file_validator import FileType

# Test with one of your test images
test_image_path = r'F:\03. Interview's\02. Project\MLH IIIT\testing images\1188.jpeg'
if os.path.exists(test_image_path):
    with open(test_image_path, 'rb') as f:
        image_data = f.read()
    
    result = process_document_with_ocr(image_data, FileType.JPEG)
    print('OCR Result:')
    print(f'Success: {result[\"success\"]}')
    if result['success']:
        print(f'Text extracted: {len(result[\"text\"])} characters')
        print(f'Confidence: {result[\"ocr_confidence\"]:.3f}')
        print(f'First 200 chars: {repr(result[\"text\"][:200])}')
    else:
        print(f'Error: {result[\"error\"]}')
else:
    print(f'Test image not found: {test_image_path}')
"
```

### 2. Testing Invoice Data Extraction

To test the fixed invoice data extraction:

```bash
cd F:\03. Interview's\02. Project\MLH IIIT\FinSense\backend

python -c "
from app.processors.invoice_extractor import InvoiceDataExtractor

# Test with sample text that includes parenthesized percentages
sample_text = '''
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
'''

result = InvoiceDataExtractor.extract(sample_text)
print('Invoice Extraction Result:')
print(f'Total amount: {result[\"extracted_fields\"][\"total_amount\"]}')
print(f'Expected: 59000.0')
print(f'Match: {result[\"extracted_fields\"][\"total_amount\"] == 59000.0}')
print(f'Validation status: {result[\"validation\"][\"status\"]}')
"
```

### 3. Running the Test Suite

To verify all fixes are working:

```bash
cd F:\03. Interview's\02. Project\MLH IIIT\FinSense\backend
python -m pytest tests/test_ocr_extractor.py -v
```

All tests should pass (4/4).

## Testing the Website

Since I cannot directly access the website https://fin-sense-coral.vercel.app/ in this environment, here's how you can test it:

### What to Test on the Website

1. **Upload Test Images**: Use images from the `testing images` directory
2. **Check OCR Output**: Verify that text extraction is working correctly
3. **Verify Invoice Parsing**: Check that tax amounts, totals, and other fields are extracted correctly
4. **Test Handwritten Images**: If you have handwritten invoice images, test those specifically

### Expected Behavior After Fixes

1. **Tax Amounts**: Amounts like "CGST (9%): 4,500.00" should correctly extract:
   - CGST amount: 4500.0
   - SGST amount: 4500.0 (if present)
   - Total tax: 9000.0
   - Grand total: Should be taxable value + total tax

2. **Handwritten Text**: Improved recognition of:
   - Variable stroke widths
   - Irregular baselines
   - Broken or touching characters
   - Varying lighting conditions

## Troubleshooting

If you still encounter issues:

### 1. Check Backend Logs
Look for any error messages in the backend when processing images.

### 2. Verify Model Loading
The PaddleOCR models may take time to load on first use. Subsequent calls should be faster.

### 3. Test with Known Good Images
Start with clear, printed invoice images to verify the pipeline works, then test with handwritten ones.

### 4. Check Console Errors
Open browser developer tools (F12) and check the console for any JavaScript errors when using the website.

## Files Modified

The following files were modified to address the OCR issues:

1. `F:\03. Interview's\02. Project\MLH IIIT\FinSense\backend\app\processors\invoice_extractor.py`
   - Fixed regex patterns for CGST, SGST, and IGST extraction to handle parentheses around percentages

2. `F:\03. Interview's\02. Project\MLH IIIT\FinSense\backend\app\processors\ocr_processor.py`
   - Added handwriting-specific preprocessing functions
   - Enhanced OCR processing to try multiple image enhancements and select the best result
   - Added confidence-based selection with bonuses for effective handwriting preprocessing

## Next Steps

1. Run the local tests above to verify the fixes are working
2. Test the website with your test images
3. If issues persist, check backend logs and browser console for specific error messages
4. Consider that the website might be using a cached version - try hard refreshing (Ctrl+F5) or clearing browser cache

The improvements should resolve both the invoice data extraction issues and provide better handwritten text recognition capabilities.