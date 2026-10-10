# FinSense — AI & Document Intelligence Architecture

**Deep Technical Blueprint: Vision-Language Models, Bilingual OCR, and Probabilistic-to-Deterministic Pipeline**

---

## 1. Executive Summary & AI Philosophy

In financial document intelligence, naive AI usage produces disastrous results: **LLMs hallucinate numbers, fail at basic arithmetic, and make confident mistakes.**

FinSense employs a hybrid **Probabilistic AI + Deterministic Rule Engine** paradigm:
- **Where AI is used:** Perception, bilingual text recognition, visual layout understanding, key-value association, and semantic normalization across varied invoice designs.
- **Where AI is NOT used:** Arithmetic summation, tax rate multiplication, GSTIN verification, and status transitions. These are strictly delegated to deterministic Python code.

```
+───────────────────────────────────────────────────────────────────────────────+
|                               PROBABILISTIC AI LAYER                          |
|  - Computer Vision (Blur & Contrast)    - Bilingual OCR (PaddleOCR)           |
|  - Layout Geometry (LayoutLMv3)          - Multimodal Reasoning (Qwen2-VL)    |
+───────────────────────────────────────┬───────────────────────────────────────+
                                        │ Raw Extracted Candidates + Confidence
+───────────────────────────────────────▼───────────────────────────────────────+
|                             DETERMINISTIC GUARD LAYER                         |
|  - GSTIN Regex & State Code Validation   - Line-Item Math: Qty x Rate = Total |
|  - Tax Reconciliation (CGST+SGST vs IGST)- Grand Balance: Subtotal + Tax = Sum|
+───────────────────────────────────────────────────────────────────────────────+
```

---

## 2. End-to-End AI & Vision Pipeline

The document perception and intelligence pipeline operates in 5 distinct stages:

```
[Uploaded Document: PDF / Image]
               │
               ▼
   [Stage 1: Pre-Screening & CV]
   ├── Digital PDF? ──> Direct PyMuPDF text stream (Fast-path)
   └── Scanned / Image ─> OpenCV Preprocessing
                          ├── Laplacian Variance: Blur Detection
                          ├── CLAHE: Contrast Enhancement
                          └── Perspective & Deskewing
               │
               ▼
   [Stage 2: Bilingual OCR]
   PaddleOCR (English + Devanagari)
   ├── Word bounding boxes [x1, y1, x2, y2]
   └── Token OCR confidence scores
               │
               ▼
   [Stage 3: Spatial & Visual-Semantic Reasoning]
   Multimodal Vision-Language Model (Qwen2-VL-7B / LayoutLMv3)
   ├── Ingests raw image + 2D bounding boxes
   └── Solves unstandardized table layouts & vernacular labels
               │
               ▼
   [Stage 4: Constrained Schema Extraction]
   Structured Output Decoding (Pydantic JSON)
   ├── Header, Parties, Line Items, Tax breakdowns
   └── Strict instruction: "Return null if absent; NEVER invent data"
               │
               ▼
   [Stage 5: Confidence Aggregation Engine]
   Per-field confidence metric calculated: C_field in [0.0, 1.0]
               │
               ▼
       [To Validation Engine]
```

---

## 3. Detailed Component Breakdown

### 3.1 Stage 1: Computer Vision & Blur Detection
Before spending GPU compute or API credits on OCR and LLMs, FinSense assesses image quality using OpenCV:
- **Blurriness via Laplacian Operator:**
  The variance of the Laplacian reflects the sharpness of edges in the image:
  $$\text{Score} = \text{Var}(\nabla^2 I)$$
  - If $\text{Score} < 100.0$: Image is classified as **BLURRY**.
  - Document quality is set to `POOR`, and the bill is immediately queued for human review with a `Blurry Image` warning.
- **Adaptive Contrast Enhancement (CLAHE):**
  Poorly lit phone photos undergo Contrast Limited Adaptive Histogram Equalization (CLAHE) on the luminance channel (LAB color space) to make faint thermal ink legible.

---

### 3.2 Stage 2: Bilingual OCR via PaddleOCR
Standard OCR engines (like Tesseract) struggle heavily with Devanagari conjuncts (*संयुक्ताक्षर*), complex Hindi fonts, and low-contrast printed receipts.

#### Why PaddleOCR:
- **Architecture:** DBNet (Differentiable Binarization) for text detection + SVTR (Single Visual Model) for text recognition.
- **Bilingual Performance:** Outstanding accuracy on mixed English-Hindi text strings (common in Indian invoices where column headers might be in Hindi like *विवरण*, *मात्रा*, *दर*, *कुल राशि*, while numbers and product names are in English).
- **Output:** Returns exact bounding polygon coordinates alongside OCR probability scores.

```python
from paddleocr import PaddleOCR

# Initialized once during FastAPI lifecycle startup
ocr = PaddleOCR(
    use_angle_cls=True,        # Automatic 90/180/270 rotation correction
    lang='devanagari',         # Devanagari weights supporting Hindi + English
    show_log=False,
    use_gpu=True               # Optimized GPU execution
)
```

---

### 3.3 Stage 3 & 4: Visual-Semantic Extraction via Vision-Language Model (VLM)

#### The Problem with Pure Text LLMs:
Invoices are inherently **two-dimensional documents**. When a table is flattened into a 1D text string, column alignments are destroyed:
- A quantity in Column 3 might appear next to the price of the preceding row.
- Subtotals in footers get confused with line totals.

#### The FinSense Approach: Qwen2-VL-7B / Multimodal Vision LLM
We feed the **visual image directly** into the multimodal vision model along with OCR text tokens. The model simultaneously interprets:
1. **Visual geometry:** Spatial alignment of table headers, line separators, borders, and footer boxes.
2. **Semantic context:** Understanding that *GSTIN*, *G.S.T.*, *TIN*, *जीएसटी नं.* refer to the same conceptual entity.
3. **Multilingual translation:** Reading Hindi field names and mapping them to standardized English schema keys.

#### System Prompt & Structured Decoding:

```text
You are an expert bilingual financial auditor specializing in Indian Tax Invoices, Bills of Supply, and Receipts.
Your task is to analyze the provided invoice document (in English, Hindi, or mixed) and extract all financial details into strict JSON.

RULES:
1. DO NOT GUESS OR INVENT DATA. If a field is not explicitly present or illegible, set its value to null.
2. Extract all individual line items accurately from tables.
3. Distinguish clearly between Supplier (Seller) and Buyer (Customer).
4. Identify GSTIN (15 characters) for both supplier and buyer if present.
5. Extract CGST, SGST, and IGST separately.
6. Return only valid JSON conforming strictly to the requested schema.
```

#### JSON Schema Target:
```json
{
  "bill_number": "string | null",
  "invoice_date": "YYYY-MM-DD | null",
  "due_date": "YYYY-MM-DD | null",
  "currency": "INR",
  "supplier": {
    "name": "string | null",
    "address": "string | null",
    "gstin": "string | null"
  },
  "buyer": {
    "name": "string | null",
    "address": "string | null",
    "gstin": "string | null"
  },
  "items": [
    {
      "description": "string",
      "hsn_sac": "string | null",
      "quantity": 1.0,
      "unit_price": 100.0,
      "discount": 0.0,
      "tax_rate": 18.0,
      "line_total": 118.0
    }
  ],
  "taxable_subtotal": 100.0,
  "cgst_amount": 9.0,
  "sgst_amount": 9.0,
  "igst_amount": 0.0,
  "total_tax": 18.0,
  "round_off": 0.0,
  "total_amount": 118.0
}
```

---

## 4. Confidence Scoring Math

Every extracted field is assigned a confidence score $C \in [0.0, 1.0]$. The overall field confidence is a weighted harmonic mean:

$$C_{\text{field}} = \alpha \cdot C_{\text{OCR}} + \beta \cdot C_{\text{VLM}} + \gamma \cdot C_{\text{Rule}}$$

Where:
- $C_{\text{OCR}}$: Average character recognition probability from PaddleOCR for the matched bounding box.
- $C_{\text{VLM}}$: Log-probability / token certainty from the model decoder.
- $C_{\text{Rule}}$: Heuristic rule score (e.g., $1.0$ if GSTIN matches 15-char regex, $0.2$ if regex fails; $1.0$ if date matches valid calendar format, $0.0$ if invalid day/month).
- Default weights: $\alpha = 0.35, \beta = 0.35, \gamma = 0.30$.

### Thresholding:
- **$C_{\text{field}} \ge 0.85$:** High confidence (Rendered in Green; accepted automatically).
- **$0.70 \le C_{\text{field}} < 0.85$:** Medium confidence (Rendered in Amber; highlighted for verification).
- **$C_{\text{field}} < 0.70$:** Low confidence (Rendered in Red; forces document into **Review Required**).

---

## 5. Handling Real-World Indian Document Edge Cases

| Document Challenge | Example Scenario | FinSense AI Resolution Strategy |
| :--- | :--- | :--- |
| **Kacha Bill (*कच्चा बिल*)** | Handwritten informal receipts with no GSTIN or printed tables | VLM extracts supplier name, date, and grand total. Missing fields explicitly flagged as `null`. Review Queue enabled. |
| **Thermal Receipts** | Grocery/restaurant slips with faded dot-matrix printing | CLAHE contrast boost pre-processing + bilingual PaddleOCR recognition. |
| **Bilingual Column Headers** | Table columns titled *"क्रम सं. (S.No) | विवरण (Desc) | दर (Rate)"* | Model maps Devanagari labels directly to canonical schema attributes without manual translation rules. |
| **Folds and Skewed Photos** | Bill photographed at a 30-degree tilt with desk shadows | OpenCV minAreaRect bounding deskew + PaddleOCR angle classification (`use_angle_cls=True`). |
| **Zero-Tax / Exempt Bills** | Fresh agricultural produce with 0% GST | Validation engine allows 0% tax rate without flagging missing CGST/SGST warnings. |

---

## 6. Performance, Compute & Cost Optimization

1. **Digital PDF Fast-Path:**
   - Vector PDFs (generated digitally from QuickBooks, Zoho, or Tally) contain an embedded text layer.
   - PyMuPDF extracts full text and coordinates in $< 80$ milliseconds, bypassing GPU OCR inference entirely.
2. **Quantized Local Inference:**
   - In on-premise or local deployments, Qwen2-VL is run under **4-bit AWQ / GPTQ quantization**, reducing VRAM footprint from 16GB down to 5.5GB while retaining $> 97\%$ extraction fidelity.
3. **Model Fallback Cascade:**
   - Primary: High-speed local PaddleOCR + VLM.
   - Secondary / Cloud Fallback: Multimodal Gemini 1.5 Flash / GPT-4o-mini API for lightweight cloud inference when local GPU resources are constrained.
