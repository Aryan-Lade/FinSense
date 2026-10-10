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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upcoming Payment Reminders</h1>
          <p className="text-sm text-gray-500">
            Automatic schedules: First reminder 10 days after receipt, recurring every 2 days while unpaid.
          </p>
        </div>

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
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {reminders.length === 0 ? (
          <div className="p-12 text-center space-y-2 text-gray-500">
            <Clock className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="font-semibold text-gray-800">No scheduled reminders active</p>
            <p className="text-xs">Reminders are scheduled automatically when unpaid bills are processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Invoice ID</th>
                  <th className="px-6 py-3">Rule Policy</th>
                  <th className="px-6 py-3">First Fire At</th>
                  <th className="px-6 py-3">Repeat Cycle</th>
                  <th className="px-6 py-3">Calendar Sync</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reminders.map((rem) => (
                  <tr key={rem.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                      {rem.invoice_id?.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {rem.rule_type === 'after_receipt' ? '10 Days Post-Receipt' : rem.rule_type}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {rem.first_fire_at ? new Date(rem.first_fire_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      Every {rem.repeat_every_days || 2} days
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Calendar className="w-3 h-3 mr-1" />
                        {rem.calendar_sync_status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {rem.status || 'Scheduled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
