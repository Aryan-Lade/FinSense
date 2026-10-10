import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { Users, Building, FileText, CheckCircle, ExternalLink, Upload } from 'lucide-react';
=======
import { Users, Building, FileText, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
>>>>>>> main
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
<<<<<<< HEAD
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
=======
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-ui">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="reelo-pill py-0.5 px-3 text-xs bg-white">
            <Building className="w-3.5 h-3.5 text-[#0099FF]" />
            <span>Vendor Directory</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black font-heading">
          Supplier Directory
        </h1>
        <p className="text-sm text-[#696969] mt-1">
          Auto-profiled suppliers with verified GSTIN identity, jurisdiction state code, and purchase history.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-sm text-[#999999] flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          <span>Loading supplier profiles...</span>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="reelo-card p-16 text-center space-y-3 bg-white">
          <p className="text-base font-bold text-black font-heading">No suppliers recorded yet</p>
          <p className="text-xs text-[#696969]">Upload an invoice to automatically extract and register vendors.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((sup) => (
            <div 
              key={sup.id} 
              className="reelo-card p-6 bg-white space-y-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-black font-heading">{sup.legal_name}</h3>
                    <p className="text-xs text-[#696969]">{sup.trade_name || 'Commercial Supplier'}</p>
                  </div>
                  <div className="w-9 h-9 rounded-2xl bg-[#DCFFDB] text-[#4EA100] flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
>>>>>>> main

                <div className="bg-[#F2F2F2] rounded-2xl p-4 text-xs space-y-2 border border-[#DBDBDB] font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#696969] font-ui">GSTIN:</span>
                    <span className="font-bold text-black">{sup.gstin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#696969] font-ui">State:</span>
                    <span className="font-semibold text-black font-ui">{sup.state || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#696969] font-ui">Invoices:</span>
                    <span className="font-bold text-black">{sup.invoice_count || 1} processed</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DBDBDB] flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-[#999999] uppercase font-ui">Total Billed</span>
                  <p className="font-bold font-mono text-black text-sm">{formatINR(sup.total_spend || 0)}</p>
                </div>
                <span className="reelo-pill py-0.5 px-2 text-[10px] bg-white text-[#0099FF] font-bold">
                  Verified Active
                </span>
              </div>
            </div>
<<<<<<< HEAD
          </div>
        ))}
        </div>
      )}
=======
          ))}
        </div>
      )}

>>>>>>> main
    </div>
  );
}
