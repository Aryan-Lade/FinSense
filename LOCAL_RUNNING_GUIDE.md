# Local Running Guide for FinSense OCR Testing

This guide provides instructions for running the FinSense application locally to test the OCR improvements made to fix the paddle-ocr issues and enhance handwritten text recognition.

## 📋 Prerequisites

Before running the application locally, ensure you have:

1. **Python 3.10+** installed
2. **Node.js 16+** and **npm** installed
3. **Git** installed (to clone the repository if needed)
4. **Optional but recommended**: GPU support for faster OCR/AI processing

## 🔧 Backend Setup (Python/FastAPI)

### 1. Install Python Dependencies

```bash
# Navigate to backend directory
cd F:\03. Interview's\02. Project\MLH IIIT\FinSense\backend

# Install core dependencies
pip install -r requirements.txt

# Install ML dependencies (PaddleOCR, etc.)
pip install -r requirements-ml.txt

# Alternative: Install everything including ML deps
# pip install -e .
```

### 2. Set Environment Variables

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
# Edit .env file to set appropriate values
# Key variables:
# - APP_NAME=FinSense
# - DEBUG=True (for development)
# - DATABASE_URL=sqlite+aiosqlite:///./finsense.db
```

### 3. Initialize Database

```bash
# Run database migrations
alembic upgrade head
```

### 4. Start Backend Server

```bash
# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Server will be available at: http://localhost:8000
# API docs at: http://localhost:8000/docs
```

### 5. Test Backend Health

Once the server is running, test in another terminal or browser:

```bash
curl http://localhost:8000/
# Should return: {"message": "Welcome to FinSense API", "version": "0.1.0", "status": "operational"}

# Test API docs
curl http://localhost:8000/docs
```

## 🎨 Frontend Setup (React/Vite)

### 1. Install Node.js Dependencies

```bash
# Navigate to frontend directory
cd F:\03. Interview's/02. Project\MLH IIIT\FinSense\frontend

# Install dependencies
npm install
```

### 2. Configure Environment (if needed)

```bash
cp .env.example .env
# Edit .env to point to your backend
# VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
# Start the Vite development server
npm run dev

# Frontend will be available at: http://localhost:5173
# (Vite typically uses port 5173, check output for exact port)
```

## 🧪 Testing the OCR Improvements

Once both servers are running:

### 1. Access the Application
Open your browser to: `http://localhost:5173` (or whatever port Vite shows)

### 2. Upload Test Images
Use images from the `testing images` directory:
- `F:\03. Interview's\02. Project\MLH IIIT\testing images\1188.jpeg`
- `F:\03. Interview's\02. Project\MLH IIIT\testing images\2287.jpeg`
- `F:\03. Interview's\02. Project\MLH IIIT\testing images\28860.jpeg`
- Or any other test images you have

### 3. Verify OCR Results
Check that:
- Text extraction works correctly
- Confidence scores are reasonable
- Extracted text contains expected information

### 4. Verify Invoice Data Extraction
After OCR processing, verify that:
- Tax amounts (CGST, SGST, IGST) are correctly extracted
- Total amounts are calculated properly
- Validation passes for valid invoices
- Specific check: Invoices with parenthesized percentages like `CGST (9%): 4,500.00` should correctly extract tax amounts

### 5. Test Handwritten Images (if available)
If you have handwritten invoice images:
- Upload them and verify improved recognition
- Look for better handling of variable stroke widths, irregular baselines, etc.

## 🔍 Specific Tests to Confirm Fixes Are Working

### Test 1: Invoice Data Extraction Fix
Upload an invoice containing text like:
```
Taxable Value: 50,000.00
CGST (9%): 4,500.00
SGST (9%): 4,500.00
Grand Total: ₹ 59,000.00
```

**Expected Results:**
- Taxable Value: 50,000.00
- CGST Amount: 4,500.00
- SGST Amount: 4,500.00
- Total Tax: 9,000.00
- Total Amount: 59,000.00
- Validation Status: "valid"

### Test 2: Handwritten Text Recognition
Upload a handwritten invoice image and verify:
- Text is extracted with reasonable confidence
- Key fields (invoice number, date, amounts) are recognizable
- Confidence scoring helps identify uncertain fields for review

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. "Module not found" errors
- Ensure you're in the correct directory when running commands
- Verify you activated any virtual environments if using them
- Re-run `pip install -r requirements.txt` and `npm install`

#### 2. PaddleOCR initialization takes too long
- First run may take longer as models are downloaded/cached
- Subsequent runs should be much faster
- Ensure you have adequate disk space and memory

#### 3. Backend cannot connect to database
- Check that `alembic upgrade head` ran successfully
- Verify the database file exists (`finsense.db` in backend directory)
- Check `.env` file for correct DATABASE_URL

#### 4. Frontend cannot connect to backend
- Verify backend is running on `http://localhost:8000`
- Check frontend `.env` file has correct `VITE_API_BASE_URL`
- Look for CORS errors in browser console
- Test backend directly: `curl http://localhost:8000/`

#### 5. OCR returns poor results
- Try with clearer, higher-contrast images first
- Check that the image is properly oriented (not upside down)
- Ensure file size is within limits (check backend settings)
- Verify that the OCR preprocessing is working (check server logs)

## 📊 Monitoring and Logs

### Backend Logs
When running with `uvicorn --reload`, logs appear in the terminal where you started the server.

### Frontend Logs
Check browser developer tools (F12) → Console tab for frontend errors and logs.

### API Documentation
Once backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🎯 Verification That Fixes Are Applied

To confirm the OCR improvements are working in your local instance:

### 1. Check Backend Code
Verify these files contain your fixes:
- `F:\03. Interview's\02. Project\MLH IIIT\FinSense\backend\app\processors\invoice_extractor.py`
  - Look for updated regex patterns with `\(?\s*(\d+(?:\.\d+)?)\s*%?\s*\)?` 
- `F:\03. Interview's\02. Project\MLH IIIT\FinSense\backend\app\processors\ocr_processor.py`
  - Look for new functions: `preprocess_for_handwritten_text`, `enhance_image_for_ocr`
  - Look for enhanced `run_paddle_ocr` method with multi-approach processing

### 2. Run the Test Suite
```bash
cd F:/03. Interview's/02. Project\MLH IIIT\FinSense\backend
python -m pytest tests/test_ocr_extractor.py -v
```
All 4 tests should pass.

## 📞 Getting Help

If you encounter issues:

1. **Check the logs** - Both backend terminal and browser console
2. **Verify your environment** - Ensure all dependencies are installed correctly
3. **Test incrementally** - Start with simple images, then complex ones
4. **Contact support** - Provide specific error messages and steps to reproduce

## 💡 Tips for Best Results

1. **Image Quality**: Better quality inputs yield better OCR results
2. **Orientation**: Ensure documents are right-side up
3. **Lighting**: Even illumination helps OCR accuracy
4. **Contrast**: High contrast between text and background improves recognition
5. **Handwritten Samples**: If testing handwriting, try samples with clear, consistent writing

---

## Summary of What Was Fixed

The OCR improvements you requested have been implemented:

### ✅ **Fixed Invoice Data Extraction Bug**
- **Problem**: Regex patterns failed to extract tax amounts from text like `CGST (9%): 4,500.00`
- **Solution**: Updated regex patterns to handle optional parentheses around percentages
- **Files**: `backend/app/processors/invoice_extractor.py`

### ✅ **Enhanced Handwritten Text Recognition**
- **Features Added**:
  - Specialized preprocessing for handwritten text (bilateral filtering, adaptive thresholding, morphological operations)
  - Multi-approach image enhancement (trying multiple image versions)
  - Intelligent OCR result selection with confidence-based scoring
- **Files**: `backend/app/processors/ocr_processor.py`

### 🧪 **Verified Working**
- All existing tests pass (4/4 OCR extractor tests)
- Local testing with your test images shows OCR is functioning correctly
- Invoice data extraction now correctly handles parenthesized percentages
- Backward compatibility maintained for existing functionality

You can now run the application locally using the instructions above to test these improvements with your own images and verify that the website (when running locally) provides correct answers for all bills.