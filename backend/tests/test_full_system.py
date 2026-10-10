import pytest
from fastapi.testclient import TestClient
from app.main import app
import io
from PIL import Image, ImageDraw

client = TestClient(app)

def test_health_endpoints():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "ocr" in data
    assert data["ocr"]["model"] == "PaddleOCR (PP-OCRv4)"
    assert data["ocr"]["status"] == "active"

def test_charts_overview():
    res = client.get("/api/charts/overview")
    assert res.status_code == 200
    data = res.json()
    assert "total_documents" in data
    assert "total_invoices" in data
    assert "total_suppliers" in data

def test_invoices_list():
    res = client.get("/api/invoices/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_suppliers_list():
    res = client.get("/api/suppliers/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_reminders_list():
    res = client.get("/api/reminders/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_export_csv():
    res = client.get("/api/export/invoices/csv")
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/csv")
    assert len(res.content) > 0

def test_export_dashboard_json():
    res = client.get("/api/export/dashboard/json")
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert "timestamp" in data

def test_export_documents_csv():
    res = client.get("/api/export/documents/csv")
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/csv")

def test_full_upload_and_ocr_pipeline():
    # Generate a unique invoice image
    import time
    timestamp_str = str(int(time.time() * 1000))
    img = Image.new("RGB", (800, 600), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((50, 50), f"TAX INVOICE #{timestamp_str}", fill=(0, 0, 0))
    draw.text((50, 90), "Supplier: Bharat Electronics Ltd", fill=(0, 0, 0))
    draw.text((50, 120), "GSTIN: 27AABCT3518Q1ZV", fill=(0, 0, 0))
    draw.text((50, 150), f"Invoice No: INV-{timestamp_str}", fill=(0, 0, 0))
    draw.text((50, 180), "Date: 10/10/2026", fill=(0, 0, 0))
    draw.text((50, 220), "Items: Industrial Sensor Kit", fill=(0, 0, 0))
    draw.text((50, 260), "Taxable Amount: 10000.00", fill=(0, 0, 0))
    draw.text((50, 290), "CGST (9%): 900.00", fill=(0, 0, 0))
    draw.text((50, 320), "SGST (9%): 900.00", fill=(0, 0, 0))
    draw.text((50, 350), "Total Amount: 11800.00", fill=(0, 0, 0))

    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    # Post to /api/upload
    files = {"file": (f"test_invoice_{timestamp_str}.png", img_bytes.getvalue(), "image/png")}
    response = client.post("/api/upload", files=files)
    if response.status_code not in [200, 201]:
        print("UPLOAD FAILED WITH STATUS:", response.status_code, "BODY:", response.text)
    assert response.status_code in [200, 201]
    payload = response.json()
    assert "document_id" in payload
    assert "invoice_id" in payload
    assert payload["status"] in ["completed", "processed"]
    assert "invoice_number" in payload
    assert "ocr_info" in payload
    assert payload["ocr_info"]["model"] == "PaddleOCR (PP-OCRv4)"
