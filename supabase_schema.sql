-- =============================================================================
-- FinSense: Supabase PostgreSQL Schema & Storage Initializer
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    legal_name TEXT NOT NULL,
    trade_name TEXT,
    gstin TEXT UNIQUE,
    pan TEXT,
    state TEXT,
    state_code TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Documents Table (Ingested PDFs & Scanned Images)
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    original_filename TEXT NOT NULL,
    stored_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    sha256 TEXT NOT NULL,
    pipeline TEXT NOT NULL,
    processing_status TEXT DEFAULT 'pending',
    source_channel TEXT DEFAULT 'website',
    ingestion_status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Invoices Table (Audited Records & GST Calculations)
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    document_id TEXT REFERENCES public.documents(id) ON DELETE SET NULL,
    bill_number TEXT NOT NULL,
    document_category TEXT DEFAULT 'gst_invoice',
    supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
    supplier_name TEXT NOT NULL,
    buyer_name TEXT,
    invoice_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    currency TEXT DEFAULT 'INR',
    subtotal NUMERIC(15, 2) DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL,
    processing_status TEXT DEFAULT 'completed',
    validation_status TEXT DEFAULT 'valid',
    review_status TEXT DEFAULT 'approved',
    payment_status TEXT DEFAULT 'unpaid',
    priority_score INTEGER DEFAULT 0,
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_note TEXT,
    canonical_json JSONB,
    provenance_json JSONB,
    validation_json JSONB,
    suggestions_json JSONB,
    processing_info_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Invoice Line Items
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    invoice_id TEXT REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT,
    hsn_sac TEXT,
    quantity NUMERIC(12, 3) DEFAULT 1.0,
    unit_price NUMERIC(15, 2) DEFAULT 0.0,
    taxable_value NUMERIC(15, 2) DEFAULT 0.0,
    gst_rate NUMERIC(5, 2) DEFAULT 18.0,
    cgst_amount NUMERIC(15, 2) DEFAULT 0.0,
    sgst_amount NUMERIC(15, 2) DEFAULT 0.0,
    igst_amount NUMERIC(15, 2) DEFAULT 0.0,
    total_amount NUMERIC(15, 2) DEFAULT 0.0
);

-- 6. Payment Reminders
CREATE TABLE IF NOT EXISTS public.reminders (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    invoice_id TEXT REFERENCES public.invoices(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL,
    interval_days INTEGER DEFAULT 10,
    repeat_every_days INTEGER DEFAULT 2,
    first_fire_at TIMESTAMP WITH TIME ZONE NOT NULL,
    next_fire_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Supabase Storage Bucket for Invoice Files
INSERT INTO storage.buckets (id, name, public)
VALUES ('finsense-files', 'finsense-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policy (Allow Public Read & Upload)
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'finsense-files');

CREATE POLICY "Public Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'finsense-files');
