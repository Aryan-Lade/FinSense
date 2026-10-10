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
  Check,
  Cpu,
  Lock,
  Globe2,
  FileCheck
} from 'lucide-react';
import { uploadFile } from '../api';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(0); // 0: Idle, 1: Ingest, 2: PaddleOCR, 3: Validate, 4: Complete
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
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'],
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const handleProcess = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError('');

      // Step 1: Pre-Screening & Quality Check
      setStep(1);
      await new Promise((r) => setTimeout(r, 450));

      // Step 2: Open-Source PaddleOCR Inference
      setStep(2);
      await new Promise((r) => setTimeout(r, 650));

      // Step 3: Server GST Validation & Ledger Writing
      setStep(3);
      const res = await uploadFile(file);

      // Step 4: Finished
      setStep(4);
      await new Promise((r) => setTimeout(r, 400));

      if (res.data?.invoice_id) {
        navigate(`/bills/${res.data.invoice_id}`);
      } else {
        navigate('/bills');
      }
    } catch (err) {
      console.error('Invoice upload failed:', err);
      let errorMsg = err.response?.data?.detail;
      if (!errorMsg) {
        if (err.message?.includes('Backend API not reachable') || err.code === 'ERR_NETWORK') {
          errorMsg = 'Cannot reach backend server. Please make sure the FastAPI backend is running on http://127.0.0.1:8000.';
        } else if (err.code === 'ECONNABORTED') {
          errorMsg = 'PaddleOCR processing timed out. Please try with a smaller document or clearer image.';
        } else {
          errorMsg = err.message || 'Failed to process document with PaddleOCR. Please check the file format.';
        }
      }
      setError(errorMsg);
      setUploading(false);
      setStep(0);
    }
  };

  const steps = [
    { title: '1. Ingest & Screening', desc: 'Laplacian variance blur & contrast check' },
    { title: '2. PaddleOCR PP-OCRv4', desc: 'Bilingual Devanagari Hindi & English recognition' },
    { title: '3. Deterministic GST Check', desc: '15-digit GSTIN checksum & tax arithmetic' },
    { title: '4. Ledger & MSMED Calendar', desc: 'Saved to SQLite ledger with payment reminders' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="reelo-pill shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0099FF] animate-pulse"></span>
            <span className="font-ui text-xs font-semibold tracking-wide">
              PaddleOCR Open-Source Engine (PP-OCRv4)
            </span>
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-bold font-heading text-black tracking-tight">
          Upload Invoices &amp; Bills
        </h1>
        
        <p className="text-base text-[#333333] max-w-xl mx-auto font-ui">
          On-premise bilingual optical character recognition powered by PaddlePaddle OCR.
          Processes crumpled receipts, multi-page PDFs, and spreadsheets with bank-grade privacy.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="reelo-card p-6 sm:p-12 space-y-8 bg-white shadow-sm">
        
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-[32px] p-10 sm:p-14 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-black bg-neutral-100 scale-[0.99]'
              : file
                ? 'border-[#4EA100] bg-[#DCFFDB]/30'
                : 'border-[#DBDBDB] hover:border-black bg-[#F8F8F8]'
          }`}
        >
          <input {...getInputProps()} />

          {file ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto shadow-md">
                <FileCheck className="w-8 h-8 text-[#DCFFDB]" />
              </div>
              <div className="space-y-1">
                <p className="font-heading font-bold text-lg text-black">{file.name}</p>
                <p className="text-xs font-mono text-[#666666]">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; {file.type || 'Document'}
                </p>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#DCFFDB] text-[#4EA100] text-xs font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>Ready for PaddleOCR inference</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-white border border-[#DBDBDB] flex items-center justify-center mx-auto shadow-sm">
                <UploadIcon className="w-7 h-7 text-black" />
              </div>
              <div className="space-y-1">
                <p className="font-heading font-semibold text-lg text-black">
                  Drag and drop your invoice here, or click to browse
                </p>
                <p className="text-xs text-[#666666] max-w-md mx-auto">
                  Supports scanned PDF, PNG, JPG, JPEG, WEBP, Excel (XLSX), CSV (Up to 15MB)
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <span className="reelo-pill text-[11px] py-1 px-3 bg-white text-[#333333]">
                  Hindi &amp; English Bilingual
                </span>
                <span className="reelo-pill text-[11px] py-1 px-3 bg-white text-[#333333]">
                  200 DPI Rasterization
                </span>
                <span className="reelo-pill text-[11px] py-1 px-3 bg-white text-[#333333]">
                  100% Offline / No Data Leak
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#FF4F4F] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4-Step Processing Progress */}
        {uploading && (
          <div className="space-y-4 bg-[#F2F2F2] p-6 rounded-[28px] border border-[#DBDBDB]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#666666] font-bold">
                PaddleOCR Pipeline Execution
              </span>
              <span className="reelo-pill py-0.5 px-2.5 text-[10px] bg-black text-white font-mono border-none">
                Step {step} of 4
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {steps.map((s, idx) => {
                const isCurrent = step === idx + 1;
                const isDone = step > idx + 1;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs transition-all ${
                      isDone
                        ? 'bg-[#DCFFDB] border-[#4EA100]/30 text-[#171717]'
                        : isCurrent
                          ? 'bg-black text-white border-black shadow-md scale-[1.02]'
                          : 'bg-white border-[#DBDBDB] text-[#999999]'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-semibold">
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 text-[#4EA100]" />
                      ) : isCurrent ? (
                        <Sparkles className="w-3.5 h-3.5 text-[#0099FF] animate-spin" />
                      ) : null}
                      <span>{s.title}</span>
                    </div>
                    <p className={`text-[10px] mt-1 ${isCurrent ? 'text-neutral-300' : 'text-[#666666]'}`}>
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F2F2F2]">
          <div className="text-xs text-[#666666] font-ui flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-[#4EA100]" />
            <span>Bank-grade encryption &bull; Local inference</span>
          </div>

          <div className="flex space-x-3">
            {file && (
              <button
                type="button"
                onClick={() => { setFile(null); setError(''); }}
                className="reelo-btn-white px-5 py-2.5 text-xs font-semibold"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={handleProcess}
              disabled={!file || uploading}
              className="reelo-btn-black px-7 py-3 text-xs font-semibold inline-flex items-center space-x-2 disabled:opacity-50 shadow-sm"
            >
              <Cpu className="w-4 h-4 text-[#0099FF]" />
              <span>{uploading ? 'Processing with PaddleOCR...' : 'Run PaddleOCR Pipeline'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Engine Specs Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="reelo-card p-6 bg-white space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-[#0099FF]" />
          </div>
          <h3 className="font-heading font-bold text-base text-black">PP-OCRv4 Architecture</h3>
          <p className="text-xs text-[#666666] leading-relaxed">
            Ultra-lightweight text detection (DBNet) and recognition (SVTR) trained on diverse Indian commercial typography.
          </p>
        </div>

        <div className="reelo-card p-6 bg-white space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center">
            <Globe2 className="w-5 h-5 text-[#4EA100]" />
          </div>
          <h3 className="font-heading font-bold text-base text-black">Bilingual Hindi &amp; English</h3>
          <p className="text-xs text-[#666666] leading-relaxed">
            Automatic Devanagari Unicode detection with dual-script parsing for state transport, petrol, and local Mandi bills.
          </p>
        </div>

        <div className="reelo-card p-6 bg-white space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <h3 className="font-heading font-bold text-base text-black">Open-Source &amp; Private</h3>
          <p className="text-xs text-[#666666] leading-relaxed">
            Directly derived from <a href="https://github.com/PaddlePaddle/PaddleOCR.git" target="_blank" rel="noreferrer" className="text-[#0099FF] underline font-medium">PaddleOCR GitHub</a>. Zero data leaves your infrastructure.
          </p>
        </div>
      </div>

    </div>
  );
}
