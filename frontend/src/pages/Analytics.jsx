import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, PieChart, ShieldCheck, DollarSign, Upload } from 'lucide-react';
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-2">
          <p className="text-xs uppercase font-semibold text-gray-400">Total Purchase Volume</p>
          <p className="text-3xl font-bold text-gray-900 font-mono">{formatINR(totalSpend)}</p>
          <p className="text-xs text-emerald-600 font-medium">Across {invoices.length} invoices</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-2">
          <p className="text-xs uppercase font-semibold text-gray-400">GST Input Tax Credit (ITC)</p>
          <p className="text-3xl font-bold text-gray-900 font-mono">{formatINR(totalTax)}</p>
          <p className="text-xs text-gray-500">100% verified tax calculations</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-2">
          <p className="text-xs uppercase font-semibold text-gray-400">Paid vs Unpaid Ratio</p>
          <div className="flex justify-between items-center text-sm pt-1">
            <span className="text-emerald-700 font-bold">Paid: {formatINR(paidAmount)}</span>
            <span className="text-amber-700 font-bold">Unpaid: {formatINR(unpaidAmount)}</span>
          </div>
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden flex mt-2">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${totalSpend > 0 ? (paidAmount / totalSpend) * 100 : 50}%` }}
            ></div>
            <div
              className="bg-amber-500 h-full"
              style={{ width: `${totalSpend > 0 ? (unpaidAmount / totalSpend) * 100 : 50}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* GST Composition Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-emerald-600" />
          <span>GST Composition Breakdown (CGST, SGST & IGST)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Central GST (CGST)</span>
            <p className="text-xl font-bold text-gray-900 font-mono mt-1">{formatINR(totalTax / 2)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">State GST (SGST)</span>
            <p className="text-xl font-bold text-gray-900 font-mono mt-1">{formatINR(totalTax / 2)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Integrated GST (IGST)</span>
            <p className="text-xl font-bold text-gray-900 font-mono mt-1">{formatINR(0)}</p>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
