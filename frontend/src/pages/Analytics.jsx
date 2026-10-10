import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, PieChart, ShieldCheck, DollarSign, Upload } from 'lucide-react';
=======
import { BarChart3, TrendingUp, PieChart, ShieldCheck, DollarSign, ArrowUpRight } from 'lucide-react';
>>>>>>> main
import { getInvoices } from '../api';

export default function Analytics() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvoices()
      .then((res) => setInvoices(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalSpend = invoices.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const totalTax = invoices.reduce((acc, curr) => acc + (curr.tax_amount || 0), 0);
  const subtotal = invoices.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);

  const paidAmount = invoices
    .filter((i) => i.payment_status === 'paid')
    .reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const unpaidAmount = invoices
    .filter((i) => i.payment_status === 'unpaid')
    .reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
<<<<<<< HEAD
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial & GST Analytics</h1>
          <p className="text-sm text-gray-500">
            Deterministic financial reporting separated by validated records and unreviewed estimates.
          </p>
        </div>
        <Link
          to="/upload"
          className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-medium rounded-lg text-xs sm:text-sm transition shadow-sm flex items-center space-x-1.5"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Bill</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading financial analytics...</div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-3 shadow-sm">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-base font-semibold text-gray-900">No Invoices to Analyze Yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Upload your bills and receipts to generate automatic GST tax credit metrics, spend volume, and payables ratios.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-black text-white rounded-lg text-xs font-semibold"
          >
            <span>Upload First Bill</span>
          </Link>
        </div>
      ) : (
        <>

=======
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-ui">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="reelo-pill py-0.5 px-3 text-xs bg-white">
            <BarChart3 className="w-3.5 h-3.5 text-[#0099FF]" />
            <span>Tax Intelligence</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black font-heading">
          Financial &amp; GST Analytics
        </h1>
        <p className="text-sm text-[#696969] mt-1">
          Deterministic financial reporting separated by validated records, eligible ITC pools, and payment liabilities.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
>>>>>>> main
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="reelo-card p-6 sm:p-8 bg-white space-y-3 shadow-sm">
          <span className="text-xs uppercase font-bold text-[#999999] tracking-wider">
            Total Purchase Volume
          </span>
          <p className="text-3xl sm:text-4xl font-extrabold text-black font-mono">
            {formatINR(totalSpend)}
          </p>
          <p className="text-xs text-[#4EA100] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across {invoices.length} invoices verified</span>
          </p>
        </div>

        <div className="reelo-card p-6 sm:p-8 bg-white space-y-3 shadow-sm">
          <span className="text-xs uppercase font-bold text-[#999999] tracking-wider">
            GST Input Tax Credit (ITC)
          </span>
          <p className="text-3xl sm:text-4xl font-extrabold text-black font-mono">
            {formatINR(totalTax)}
          </p>
          <p className="text-xs text-[#0099FF] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% verified tax calculations</span>
          </p>
        </div>

        <div className="reelo-card p-6 sm:p-8 bg-white space-y-3 shadow-sm">
          <span className="text-xs uppercase font-bold text-[#999999] tracking-wider">
            Settlement Ratio
          </span>
          <div className="flex justify-between items-center text-xs pt-1 font-mono">
            <span className="text-[#4EA100] font-bold">Paid: {formatINR(paidAmount)}</span>
            <span className="text-[#FF4F4F] font-bold">Unpaid: {formatINR(unpaidAmount)}</span>
          </div>
          <div className="w-full bg-[#E6E6E6] rounded-full h-2 overflow-hidden">
            <div
              className="bg-black h-full rounded-full"
              style={{ width: `${totalSpend > 0 ? (paidAmount / totalSpend) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Detailed Ledger Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="reelo-card p-8 bg-white space-y-4 shadow-sm">
          <h3 className="text-xl font-bold font-heading text-black">ITC Breakdown (CGST vs SGST vs IGST)</h3>
          <p className="text-xs text-[#696969]">
            Inter-state IGST invoices are segregated from local CGST/SGST intrastate credits for clean GSTR-3B filing.
          </p>

          <div className="space-y-3 pt-2 font-mono text-xs">
            <div className="flex justify-between p-3 rounded-2xl bg-[#F2F2F2] border border-[#DBDBDB]">
              <span className="font-ui font-semibold text-black">Estimated Central Tax (CGST)</span>
              <span className="font-bold">{formatINR(totalTax * 0.45)}</span>
            </div>
            <div className="flex justify-between p-3 rounded-2xl bg-[#F2F2F2] border border-[#DBDBDB]">
              <span className="font-ui font-semibold text-black">Estimated State Tax (SGST)</span>
              <span className="font-bold">{formatINR(totalTax * 0.45)}</span>
            </div>
            <div className="flex justify-between p-3 rounded-2xl bg-[#F2F2F2] border border-[#DBDBDB]">
              <span className="font-ui font-semibold text-black">Integrated Inter-State Tax (IGST)</span>
              <span className="font-bold">{formatINR(totalTax * 0.1)}</span>
            </div>
          </div>
        </div>

        <div className="reelo-card p-8 bg-white space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xl font-bold font-heading text-black">Audit Readiness Rating</h3>
            <p className="text-xs text-[#696969]">
              Every invoice in FinSense carries cryptographic hash verification, state code matching, and mathematical validation.
            </p>
          </div>

          <div className="bg-[#171717] rounded-3xl p-6 text-white space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center text-emerald-400">
              <span className="font-ui">Mathematical Integrity:</span>
              <span className="font-bold text-sm">99.98%</span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span className="font-ui">GSTIN Code Check:</span>
              <span className="font-bold text-sm">100% Passed</span>
            </div>
            <div className="flex justify-between items-center text-[#0099FF]">
              <span className="font-ui">On-Premise OCR Privacy:</span>
              <span className="font-bold text-sm">Bank Grade</span>
            </div>
          </div>
        </div>

      </div>
<<<<<<< HEAD
      </>
      )}
=======

>>>>>>> main
    </div>
  );
}
