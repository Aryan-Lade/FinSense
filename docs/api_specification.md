# FinSense — REST API Specification

**Complete OpenAPI / Swagger Specification for Backend Endpoints**

---

## Base URL
```
Development: http://localhost:8000/api/v1
Production:  https://api.finsense.app/api/v1
```

---

## 1. Document Ingestion & Upload

### `POST /upload`
Uploads an invoice or spreadsheet file for processing.

- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `file` (File, Required): Binary file (`.pdf`, `.jpg`, `.jpeg`, `.png`, `.csv`, `.xlsx`).
- **Response (201 Created):**
  ```json
  {
    "bill_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "filename": "supplier_tax_invoice.pdf",
    "status": "PROCESSING",
    "document_quality": "GOOD",
    "message": "File uploaded successfully. Processing pipeline initiated."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Invalid file type or extension mismatch.
  - `413 Payload Too Large`: File exceeds 25 MB.

---

## 2. Bills Management

### `GET /bills`
Lists bills with filtering, search, and pagination.

- **Query Parameters:**
  - `payment_status` (string, optional): `UNPAID`, `PAID`, `OVERDUE`
  - `review_status` (string, optional): `VERIFIED`, `REVIEW_REQUIRED`, `PENDING`
  - `search` (string, optional): Search by supplier name, bill number, or GSTIN
  - `page` (int, default: 1): Page number
  - `limit` (int, default: 20): Items per page
- **Response (200 OK):**
  ```json
  {
    "total": 45,
    "page": 1,
    "limit": 20,
    "data": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "bill_number": "INV-2026-089",
        "supplier_name": "Bharat Electronics Ltd",
        "supplier_gstin": "27AAACB2212R1Z2",
        "invoice_date": "2026-10-01",
        "due_date": "2026-10-15",
        "total_amount": 14500.00,
        "payment_status": "UNPAID",
        "review_status": "VERIFIED",
        "validation_status": "VALID",
        "created_at": "2026-10-01T10:30:00Z"
      }
    ]
  }
  ```

---

### `GET /bills/{id}`
Retrieves complete details of a single bill including line items and validation results.

- **Response (200 OK):**
  ```json
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "bill_number": "INV-2026-089",
    "supplier_name": "Bharat Electronics Ltd",
    "supplier_gstin": "27AAACB2212R1Z2",
    "buyer_name": "Sharma Enterprise",
    "buyer_gstin": "27BBBCB1111R1Z1",
    "invoice_date": "2026-10-01",
    "due_date": "2026-10-15",
    "currency": "INR",
    "taxable_subtotal": 12288.14,
    "cgst_amount": 1105.93,
    "sgst_amount": 1105.93,
    "igst_amount": 0.00,
    "total_tax": 2211.86,
    "round_off": 0.00,
    "total_amount": 14500.00,
    "payment_status": "UNPAID",
    "review_status": "VERIFIED",
    "validation_status": "VALID",
    "items": [
      {
        "id": "4da95f64-5717-4562-b3fc-2c963f66afb7",
        "description": "Industrial Sensor Switch",
        "hsn_sac": "8536",
        "quantity": 10.0,
        "unit_price": 1228.814,
        "discount": 0.0,
        "tax_rate": 18.0,
        "line_total": 14500.00
      }
    ],
    "validation": {
      "is_valid": true,
      "errors": [],
      "warnings": [],
      "field_confidences": {
        "bill_number": 0.98,
        "supplier_gstin": 0.95,
        "total_amount": 0.99
      }
    }
  }
  ```

---

### `POST /bills/{id}/mark-paid`
Marks an invoice as paid, cancels all upcoming reminders, and purges Google Calendar events.

- **Response (200 OK):**
  ```json
  {
    "bill_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "payment_status": "PAID",
    "paid_at": "2026-10-10T11:00:00Z",
    "reminders_cancelled": 2,
    "calendar_event_updated": true,
    "message": "Bill marked as paid successfully. Future reminders cancelled."
  }
  ```

---

## 3. Human Review Queue

### `GET /bills/review-queue`
Retrieves bills flagged for manual inspection.

- **Response (200 OK):**
  ```json
  {
    "count": 3,
    "bills": [
      {
        "id": "7fa85f64-5717-4562-b3fc-2c963f66aff9",
        "original_filename": "faded_receipt.jpg",
        "document_quality": "POOR",
        "validation_errors": [
          "Arithmetic mismatch: Subtotal + Tax != Total Amount",
          "Low confidence on supplier GSTIN"
        ]
      }
    ]
  }
  ```

### `PUT /bills/{id}/review`
Submits human corrections for a flagged bill and marks it verified.

- **Request Body:**
  ```json
  {
    "bill_number": "REC-9912",
    "supplier_name": "Radhe Trading Co",
    "supplier_gstin": "27AAACB2212R1Z2",
    "invoice_date": "2026-10-05",
    "taxable_subtotal": 5000.00,
    "cgst_amount": 450.00,
    "sgst_amount": 450.00,
    "total_tax": 900.00,
    "total_amount": 5900.00
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "bill_id": "7fa85f64-5717-4562-b3fc-2c963f66aff9",
    "review_status": "VERIFIED",
    "validation_status": "VALID",
    "message": "Corrections saved and re-validated successfully."
  }
  ```

---

## 4. Google Calendar Integration

### `GET /calendar/auth-url`
Generates Google OAuth2 consent URL for calendar permissions.

- **Response (200 OK):**
  ```json
  {
    "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&scope=https://www.googleapis.com/auth/calendar.events"
  }
  ```

### `POST /calendar/sync/{bill_id}`
Manually triggers Google Calendar event synchronization for a specific bill.

- **Response (200 OK):**
  ```json
  {
    "bill_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "calendar_event_id": "c71a9e88d8b4e7",
    "scheduled_date": "2026-10-15",
    "status": "SYNCED"
  }
  ```

---

## 5. Export Endpoints

### `GET /export/json`
Exports all bills in canonical JSON format.

### `GET /export/csv?type=summary|items`
Streams CSV file for download.

### `GET /export/excel`
Streams styled `.xlsx` multi-sheet workbook.
