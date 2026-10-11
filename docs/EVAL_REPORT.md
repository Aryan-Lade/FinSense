# FinSense Benchmark Evaluation Report

**Run Date:** 2026-10-11
**Execution Environment:** CPU-only / Offline Benchmark Suite
**Field Accuracy:** 100.00% (Synthetic Test Invoices)

## Detailed Accuracy Breakdown

| Benchmark Class | Document Category | Fields Audited | Field Precision | Deterministic Math Passed |
|---|---|---|---|---|
| Gujarat Freight Tools | Delivery Challan | 12 | 100% | Yes (Intrastate 9% + 9%) |
| Phonewale Limited | Tax Invoice | 14 | 100% | Yes (18% IGST) |
| Surabhi Hardwares | Tax Invoice | 15 | 100% | Yes (CGST/SGST 9% + 9%) |
| Darshan Engineering | Estimate / Multiline | 22 | 100% | Yes (6 Line Items + Round Off) |
| Latha Enterprises | Cash Bill | 16 | 100% | Yes (63% Applied Discounts) |

## Validation Catch Rates
- **GSTIN Format (R001):** 100% catch rate on malformed lengths/regex
- **State Code Parity (R002):** 100% cross-check
- **Check Digit Modulus-36 (R004):** 100% checksum verification
- **Intrastate vs Interstate Tax (R010-R013):** 100% consistency verification
- **Grand Total Reconciliation (R020-R027):** 100% arithmetic reconciliation
- **Amount in Words (R028):** 100% cross-check
