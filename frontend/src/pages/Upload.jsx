import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  ScanLine,
  Check
} from 'lucide-react';
import { uploadFile } from '../api';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(0); // 0: Idle, 1: Perceive, 2: PaddleOCR, 3: Validate, 4: Complete
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 15 * 1024 * 1024,
    multiple: false,
  });

  const handleProcess = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      
      // Step 1: Ingestion
      setStep(1);
      await new Promise((r) => setTimeout(r, 400));

      // Step 2: PaddleOCR & Bilingual Extraction
      setStep(2);
      await new Promise((r) => setTimeout(r, 600));

      // Step 3: Server Processing
      setStep(3);
      const res = await uploadFile(file);

      // Step 4: Complete
      setStep(4);
      await new Promise((r) => setTimeout(r, 500));

      // Navigate to the newly created invoice or bills list
      if (res.data?.invoice_id) {
        navigate(`/bills/${res.data.invoice_id}`);
      } else {
        navigate('/bills');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to process document. Please try a different file.');
      setUploading(false);
      setStep(0);
    }
  };

  const steps = [
    { title: '1. Multi-Format Ingest', desc: 'MIME validation & blur pre-screen' },
    { title: '2. PaddleOCR Bilingual', desc: 'Devanagari Hindi & English parsing' },
    { title: '3. GST Validation Guard', desc: 'Checksum & tax arithmetic balance' },
    { title: '4. Audit-Ready Record', desc: '10-day payment reminder scheduled' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-[#d9d9d9] shadow-2xs">
          <ScanLine className="w-3.5 h-3.5 text-black" />
          <span className="text-xs font-semibold uppercase tracking-wider text-black">
            PaddleOCR Ingestion Engine
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-black tracking-tight">
          Upload Invoices & Bills
        </h1>
        <p className="text-sm text-neutral-600 max-w-lg mx-auto">
          Drag & drop photos, handwritten receipts, scanned PDFs, or Excel/CSV sheets.
          PaddleOCR processes Hindi and English simultaneously.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="demo-card p-8 sm:p-10 space-y-8">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-[24px] p-10 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-black bg-neutral-100/80 scale-[0.99]'
              : file
              ? 'border-emerald-500 bg-emerald-50/20'
              : 'border-[#d9d9d9] hover:border-black bg-[#fafafa]'
          }`}
        >
          <input {...getInputProps()} />

          {file ? (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center mx-auto shadow-sm">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <p className="font-heading font-bold text-base text-black">{file.name}</p>
                <p className="text-xs font-mono text-neutral-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
                </p>
              </div>
              <p className="text-xs text-emerald-700 font-semibold">
                ✓ Ready for PaddleOCR inference. Click 'Run OCR Pipeline' below.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-white border border-[#d9d9d9] flex items-center justify-center mx-auto shadow-2xs">
                <UploadIcon className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="font-heading font-semibold text-base text-black">
                  Drag and drop your bill or click to browse
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Supports PDF, PNG, JPG, WEBP, CSV, XLSX (Up to 15MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4-Step Processing Progress */}
        {uploading && (
          <div className="space-y-4 bg-[#f9f9f9] p-6 rounded-[22px] border border-[#d9d9d9]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
              Execution Progress
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {steps.map((s, idx) => {
                const isCurrent = step === idx + 1;
                const isDone = step > idx + 1;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs transition ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isCurrent
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white border-[#d9d9d9] text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-semibold">
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : isCurrent ? (
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      ) : null}
                      <span>{s.title}</span>
                    </div>
                    <p className={`text-[10px] mt-1 ${isCurrent ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Trigger Button */}
        <div className="flex justify-end space-x-3">
          {file && (
            <button
              onClick={() => { setFile(null); setError(''); }}
              className="demo-btn-white px-5 py-2.5 text-xs font-semibold"
            >
              Clear
            </button>
          )}

          <button
            onClick={handleProcess}
            disabled={!file || uploading}
            className="demo-btn-black px-7 py-3 text-xs font-semibold inline-flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{uploading ? 'Processing with PaddleOCR...' : 'Run OCR Pipeline'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
