import React, { useState, useEffect } from 'react';
import { Users, Building, FileText, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
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
          ))}
        </div>
      )}

    </div>
  );
}
