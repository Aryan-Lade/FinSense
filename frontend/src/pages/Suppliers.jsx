import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building, FileText, CheckCircle, ExternalLink, Upload } from 'lucide-react';
import { getSuppliers } from '../api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuppliers()
      .then((res) => setSuppliers(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Directory</h1>
          <p className="text-sm text-gray-500">
            Auto-profiled suppliers with GSTIN identity verification and purchase history tracking.
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
        <div className="p-12 text-center text-gray-500">Loading suppliers directory...</div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-base font-semibold text-gray-900">No Suppliers Profiled Yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Vendors and suppliers are automatically extracted and verified with GSTIN records when you upload bills.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-black text-white rounded-lg text-xs font-semibold"
          >
            <span>Upload First Bill</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((sup) => (
          <div key={sup.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base text-gray-900">{sup.legal_name}</h3>
                <p className="text-xs text-gray-500">{sup.trade_name || 'Commercial Supplier'}</p>
              </div>
              <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Building className="w-5 h-5" />
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">GSTIN:</span>
                <span className="font-mono font-bold text-gray-800">{sup.gstin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">State:</span>
                <span className="font-semibold text-gray-800">{sup.state || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Invoices Processed:</span>
                <span className="font-bold text-gray-900">{sup.invoice_count || 1}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-gray-500">Total Purchase Value:</span>
              <span className="font-mono font-bold text-sm text-gray-900">
                {formatINR(sup.total_purchase_value)}
              </span>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
