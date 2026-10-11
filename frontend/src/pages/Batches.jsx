import React, { useState } from 'react';
import { Layers, CheckCircle, AlertTriangle, RefreshCw, Upload, FileArchive } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Batches() {
  const [batches, setBatches] = useState([
    {
      id: 'batch-2026-0915',
      name: 'September Vendor Bills (Q2 Reconciliation)',
      total: 18,
      succeeded: 16,
      needs_review: 2,
      failed: 0,
      status: 'completed',
      date: '2026-09-15 14:30',
    },
    {
      id: 'batch-2026-0810',
      name: 'Gujarat Freight & Logistics Challans',
      total: 12,
      succeeded: 12,
      needs_review: 0,
      failed: 0,
      status: 'completed',
      date: '2026-08-10 11:15',
    },
    {
      id: 'batch-2026-0704',
      name: 'Latha Enterprises Raw Material Receipts',
      total: 6,
      succeeded: 5,
      needs_review: 1,
      failed: 0,
      status: 'completed',
      date: '2026-07-04 09:45',
    }
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-ui">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#DBDBDB] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black font-heading">
            Batch Processing
          </h1>
          <p className="text-xs text-[#696969] mt-1">
            Concurrent multi-file extraction with isolated failure recovery and safe ZIP archive guard.
          </p>
        </div>
        <Link
          to="/upload"
          className="reelo-btn-black px-5 py-2.5 text-xs font-semibold flex items-center space-x-2 shadow-xs"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Archive / Batch</span>
        </Link>
      </div>

      {/* Batches Table Card */}
      <div className="reelo-card p-6 sm:p-8 bg-white shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-[#DBDBDB] pb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-black" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              Ingested Batches ({batches.length})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#696969]">
            Max Concurrency: 3 | Safe ZIP Slip Shield: Active
          </span>
        </div>

        <div className="divide-y divide-[#DBDBDB]">
          {batches.map((batch) => {
            const pct = Math.round(((batch.succeeded + batch.needs_review) / batch.total) * 100);
            return (
              <div key={batch.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-3">
                    <FileArchive className="w-4 h-4 text-[#0099FF]" />
                    <span className="font-bold text-sm text-black">{batch.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F2F2F2] border border-[#DBDBDB] text-[#696969]">
                      {batch.id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-[#696969]">
                    <span>Total: <strong className="text-black">{batch.total} bills</strong></span>
                    <span className="text-[#4EA100]">✓ {batch.succeeded} Validated</span>
                    {batch.needs_review > 0 && (
                      <span className="text-amber-600">⚠ {batch.needs_review} In Review</span>
                    )}
                    <span>Timestamp: {batch.date}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-md bg-[#F2F2F2] h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-black h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Link
                    to="/bills"
                    className="px-4 py-2 rounded-full border border-[#DBDBDB] hover:bg-[#F2F2F2] text-xs font-semibold text-black transition"
                  >
                    View Invoices
                  </Link>
                  {batch.needs_review > 0 && (
                    <Link
                      to="/review"
                      className="reelo-btn-blue px-4 py-2 text-xs font-semibold"
                    >
                      Open Review Queue ({batch.needs_review})
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
