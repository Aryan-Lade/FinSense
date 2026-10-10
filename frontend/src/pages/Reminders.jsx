import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getReminders } from '../api';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getReminders()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        setReminders(data);
      })
      .catch((err) => {
        console.error('Failed to load reminders:', err);
        setReminders([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-ui">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="reelo-pill py-0.5 px-3 text-xs bg-white">
              <Calendar className="w-3.5 h-3.5 text-[#0099FF]" />
              <span>Statutory Calendar</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black font-heading">
            Payment Reminders
          </h1>
          <p className="text-sm text-[#696969] mt-1">
            Automatic schedules: First reminder 10 days after receipt, recurring every 2 days while unpaid.
          </p>
        </div>

<<<<<<< HEAD
        {/* Automation Policy Badge & Refresh */}
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-left">
            <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
              Automated Policy
            </span>
            <span className="text-xs font-medium text-emerald-900">
              10 Days Post-Receipt • Repeat every 2d
            </span>
          </div>
          <button
            onClick={loadData}
            className="px-3.5 py-2 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-2xs"
            title="Refresh reminders"
          >
            <span>Refresh</span>
=======
        {/* Demo Clock Simulator */}
        <div className="reelo-card p-3.5 bg-white border border-[#DBDBDB] flex items-center space-x-4 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#999999] tracking-wider block">
              Time Simulator
            </span>
            <span className="text-xs font-mono font-bold text-black">
              +{simulatedDays} Days Advanced
            </span>
          </div>
          <button
            onClick={() => handleAdvance(2)}
            className="reelo-btn-black px-4 py-2 text-xs font-semibold flex items-center space-x-1.5"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>+2 Days</span>
>>>>>>> main
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="reelo-card p-6 sm:p-8 bg-white shadow-sm space-y-4">
        <h2 className="text-xl font-bold font-heading text-black">Scheduled Due Dates</h2>

        {loading ? (
          <div className="p-12 text-center text-sm text-[#999999] flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span>Loading scheduled reminders...</span>
          </div>
        ) : reminders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-bold text-black font-heading">No pending payment reminders</p>
            <p className="text-xs text-[#696969]">All invoices are settled or scheduled beyond the alert window.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((rem, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-[#F2F2F2] border border-[#DBDBDB] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-[#E6E6E6]/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-white border border-[#DBDBDB] flex items-center justify-center text-amber-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black font-heading">
                      {rem.supplier_name || 'Vendor Payment'}
                    </h4>
                    <p className="text-xs text-[#696969] font-mono">
                      Bill #{rem.bill_number || 'N/A'} • Due: {rem.due_date ? new Date(rem.due_date).toLocaleDateString() : 'Immediate'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="reelo-pill py-0.5 px-3 text-xs font-mono font-bold bg-white text-black">
                    ₹ {rem.total_amount?.toLocaleString('en-IN') || '0'}
                  </span>
                  <span className="reelo-pill py-0.5 px-2.5 text-[10px] bg-amber-100 text-amber-800 border-none font-bold">
                    Active Alert
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
