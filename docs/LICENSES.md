# FinSense Dependency & Model License Audit

All third-party libraries and models utilized by FinSense have been audited to ensure permissive commercial distribution without AGPL or viral copyleft constraints.

| Package / Component | License | Compliance Status |
|---|---|---|
| fastapi | MIT | ✓ Approved (Permissive) |
| uvicorn | BSD-3-Clause | ✓ Approved (Permissive) |
| pydantic | MIT | ✓ Approved (Permissive) |
| sqlalchemy | MIT | ✓ Approved (Permissive) |
| pillow | HPND | ✓ Approved (Permissive) |
| rapidocr_onnxruntime | Apache-2.0 | ✓ Approved (Permissive) |
| pdfplumber | MIT | ✓ Approved (Permissive) |
| pypdfium2 | Apache-2.0 | ✓ Approved (Permissive) |
| openpyxl | MIT | ✓ Approved (Permissive) |
| react | MIT | ✓ Approved (Permissive) |
| vite | MIT | ✓ Approved (Permissive) |
| tailwindcss | MIT | ✓ Approved (Permissive) |
| lucide-react | ISC | ✓ Approved (Permissive) |

## Prohibited Packages Explicitly Excluded
- **PyMuPDF (AGPL):** Excluded per Section 2.9. Replaced with `pdfplumber` (MIT) and `pypdfium2` (Apache-2.0).
- **LayoutLMv3 (Non-Commercial):** Excluded per Section 3. Replaced with VLM + PaddleOCR geometrical box clustering.