import React, { useState } from 'react';
import { Calendar, MessageSquare, Mail, Shield, Check, Clock, Globe, Settings as SettingsIcon } from 'lucide-react';

export default function Integrations() {
  const [googleConnected, setGoogleConnected] = useState(true);
  const [reminderDays, setReminderDays] = useState(10);
  const [repeatDays, setRepeatDays] = useState(2);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-ui">
      {/* Header */}
      <div className="border-b border-[#DBDBDB] pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-black font-heading">
          Settings &amp; Integrations
        </h1>
        <p className="text-xs text-[#696969] mt-1">
          Manage calendar synchronization, omnichannel intake webhooks, and statutory watchdog rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Google Calendar Card */}
        <div className="reelo-card p-6 sm:p-8 bg-white shadow-sm space-y-6">
          <div className="flex justify-between items-start border-b border-[#DBDBDB] pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0099FF]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-black">Google Calendar Sync</h2>
                <p className="text-xs text-[#696969]">Dedicated 'FinSense Reminders' calendar</p>
              </div>
            </div>
            <span className="reelo-pill py-0.5 px-3 text-[10px] bg-[#DCFFDB] text-[#4EA100] border-none font-bold">
              Connected (Simulator)
            </span>
          </div>

          <div className="space-y-3 text-xs text-[#696969]">
            <p>
              Synchronizes bill payment dates with deterministic recurring calendar events (<code className="font-mono bg-[#F2F2F2] px-1 py-0.5 rounded text-black">RRULE:FREQ=DAILY;INTERVAL=2</code>).
            </p>
            <div className="p-3 bg-[#F2F2F2] rounded-2xl space-y-1 font-mono text-[11px] text-black border border-[#DBDBDB]">
              <p>• Account: demo.admin@finsense.internal</p>
              <p>• Calendar: FinSense Reminders</p>
              <p>• Idempotent Hex Event ID: Active</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-[#696969]">Confirm-before-create preview enabled</span>
            <button
              onClick={() => setGoogleConnected(!googleConnected)}
              className="px-4 py-2 rounded-full border border-[#DBDBDB] hover:bg-[#F2F2F2] text-xs font-semibold text-black transition"
            >
              {googleConnected ? 'Reconnect Calendar' : 'Connect Calendar'}
            </button>
          </div>
        </div>

        {/* Reminder Watchdog Policy */}
        <div className="reelo-card p-6 sm:p-8 bg-white shadow-sm space-y-6">
          <div className="flex justify-between items-start border-b border-[#DBDBDB] pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#4EA100]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-black">Default Reminder Policy</h2>
                <p className="text-xs text-[#696969]">Automated payment reminder cadence</p>
              </div>
            </div>
            <span className="reelo-pill py-0.5 px-3 text-[10px] bg-[#F2F2F2] text-black border border-[#DBDBDB] font-bold">
              Asia/Kolkata (IST)
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#696969]">
                First Reminder (Days after receipt)
              </label>
              <input
                type="number"
                value={reminderDays}
                onChange={(e) => setReminderDays(parseInt(e.target.value) || 10)}
                className="w-full px-3.5 py-2 border border-[#DBDBDB] bg-[#F2F2F2] rounded-2xl text-xs font-mono text-black focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#696969]">
                Repeat Cadence while unpaid (Days)
              </label>
              <input
                type="number"
                value={repeatDays}
                onChange={(e) => setRepeatDays(parseInt(e.target.value) || 2)}
                className="w-full px-3.5 py-2 border border-[#DBDBDB] bg-[#F2F2F2] rounded-2xl text-xs font-mono text-black focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#696969]">
                Daily Execution Time (HH:MM)
              </label>
              <input
                type="text"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#DBDBDB] bg-[#F2F2F2] rounded-2xl text-xs font-mono text-black focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>

            <button
              onClick={handleSave}
              className="reelo-btn-black w-full py-2.5 text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saved ? 'Settings Saved' : 'Save Reminder Policy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
