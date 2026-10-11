import React, { useState } from 'react';
import { MessageSquare, Mail, Globe, CheckCircle, Shield, ArrowUpRight, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Inbox() {
  const [messages, setMessages] = useState([
    {
      id: 'wa-msg-8819',
      channel: 'whatsapp',
      sender_masked: '+91 98*** **412',
      sender_label: 'Gujarat Freight Tools (Authorized Dispatch)',
      received_at: 'Just now',
      attachment_name: 'GFT_Challan_32.pdf',
      status: 'completed',
      validation_status: 'valid',
      amount: 1189.0,
      confidence: '98%',
    },
    {
      id: 'em-msg-1249',
      channel: 'email',
      sender_masked: 'ac***@surabhi.com',
      sender_label: 'Surabhi Hardwares Finance Desk',
      received_at: '2 hours ago',
      attachment_name: 'Tax_Invoice_SHB45620.jpg',
      status: 'completed',
      validation_status: 'valid',
      amount: 4130.0,
      confidence: '96%',
    },
    {
      id: 'wa-msg-7721',
      channel: 'whatsapp',
      sender_masked: '+91 94*** **908',
      sender_label: 'Latha Enterprises Sales Rep',
      received_at: 'Yesterday',
      attachment_name: 'Cash_Bill_621.jpeg',
      status: 'completed',
      validation_status: 'valid',
      amount: 28860.0,
      confidence: '97%',
    }
  ]);

  const [simulating, setSimulating] = useState(false);

  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => {
      const newSim = {
        id: `wa-msg-${Math.floor(1000 + Math.random() * 9000)}`,
        channel: 'whatsapp',
        sender_masked: '+91 98*** **789',
        sender_label: 'Darshan Engineering Works (Dispatch Webhook)',
        received_at: 'Just now',
        attachment_name: 'Darshan_Estimate_02.jpg',
        status: 'completed',
        validation_status: 'valid',
        amount: 98384.0,
        confidence: '99%',
      };
      setMessages([newSim, ...messages]);
      setSimulating(false);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-ui">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#DBDBDB] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-black font-heading">
              Omnichannel Intake Inbox
            </h1>
            <span className="reelo-pill py-0.5 px-2.5 text-[10px] bg-[#DCFFDB] text-[#4EA100] border-none font-bold">
              Active Listeners
            </span>
          </div>
          <p className="text-xs text-[#696969] mt-1">
            Real-time automated intake via WhatsApp Cloud API webhook, email routing, and direct web ingestion.
          </p>
        </div>

        {/* Demo Simulation Button */}
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="reelo-btn-black px-5 py-2.5 text-xs font-semibold flex items-center space-x-2 shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{simulating ? 'Ingesting Webhook...' : 'Simulate WhatsApp Inbound Bill'}</span>
        </button>
      </div>

      {/* Messages List Card */}
      <div className="reelo-card p-6 sm:p-8 bg-white shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-[#DBDBDB] pb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black">
            Inbound Messages &amp; Attachments ({messages.length})
          </h2>
          <span className="text-[11px] font-mono text-[#696969]">
            HMAC-SHA256 Signatures Verified | Masked PII
          </span>
        </div>

        <div className="divide-y divide-[#DBDBDB]">
          {messages.map((msg) => (
            <div key={msg.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-xs ${
                  msg.channel === 'whatsapp'
                    ? 'bg-[#DCFFDB]/50 border-emerald-300 text-[#4EA100]'
                    : 'bg-blue-50 border-blue-200 text-[#0099FF]'
                }`}>
                  {msg.channel === 'whatsapp' ? <MessageSquare className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-sm text-black">{msg.sender_label}</span>
                    <span className="text-xs font-mono text-[#696969]">({msg.sender_masked})</span>
                    <span className="reelo-pill py-0.5 px-2 text-[10px] bg-[#DCFFDB] text-[#4EA100] border-none font-bold">
                      PaddleOCR Conf: {msg.confidence}
                    </span>
                  </div>

                  <p className="text-xs text-[#696969]">
                    Attachment: <strong className="text-black font-mono">{msg.attachment_name}</strong> • Amount: <strong className="text-black">₹{msg.amount.toLocaleString('en-IN')}</strong> • {msg.received_at}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  to="/bills"
                  className="px-4 py-2 rounded-full border border-[#DBDBDB] hover:bg-[#F2F2F2] text-xs font-semibold text-black transition flex items-center space-x-1"
                >
                  <span>Inspect Bill</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#696969]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
