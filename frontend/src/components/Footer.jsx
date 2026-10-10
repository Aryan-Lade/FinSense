import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      
      {/* Big Dark CTA Banner */}
      <div className="reelo-card-dark p-8 sm:p-14 lg:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-4 max-w-2xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0099FF]" />
            <span>100% Deterministic Math Verification</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-heading">
            Ready to eliminate GST penalties and automate bills?
          </h2>
          <p className="text-base sm:text-lg text-white/70 font-ui leading-relaxed">
            Turn messy invoices into audit-proof records with bilingual PaddleOCR and automated payment tracking.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <Link
            to="/upload"
            className="reelo-btn-white px-8 py-4 text-base font-semibold gap-2 shadow-lg hover:scale-105 transition-all"
          >
            <span>Upload Invoice Now</span>
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#0099FF]/20 blur-3xl pointer-events-none"></div>
      </div>

      {/* Directory Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pt-8 border-t border-[#DBDBDB]">
        
        {/* Col 1: Brand Info */}
        <div className="lg:col-span-4 space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <svg className="w-7 h-7 text-black transform rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="4" />
            </svg>
            <span className="font-heading text-2xl font-bold tracking-tight text-black">
              FinSense
            </span>
          </Link>
          <p className="text-sm text-[#333333] font-ui leading-relaxed">
            AI-powered GST invoice intelligence & bill management platform built for Indian businesses, chartered accountants, and finance teams.
          </p>
        </div>

        {/* Col 2: Navigation */}
        <div className="lg:col-span-2 space-y-3 font-ui text-sm">
          <h4 className="font-bold text-black uppercase tracking-wider text-xs">Features</h4>
          <ul className="space-y-2 text-[#333333]">
            <li><Link to="/bills" className="hover:text-[#0099FF] transition">All Bills</Link></li>
            <li><Link to="/upload" className="hover:text-[#0099FF] transition">Upload Invoice</Link></li>
            <li><Link to="/review" className="hover:text-[#0099FF] transition">Review Queue</Link></li>
            <li><Link to="/suppliers" className="hover:text-[#0099FF] transition">Suppliers</Link></li>
          </ul>
        </div>

        {/* Col 3: Compliance */}
        <div className="lg:col-span-3 space-y-3 font-ui text-sm">
          <h4 className="font-bold text-black uppercase tracking-wider text-xs">Compliance</h4>
          <ul className="space-y-2 text-[#333333]">
            <li><Link to="/analytics" className="hover:text-[#0099FF] transition">ITC Tax Ledger</Link></li>
            <li><Link to="/reminders" className="hover:text-[#0099FF] transition">Payment Reminders</Link></li>
            <li><span className="text-[#999999]">Section 16(4) Statutory ITC</span></li>
            <li><span className="text-[#999999]">MSMED 45-Day Payment Rule</span></li>
          </ul>
        </div>

        {/* Col 4: Newsletter */}
        <div className="lg:col-span-3 space-y-3 font-ui text-sm">
          <h4 className="font-bold text-black uppercase tracking-wider text-xs">Tax Compliance Updates</h4>
          <p className="text-xs text-[#333333]">
            Get the latest GST circulars and product updates in your inbox.
          </p>
          {subscribed ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4EA100] bg-[#DCFFDB] p-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>Subscribed successfully!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2.5 rounded-full border border-[#DBDBDB] bg-white text-xs text-black focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                className="w-full reelo-btn-black py-2.5 text-xs"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Giant "FinSense" wordmark banner at bottom */}
      <div className="pt-12 select-none pointer-events-none">
        <h1 className="text-[16vw] font-black text-center leading-none tracking-tighter text-[#E6E6E6] font-heading">
          FinSense
        </h1>
      </div>

    </footer>
  );
}
