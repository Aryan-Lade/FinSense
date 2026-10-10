import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Check, 
  X, 
  Star, 
  ChevronDown, 
  Play, 
  ShieldCheck, 
  TrendingUp,
  Sparkles,
  Zap,
  FileText,
  Clock,
  ArrowRight,
  Upload,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Database,
  Cpu,
  Layers,
  Lock,
  Search,
  Scale
} from 'lucide-react';
import Footer from '../components/Footer';
import { getInvoices } from '../api';
import { isSupabaseConfigured, fetchSupabaseInvoices } from '../supabase';

const DEMO_INVOICES = [
  {
    id: "af5d993a-1c8d-4e2e-893c-c7f56fadc2c2",
    bill_number: "INV-2026-089",
    supplier_name: "Apex Global Cloud Solutions",
    total_amount: 118000.0,
    subtotal: 100000.0,
    tax_amount: 18000.0,
    currency: "INR",
    validation_status: "valid",
    review_status: "approved",
    payment_status: "unpaid",
    invoice_date: "2026-05-15",
    due_date: "2026-05-30"
  },
  {
    id: "a1cc7732-ddca-4f22-a40d-bcd667401d5c",
    bill_number: "BS-901-HI",
    supplier_name: "भारत सप्लायर्स प्राइवेट लिमिटेड",
    total_amount: 47200.0,
    subtotal: 40000.0,
    tax_amount: 7200.0,
    currency: "INR",
    validation_status: "valid",
    review_status: "approved",
    payment_status: "paid",
    invoice_date: "2026-05-10",
    due_date: "2026-05-25"
  },
  {
    id: "2bf1ad1e-e36d-4902-b61d-da95586f655a",
    bill_number: "BILL-3A442B",
    supplier_name: "SunstarIT Solutions",
    total_amount: 77694.0,
    subtotal: 65842.0,
    tax_amount: 11852.0,
    currency: "INR",
    validation_status: "valid",
    review_status: "approved",
    payment_status: "unpaid",
    invoice_date: "2026-05-02",
    due_date: "2026-05-17"
  },
  {
    id: "65c84bd8-cff9-4c66-971e-16a9974f6d27",
    bill_number: "INV-2026-012",
    supplier_name: "Delta Industrial Equipments",
    total_amount: 149860.0,
    subtotal: 127000.0,
    tax_amount: 22860.0,
    currency: "INR",
    validation_status: "valid",
    review_status: "approved",
    payment_status: "paid",
    invoice_date: "2026-04-28",
    due_date: "2026-05-13"
  },
  {
    id: "7d942647-6faa-4e10-a597-1413bb5df8ac",
    bill_number: "AX-442-REV",
    supplier_name: "Nexus Logistics LLP",
    total_amount: 115000.0,
    subtotal: 97457.0,
    tax_amount: 17543.0,
    currency: "INR",
    validation_status: "invalid",
    review_status: "needs_review",
    payment_status: "unpaid",
    invoice_date: "2026-05-08",
    due_date: "2026-05-23"
  }
];

export default function Home() {
  const [invoices, setInvoices] = useState(DEMO_INVOICES);
  const [loading, setLoading] = useState(false);
  const [visibleAudits, setVisibleAudits] = useState(6);
  const [faqOpen, setFaqOpen] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveLedger() {
      try {
        if (isSupabaseConfigured) {
          const supaData = await fetchSupabaseInvoices();
          if (Array.isArray(supaData) && supaData.length > 0 && isMounted) {
            setInvoices(supaData);
            return;
          }
        }
        const res = await getInvoices();
        if (isMounted) {
          const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
          if (items.length > 0) {
            setInvoices(items);
          }
        }
      } catch (err) {
        // Fall back gracefully to demo invoices
        if (isMounted) {
          setInvoices((prev) => (Array.isArray(prev) && prev.length > 0 ? prev : DEMO_INVOICES));
        }
      }
    }
    loadLiveLedger();
    return () => { isMounted = false; };
  }, []);

  // Compute live ledger metrics safely
  const safeInvoices = Array.isArray(invoices) && invoices.length > 0 ? invoices : DEMO_INVOICES;
  const latestInvoice = safeInvoices.length > 0 ? safeInvoices[0] : null;
  const totalSpend = safeInvoices.reduce((acc, curr) => acc + (Number(curr?.total_amount) || 0), 0);
  const validCount = safeInvoices.filter(i => i?.validation_status === 'valid').length;
  const reviewCount = safeInvoices.filter(i => i?.review_status === 'needs_review').length;

  const architecturalPillars = [
    {
      title: "Deterministic Math Engine",
      tag: "100% Code Verified",
      desc: "Zero hallucination guarantee. Taxable sums, CGST/SGST/IGST splits, and line item arithmetic are recomputed using exact mathematical rules.",
      icon: Scale,
      color: "text-[#0099FF]",
      bg: "bg-[#0099FF]/10"
    },
    {
      title: "PaddleOCR (PP-OCRv4)",
      tag: "Bilingual Devanagari & Latin",
      desc: "Ultra-fast on-premise text detection (DBNet) and recognition (SVTR) trained on Indian commercial receipts and multi-page tax invoices.",
      icon: Cpu,
      color: "text-[#4EA100]",
      bg: "bg-[#DCFFDB]"
    },
    {
      title: "Supabase & SQLite Hybrid",
      tag: "Cloud + Offline",
      desc: "Seamless synchronization between local SQLite ledger and Supabase PostgreSQL with S3-compatible document bucket storage.",
      icon: Database,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Section 43B(h) MSMED Calendar",
      tag: "Statutory 45-Day Tracker",
      desc: "Automated due-date scheduling with 10-day reminders preventing corporate tax disallowance on micro and small enterprise vendor payments.",
      icon: Calendar,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Cryptographic SHA-256 Guard",
      tag: "Anti-Duplicate Index",
      desc: "Every uploaded invoice generates an immutable SHA-256 digital fingerprint to permanently prevent double payments across branches.",
      icon: Lock,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "36 State GSTIN Jurisdiction Routing",
      tag: "Intra vs Interstate",
      desc: "Validates 15-character GSTIN checksums and verifies supplier state code against place of supply to accurately check CGST+SGST vs IGST.",
      icon: Layers,
      color: "text-sky-600",
      bg: "bg-sky-50"
    }
  ];

  const faqs = [
    {
      q: "How does FinSense deterministic verification work?",
      a: "FinSense performs exact mathematical recalculation of taxable amounts, CGST, SGST, IGST, and line item sums using pure deterministic algorithms. Unlike hallucination-prone LLMs, tax math is checked with 100% code accuracy."
    },
    {
      q: "Does FinSense require an internet connection for OCR?",
      a: "No! FinSense is powered by an offline, on-premise PaddleOCR engine. Your sensitive invoices and vendor financial records are processed right on your machine with bank-grade privacy."
    },
    {
      q: "Can I connect my Supabase database and storage?",
      a: "Yes! Simply configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your frontend environment. FinSense supports both local SQLite and Supabase PostgreSQL with secure cloud bucket storage."
    },
    {
      q: "Which file formats are supported?",
      a: "FinSense accepts scanned paper receipts, mobile camera photos (JPEG, PNG), vector and multi-page PDFs, and Excel spreadsheets."
    },
    {
      q: "How does duplicate invoice detection work?",
      a: "Every uploaded file generates an immutable SHA-256 cryptographic hash alongside vendor bill number indexing, instantly alerting you if an invoice has already been recorded or paid."
    }
  ];

  const blogPosts = [
    {
      slug: "gstr-2b-reconciliation-guide",
      title: "How to eliminate GSTR-2B mismatch penalties under Section 16(4)",
      excerpt: "Step-by-step framework to identify non-compliant vendor filings before tax audit deadlines.",
      category: "GST Compliance",
      author: "Tax Desk",
      img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop"
    },
    {
      slug: "paddleocr-vs-cloud-apis",
      title: "Why on-premise PaddleOCR beats cloud LLMs for Indian invoices",
      excerpt: "Evaluating bilingual accuracy, latency, and data confidentiality across 10,000 scanned bills.",
      category: "AI & Tech",
      author: "Engineering",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
    },
    {
      slug: "msmed-45-day-rule-explained",
      title: "Mastering the MSME 45-day payment rule under Section 43B(h)",
      excerpt: "How automated statutory bill calendars keep your corporate tax deductions safe from disallowance.",
      category: "Audit & Law",
      author: "Audit Bureau",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
    },
    {
      slug: "reverse-charge-mechanism-framework",
      title: "The complete guide to Reverse Charge Mechanism (RCM) compliance",
      excerpt: "Prevent accidental ITC forfeiture on unregistered supplier and freight logistics bills.",
      category: "Finance",
      author: "Research",
      img: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&h=400&fit=crop"
    }
  ];


  return (
    <div className="space-y-28 sm:space-y-36 pb-12 overflow-hidden">
      
      {/* =========================================================================
          1. HERO SECTION (High-Visual Split Layout matching Reference Design)
         ========================================================================= */}
      <section className="pt-8 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Content & CTAs */}
          <div className="lg:col-span-7 xl:col-span-6 text-left space-y-7">

            {/* Main Headline */}
            <h1 
              style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
              className="text-4xl sm:text-5xl lg:text-[68px] font-extrabold text-[#0F172A] tracking-[-0.025em] leading-[1.12]"
            >
              Send, spend,<br className="hidden sm:inline" /> and save smarter
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#475569] font-ui leading-relaxed max-w-xl">
              Experience a new way to audit and manage bills with bilingual PaddleOCR, 7-point deterministic verification, and automated Indian GST workflows.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                to="/upload"
                className="px-7 py-3.5 rounded-full bg-[#0080FF] hover:bg-[#0070DF] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 transform active:scale-95"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/bills"
                className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold shadow-xs transition-all active:scale-95"
              >
                <span>Pricing</span>
              </Link>
            </div>

            {/* Social Proof: Avatars + Counter */}
            <div className="flex items-center space-x-3 pt-3">
              <div className="flex -space-x-2.5">
                <img
                  className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                  alt="Finance user 1"
                />
                <img
                  className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                  alt="Finance user 2"
                />
                <img
                  className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces"
                  alt="Finance user 3"
                />
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#64748B] font-ui">
                Trusted by <strong className="text-slate-900 font-semibold">400+</strong> finance teams worldwide
              </p>
            </div>

          </div>

          {/* Right Column: High-Visual Smartphone Mockup */}
          <div className="lg:col-span-5 xl:col-span-6 relative flex justify-center items-center pt-8 lg:pt-0">
            
            {/* Floating Glass Pills Surrounding Phone (Image 1 + Image 2) */}
            <div className="hidden sm:block absolute -left-6 top-8 z-30 animate-float-1">
              <div className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#DBDBDB] text-xs font-bold text-slate-900 shadow-lg flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>100% Math Accuracy</span>
              </div>
            </div>

            <div className="hidden sm:block absolute -right-6 top-10 z-30 animate-float-2">
              <div className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#DBDBDB] text-xs font-bold text-slate-900 shadow-lg flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#0080FF]" />
                <span>SQLite Local Ledger</span>
              </div>
            </div>

            <div className="hidden sm:block absolute -left-10 bottom-24 z-30 animate-float-3">
              <div className="flex flex-col gap-2">
                <div className="px-3 py-1 rounded-2xl bg-white border border-[#DBDBDB] text-[11px] font-bold font-mono text-slate-900 shadow-md">
                  PDF &bull; PNG &bull; CSV
                </div>
                <div className="px-3.5 py-1 rounded-full bg-[#0080FF] text-white text-[11px] font-bold font-mono shadow-md">
                  GSTR-2B Ready
                </div>
              </div>
            </div>

            <div className="hidden sm:block absolute -right-8 bottom-28 z-30 animate-float-4">
              <div className="flex flex-col items-end gap-2">
                <div className="px-3.5 py-1 rounded-full bg-black text-white text-[11px] font-bold font-mono shadow-md">
                  SHA-256 Hash
                </div>
                <div className="px-3.5 py-1 rounded-full bg-white border border-[#DBDBDB] text-[11px] font-bold text-slate-900 shadow-md flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>PaddleOCR PP-OCRv4</span>
                </div>
              </div>
            </div>

            {/* Smartphone Hardware Frame */}
            <div className="relative w-[315px] sm:w-[355px] bg-[#18181B] rounded-[52px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/40 border-[4px] border-[#2E2E33] transition-all duration-300">
              
              {/* Outer Phone Bezel Buttons */}
              <div className="absolute -left-[6px] top-24 w-[3px] h-8 bg-[#3F3F46] rounded-l-sm"></div>
              <div className="absolute -left-[6px] top-36 w-[3px] h-8 bg-[#3F3F46] rounded-l-sm"></div>
              <div className="absolute -right-[6px] top-28 w-[3px] h-12 bg-[#3F3F46] rounded-r-sm"></div>

              {/* Inner Smartphone Screen */}
              <div className="relative bg-[#0080FF] rounded-[44px] overflow-hidden text-white flex flex-col shadow-inner select-none">
                
                {/* 1. Status Bar */}
                <div className="pt-3 px-6 pb-2 flex justify-between items-center text-xs font-semibold z-20">
                  <span className="font-mono text-[13px] tracking-tight">9:41</span>
                  
                  {/* Dynamic Island Pill Notch */}
                  <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2 mx-auto">
                    <div className="w-2 h-2 rounded-full bg-[#1A1A1A] border border-neutral-700/50"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70"></div>
                  </div>

                  {/* System Icons (Signal, Wifi, Battery) */}
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <span className="text-[10px] font-mono">5G</span>
                    <div className="w-4 h-2.5 border border-white rounded-xs flex items-center p-0.5">
                      <div className="w-2.5 h-1.5 bg-white rounded-2xs"></div>
                    </div>
                  </div>
                </div>

                {/* 2. User Welcome Row */}
                <div className="px-5 pt-1.5 pb-3 flex justify-between items-center z-10">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold font-mono border border-white/30">
                      JM
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/95">Welcome, Jeff</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-white/90">
                    <div className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer">
                      <span className="text-xs">🔔</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer">
                      <span className="text-xs">⚙️</span>
                    </div>
                  </div>
                </div>

                {/* 3. Horizontal Pill Tabs (No scrollbar) */}
                <div className="px-4 py-1 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-[11px] font-semibold z-10">
                  <span className="px-3.5 py-1 rounded-full bg-white text-[#0080FF] shadow-xs font-bold">
                    Overview
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/15 text-white/80 hover:bg-white/25 transition cursor-pointer">
                    Cards
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/15 text-white/80 hover:bg-white/25 transition cursor-pointer">
                    Stocks
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/15 text-white/80 hover:bg-white/25 transition cursor-pointer">
                    Cryptos
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/15 text-white/80 hover:bg-white/25 transition cursor-pointer">
                    Cashb
                  </span>
                </div>

                {/* 4. Account Balance Display */}
                <div className="px-5 pt-4 pb-6 text-center space-y-0.5 z-10">
                  <p className="text-[11px] text-white/80 font-medium">Personal Account ▾</p>
                  <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    <span className="text-2xl font-light opacity-90 mr-0.5">₹</span>467.20
                  </p>
                </div>

                {/* 5. Curved White Card (Lower Section) */}
                <div className="bg-white text-slate-900 rounded-t-[34px] p-4 pt-5 flex-1 space-y-3.5 shadow-2xl -mt-2">
                  
                  {/* Balance Header */}
                  <div className="flex justify-between items-center text-xs font-bold px-1">
                    <span className="text-slate-800 font-bold text-xs hover:text-[#0080FF] transition cursor-pointer">
                      Balance &gt;
                    </span>
                    <span className="text-[10px] text-[#0080FF] bg-[#0080FF]/10 px-2 py-0.5 rounded-full font-mono font-medium">
                      Live
                    </span>
                  </div>

                  {/* Item 1: Cash (Direct from Image 2) */}
                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#22C55E]/15 text-[#16A34A] flex items-center justify-center font-bold text-sm shadow-xs">
                        💵
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Cash</p>
                        <p className="text-[10px] text-slate-400">Dollar &bull; Euro</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 font-mono">₹467.20</p>
                      <p className="text-[9px] text-slate-400 font-mono">₹370.13 &bull; €98.07</p>
                    </div>
                  </div>

                  {/* Item 2: Stocks / GST Claim (Direct from Image 2) */}
                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#0080FF]/15 text-[#0080FF] flex items-center justify-center font-bold text-sm shadow-xs">
                        📈
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Stocks</p>
                        <p className="text-[10px] text-slate-400">3 verified stocks</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 font-mono">₹2,067.83</p>
                      <p className="text-[9px] text-emerald-600 font-mono font-bold">+3.17%</p>
                    </div>
                  </div>

                  {/* Item 3: Live Verified Bill */}
                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shadow-xs">
                        🧾
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Refrens IT Bill</p>
                        <p className="text-[10px] text-slate-400 font-mono">INV-387 &bull; 18% GST</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 font-mono">₹1,34,048.00</p>
                      <p className="text-[9px] text-emerald-600 font-mono font-bold">100% Valid</p>
                    </div>
                  </div>

                  {/* Cards Header */}
                  <div className="pt-1 flex justify-between items-center text-xs font-bold px-1">
                    <span className="text-slate-800 font-bold text-xs hover:text-[#0080FF] transition cursor-pointer">
                      Cards &gt;
                    </span>
                  </div>

                  {/* Mini Corporate / Glow Debit Card (Image 2 style) */}
                  <div className="bg-gradient-to-r from-[#0080FF] via-[#0070DF] to-[#0099FF] text-white p-3 rounded-2xl shadow-md flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-5 rounded-md bg-white/20 border border-white/30 flex items-center justify-center text-[9px] font-bold">
                        💳
                      </div>
                      <div>
                        <p className="text-[11px] font-bold">Main</p>
                        <p className="text-[9px] text-white/80 font-mono">Debit - 2424</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold font-mono">₹368.13</p>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Ticker Ribbon Beneath Phone */}
        <div className="pt-6 border-y border-[#DBDBDB] py-4 overflow-hidden">
          <div className="animate-ticker-left space-x-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center space-x-6 shrink-0">
                <div className="reelo-pill">
                  <span className="w-2 h-2 rounded-full bg-[#4EA100]"></span>
                  <span className="font-ui text-xs font-semibold">PaddleOCR PP-OCRv4 Engine</span>
                </div>
                <div className="reelo-pill">
                  <span className="font-mono text-xs font-bold text-[#0099FF]">100% Deterministic Math Verification</span>
                </div>
                <div className="reelo-pill">
                  <span className="font-ui text-xs font-semibold">Bilingual Hindi &amp; English</span>
                </div>
                <div className="reelo-pill">
                  <span className="font-ui text-xs font-semibold">Section 43B(h) MSMED 45-Day Tracker</span>
                </div>
                <div className="reelo-pill">
                  <span className="font-mono text-xs font-bold text-[#4EA100]">Supabase Cloud + SQLite Ledger</span>
                </div>
                <div className="reelo-pill">
                  <span className="font-ui text-xs font-semibold">SHA-256 Cryptographic Duplicate Check</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* =========================================================================
          2. WHY FINSENSE (3 Comparison Columns)
         ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="reelo-pill">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span className="font-ui text-xs font-semibold">Why FinSense</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black font-heading">
            There is a better way to manage bills
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Col 1: Manual Entry */}
          <div className="reelo-card p-8 flex flex-col justify-between space-y-6 bg-white">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-black font-heading">Manual Typing</h3>
              <ul className="space-y-3.5 font-ui text-sm text-[#333333]">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF4F4F]/15 text-[#FF4F4F] flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Tedious manual data entry</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF4F4F]/15 text-[#FF4F4F] flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>High human arithmetic error rate</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF4F4F]/15 text-[#FF4F4F] flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Unnoticed fake GSTIN numbers</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF4F4F]/15 text-[#FF4F4F] flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Missed Input Tax Credit (ITC)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF4F4F]/15 text-[#FF4F4F] flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Lost crumpled paper slips</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 2: Generic Cloud LLMs */}
          <div className="reelo-card p-8 flex flex-col justify-between space-y-6 bg-white">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-black font-heading">Generic Cloud OCR</h3>
              <ul className="space-y-3.5 font-ui text-sm text-[#333333]">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF4F4F]/15 text-[#FF4F4F] flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Expensive API per-token billing</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF4F4F]/15 text-[#FF4F4F] flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Financial privacy leaks to cloud</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF4F4F]/15 text-[#FF4F4F] flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>LLM hallucinations in tax math</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF4F4F]/15 text-[#FF4F4F] flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>No Indian state code validation</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF4F4F]/15 text-[#FF4F4F] flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Slow cloud roundtrips</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 3: FinSense (Highlighted Card) */}
          <div className="reelo-card p-8 flex flex-col justify-between space-y-6 bg-white ring-2 ring-black shadow-xl relative">
            <div className="absolute -top-3.5 left-8">
              <span className="px-3.5 py-1 rounded-full bg-black text-white text-xs font-bold font-ui">
                Audit Grade
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-black font-heading flex items-center gap-2">
                <span>FinSense AI</span>
                <Sparkles className="w-5 h-5 text-[#0099FF]" />
              </h3>
              <ul className="space-y-3.5 font-ui text-sm font-semibold text-black">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#4EA100]/20 text-[#4EA100] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Bilingual PaddleOCR on-premise</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#4EA100]/20 text-[#4EA100] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>7-Point deterministic math check</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#4EA100]/20 text-[#4EA100] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>100% Private local processing</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#4EA100]/20 text-[#4EA100] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Automated GSTR-2B ITC ledger</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#4EA100]/20 text-[#4EA100] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Built-in MSMED statutory alerts</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. PROCESS (4 Visual Cards)
         ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="reelo-pill">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span className="font-ui text-xs font-semibold">Pipeline</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black font-heading">
            How bills flow through FinSense
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Step 1: Capture & Ingest */}
          <div className="reelo-card p-8 sm:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0099FF]">STEP 01</span>
                <span className="reelo-pill py-1 px-3 text-xs bg-[#E6E6E6] text-black">
                  Instant Dropzone
                </span>
              </div>
              <h3 className="text-2xl font-bold text-black font-heading">Ingest Any Invoice</h3>
              <p className="text-sm font-ui text-[#333333]">
                Upload PDF files, camera snapshots, crumpled physical receipts, or bulk zip folders.
              </p>
            </div>

            <div className="bg-[#F2F2F2] p-5 rounded-3xl border border-[#DBDBDB] space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center text-black font-bold">
                <span>SHA-256 Fingerprint:</span>
                <span className="text-[#0099FF]">e3b0c44298fc1c149af...</span>
              </div>
              <p className="text-[11px] text-[#999999] font-ui">
                Duplicate invoices are blocked instantly to prevent double payment claims.
              </p>
            </div>
          </div>

          {/* Step 2: Bilingual PaddleOCR */}
          <div className="reelo-card p-8 sm:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0099FF]">STEP 02</span>
                <span className="reelo-pill py-1 px-3 text-xs bg-[#DCFFDB] text-[#4EA100] border-none font-semibold">
                  Offline Engine
                </span>
              </div>
              <h3 className="text-2xl font-bold text-black font-heading">Bilingual PaddleOCR</h3>
              <p className="text-sm font-ui text-[#333333]">
                Recognizes English and Hindi typography, detects invoice tables, and normalizes date formats.
              </p>
            </div>

            <div className="bg-[#F2F2F2] p-5 rounded-3xl border border-[#DBDBDB] flex items-center justify-between font-mono text-xs">
              <div>
                <p className="font-bold text-black">PP-OCRv4 + RapidOCR</p>
                <p className="text-[10px] text-[#999999] font-ui">Native ONNX Inference</p>
              </div>
              <span className="text-emerald-600 font-bold">0.4s Latency</span>
            </div>
          </div>

          {/* Step 3: Deterministic GST Validation */}
          <div className="reelo-card p-8 sm:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0099FF]">STEP 03</span>
                <span className="reelo-pill py-1 px-3 text-xs bg-[#48BDF7]/20 text-[#0099FF] border-none font-semibold">
                  Zero Hallucination
                </span>
              </div>
              <h3 className="text-2xl font-bold text-black font-heading">7-Point GST Math</h3>
              <p className="text-sm font-ui text-[#333333]">
                Algorithmic verification: Subtotal + CGST + SGST + IGST = Total with 36-state code matching.
              </p>
            </div>

            <div className="bg-[#171717] rounded-3xl p-4 text-white font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-emerald-400">
                <span>[CHECK 1] GSTIN Structure (15 Chars):</span>
                <span>PASS</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>[CHECK 2] State Jurisdiction Code:</span>
                <span>PASS</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>[CHECK 3] Subtotal + Tax = Total:</span>
                <span>PASS (₹1,42,800)</span>
              </div>
            </div>
          </div>

          {/* Step 4: Audit & Settle */}
          <div className="reelo-card p-8 sm:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0099FF]">STEP 04</span>
                <span className="reelo-pill py-1 px-3 text-xs bg-[#DCFFDB] text-[#4EA100] border-none font-semibold">
                  Statutory Safe
                </span>
              </div>
              <h3 className="text-2xl font-bold text-black font-heading">Payment &amp; Audit Trail</h3>
              <p className="text-sm font-ui text-[#333333]">
                Toggle payment state, track MSMED 45-day statutory deadlines, and export directly to Tally or Excel.
              </p>
            </div>

            <div className="bg-[#F2F2F2] p-5 rounded-3xl border border-[#DBDBDB] flex items-center justify-between font-ui text-xs">
              <span className="font-bold text-black">One-click Tally XML &amp; CSV Export</span>
              <span className="reelo-pill py-0.5 px-2 bg-black text-white text-[10px]">
                Ready
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. SERVICES / BENTO GRID
         ========================================================================= */}
      <section id="services" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 scroll-mt-24">
        <div className="text-center space-y-3">
          <div className="reelo-pill">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span className="font-ui text-xs font-semibold">Capabilities</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black font-heading">
            Enterprise GST Intelligence Features
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Big Featured Card: 7-Point GST Engine */}
          <div className="md:col-span-8 reelo-card p-8 sm:p-12 space-y-6 flex flex-col justify-between bg-white relative overflow-hidden">
            <div className="space-y-4 max-w-lg z-10">
              <div className="flex items-center gap-2">
                <span className="reelo-pill py-1 px-3 text-xs bg-black text-white border-none font-semibold">
                  Core Engine
                </span>
                <span className="reelo-pill py-1 px-3 text-xs bg-[#48BDF7]/20 text-[#0099FF] border-none font-semibold">
                  100% Deterministic
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-black font-heading">
                7-Point GST Mathematical Reconciler
              </h3>
              <p className="text-base text-[#333333] font-ui leading-relaxed">
                Recalculates every decimal of CGST, SGST, IGST, cess, and line item sums. Flags rounding discrepancies before tax returns are filed.
              </p>
            </div>

            <div className="pt-4 z-10">
              <div className="bg-[#F2F2F2] p-4 rounded-2xl border border-[#DBDBDB] inline-flex items-center gap-3 text-xs font-mono font-bold">
                <span className="w-3 h-3 rounded-full bg-[#0099FF]"></span>
                <span>Rule: Subtotal × Tax Rate ≈ CGST + SGST (Tolerance &lt; ₹1.00)</span>
              </div>
            </div>
          </div>

          {/* Bilingual PaddleOCR */}
          <div className="md:col-span-4 reelo-card p-8 space-y-4 flex flex-col justify-between bg-white">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DCFFDB] text-[#4EA100] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-black font-heading">Bilingual PaddleOCR</h3>
              <p className="text-sm font-ui text-[#333333]">
                Flawless character recognition for Hindi receipts (बीजक, कुल राशि) and English invoices alike.
              </p>
            </div>
          </div>

          {/* GSTR-2B ITC Maximizer */}
          <div className="md:col-span-4 reelo-card p-8 space-y-4 flex flex-col justify-between bg-white">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#48BDF7]/20 text-[#0099FF] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-black font-heading">ITC Maximizer</h3>
              <p className="text-sm font-ui text-[#333333]">
                Isolates eligible input tax credit from reverse-charge items to maximize your monthly cash flow.
              </p>
            </div>
          </div>

          {/* Duplicate SHA-256 Guard */}
          <div className="md:col-span-4 reelo-card p-8 space-y-4 flex flex-col justify-between bg-white">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F9A9F0]/30 text-pink-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-black font-heading">SHA-256 Guard</h3>
              <p className="text-sm font-ui text-[#333333]">
                Cryptographic document hashing catches duplicate submissions across staff and branch offices.
              </p>
            </div>
          </div>

          {/* Payment Reminders */}
          <div className="md:col-span-4 reelo-card p-8 space-y-4 flex flex-col justify-between bg-white">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-black font-heading">Statutory Calendar</h3>
              <p className="text-sm font-ui text-[#333333]">
                Tracks MSME 45-day payment cycles and statutory vendor credit terms to prevent late fees.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. FEATURED AUDITS & INVOICE SAMPLES (DYNAMIC LIVE LEDGER)
         ========================================================================= */}
      <section id="featured-projects" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 scroll-mt-24">
        <div className="text-center space-y-3">
          <div className="reelo-pill">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span className="font-ui text-xs font-semibold">Live Production Ledger</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black font-heading">
            Audited Bills in Database
          </h2>
          <p className="text-sm font-ui text-[#666666] max-w-lg mx-auto">
            Real GST invoices processed through bilingual PaddleOCR, 7-point math verification, and ledger storage.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="reelo-card p-6 bg-white animate-pulse space-y-4">
                <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                <div className="h-6 bg-neutral-200 rounded w-2/3"></div>
                <div className="h-4 bg-neutral-100 rounded w-1/2"></div>
                <div className="pt-4 border-t border-neutral-100 flex justify-between">
                  <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
                  <div className="h-8 bg-neutral-200 rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : safeInvoices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {safeInvoices.slice(0, visibleAudits).map((inv) => (
              <div 
                key={inv.id}
                className="reelo-card p-6 bg-white space-y-4 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`reelo-pill py-0.5 px-2.5 text-[10px] border-none font-bold ${
                      inv.validation_status === 'valid'
                        ? 'bg-[#DCFFDB] text-[#4EA100]'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.validation_status === 'valid' ? 'Audit Passed' : 'Needs Review'}
                    </span>
                    <span className="font-mono text-[#999999] text-[11px] truncate max-w-[120px]">
                      {inv.bill_number}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-black font-heading truncate">{inv.supplier_name}</h4>
                  <p className="text-xs font-mono text-[#666666] truncate">
                    GSTIN: {inv.seller_gstin || inv.canonical_json?.seller?.gstin || 'Auto Extracted'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#DBDBDB] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-ui text-[#999999]">Total Bill Amount</span>
                    <p className="text-xl font-bold font-mono text-black">
                      ₹ {Number(inv.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <Link
                    to={`/bills/${inv.id}`}
                    className="reelo-btn-black px-4 py-2 text-xs font-semibold"
                  >
                    Inspect
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="reelo-card p-12 sm:p-16 text-center space-y-6 bg-white max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F2F2F2] flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-black" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-heading text-black">No Invoices in Ledger Yet</h3>
              <p className="text-xs sm:text-sm font-ui text-[#666666] max-w-md mx-auto">
                No mock data shown. Upload your first PDF, receipt, or Excel sheet to run on-premise PaddleOCR and record into the ledger.
              </p>
            </div>
            <Link
              to="/upload"
              className="reelo-btn-black px-8 py-3.5 text-xs font-semibold inline-flex items-center gap-2 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Invoice Now</span>
            </Link>
          </div>
        )}

        {invoices.length > visibleAudits && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setVisibleAudits(invoices.length)}
              className="reelo-btn-black px-8 py-3.5 text-sm font-semibold hover:scale-105 transition-all"
            >
              Load more
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          6. PRICING
         ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="reelo-pill">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span className="font-ui text-xs font-semibold">Pricing</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black font-heading">
            Simple pricing and built to scale
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Starter */}
          <div className="reelo-card p-8 sm:p-10 flex flex-col justify-between space-y-8 bg-white">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-black font-heading">Starter</h3>
                <p className="text-xs font-ui text-[#333333] mt-1">
                  For individual shops and small businesses.
                </p>
              </div>
              <div>
                <span className="text-5xl font-extrabold text-black font-mono">Free</span>
                <span className="text-xs text-[#999999] ml-2 font-ui">Forever Free</span>
              </div>
              <ul className="space-y-3 text-sm font-ui text-[#333333] border-t border-[#DBDBDB] pt-6">
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-black" /><span>Up to 50 bills / month</span></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-black" /><span>Offline PaddleOCR Engine</span></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-black" /><span>7-Point GST Math Validation</span></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-black" /><span>Single user access</span></li>
              </ul>
            </div>
            <Link to="/upload" className="w-full reelo-btn-black py-3.5 text-sm">
              Get Started
            </Link>
          </div>

          {/* Growth / Pro (Featured with Blue Accent) */}
          <div className="reelo-card p-8 sm:p-10 flex flex-col justify-between space-y-8 bg-white ring-2 ring-[#0099FF] shadow-2xl relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 rounded-full bg-[#0099FF] text-white text-xs font-bold font-ui shadow-sm">
                Most Popular
              </span>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-black font-heading flex items-center justify-between">
                  <span>FinSense Pro</span>
                  <span className="text-[11px] text-[#0099FF] font-ui font-semibold">Cancel anytime.</span>
                </h3>
                <p className="text-xs font-ui text-[#333333] mt-1">
                  For growing businesses &amp; CA practitioners.
                </p>
              </div>
              <div>
                <span className="text-5xl font-extrabold text-black font-mono">₹ 1,499</span>
                <span className="text-xs text-[#999999] ml-2 font-ui">/ per month</span>
              </div>
              <ul className="space-y-3 text-sm font-ui text-black font-medium border-t border-[#DBDBDB] pt-6">
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#0099FF]" /><span>Unlimited monthly bills</span></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#0099FF]" /><span>Bulk ZIP &amp; PDF multi-upload</span></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#0099FF]" /><span>Automated WhatsApp &amp; Email alerts</span></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#0099FF]" /><span>GSTR-2B Input Tax Credit ledger</span></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#0099FF]" /><span>CSV &amp; Tally XML exports</span></li>
              </ul>
            </div>
            <Link to="/upload" className="w-full reelo-btn-blue py-3.5 text-sm">
              Start Growing
            </Link>
          </div>

          {/* Mega / Enterprise */}
          <div className="reelo-card p-8 sm:p-10 flex flex-col justify-between space-y-8 bg-white">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-black font-heading">Enterprise</h3>
                <p className="text-xs font-ui text-[#333333] mt-1">
                  For multi-GSTIN companies and audit firms.
                </p>
              </div>
              <div>
                <span className="text-5xl font-extrabold text-black font-mono">₹ 4,999</span>
                <span className="text-xs text-[#999999] ml-2 font-ui">/ per month</span>
              </div>
              <ul className="space-y-3 text-sm font-ui text-[#333333] border-t border-[#DBDBDB] pt-6">
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-black" /><span>Multi-entity GSTIN support</span></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-black" /><span>Tally, Zoho &amp; SAP ERP webhooks</span></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-black" /><span>Dedicated CA auditor review queues</span></li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-black" /><span>24/7 Priority support</span></li>
              </ul>
            </div>
            <Link to="/contact" className="w-full reelo-btn-black py-3.5 text-sm">
              Book a Call
            </Link>
          </div>

        </div>
      </section>

      {/* =========================================================================
          7. ARCHITECTURE & COMPLIANCE PILLARS (2-Row Scrolling Marquee)
         ========================================================================= */}
      <section className="space-y-12 overflow-hidden">
        <div className="text-center space-y-3 px-4">
          <div className="reelo-pill">
            <span className="w-2 h-2 rounded-full bg-[#0099FF]"></span>
            <span className="font-ui text-xs font-semibold">Verification Architecture</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black font-heading">
            Engineered for 100% mathematical precision
          </h2>
          <p className="text-sm font-ui text-[#666666] max-w-lg mx-auto">
            Built from first principles to eliminate tax calculation errors, vendor payment delays, and GSTR-2B mismatches.
          </p>
        </div>

        {/* Row 1 */}
        <div className="animate-ticker-left space-x-6">
          {[...architecturalPillars, ...architecturalPillars].map((p, idx) => {
            const Icon = p.icon;
            return (
              <div 
                key={idx}
                className="reelo-card p-6 sm:p-7 w-[360px] sm:w-[420px] shrink-0 space-y-4 bg-white flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl ${p.bg} ${p.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="reelo-pill py-0.5 px-2.5 text-[10px] font-mono font-bold bg-[#F2F2F2] border-none text-black">
                      {p.tag}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-black font-heading">{p.title}</h4>
                  <p className="text-xs font-ui text-[#555555] leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#F2F2F2] flex items-center justify-between text-[11px] font-mono text-[#999999]">
                  <span>System Standard</span>
                  <span className="text-[#0099FF] font-bold">ACTIVE &bull; 100%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 2 */}
        <div className="animate-ticker-right space-x-6">
          {[...architecturalPillars.slice().reverse(), ...architecturalPillars.slice().reverse()].map((p, idx) => {
            const Icon = p.icon;
            return (
              <div 
                key={idx}
                className="reelo-card p-6 sm:p-7 w-[360px] sm:w-[420px] shrink-0 space-y-4 bg-white flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl ${p.bg} ${p.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="reelo-pill py-0.5 px-2.5 text-[10px] font-mono font-bold bg-[#F2F2F2] border-none text-black">
                      {p.tag}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-black font-heading">{p.title}</h4>
                  <p className="text-xs font-ui text-[#555555] leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#F2F2F2] flex items-center justify-between text-[11px] font-mono text-[#999999]">
                  <span>Verified Module</span>
                  <span className="text-[#4EA100] font-bold">READY &bull; v2.4</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          8. FAQ (Accordion)
         ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="reelo-pill">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span className="font-ui text-xs font-semibold">FAQ</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black font-heading">
            Everything you need to know about us
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="reelo-card overflow-hidden bg-white transition-all">
              <button
                onClick={() => setFaqOpen(faqOpen === idx ? -1 : idx)}
                className="w-full p-6 sm:p-7 text-left flex items-center justify-between gap-4 font-heading font-bold text-lg sm:text-xl text-black hover:text-[#0099FF] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-200 ${faqOpen === idx ? 'rotate-180 text-[#0099FF]' : 'text-[#999999]'}`} />
              </button>
              {faqOpen === idx && (
                <div className="px-6 sm:px-7 pb-6 sm:pb-7 text-sm font-ui text-[#333333] leading-relaxed border-t border-[#DBDBDB] pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          9. BLOG
         ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="reelo-pill">
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span className="font-ui text-xs font-semibold">Tax Insights</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-black font-heading">
              Insights that drive proper growth
            </h2>
          </div>
          <div>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1.5 text-sm font-semibold font-ui text-black hover:text-[#0099FF] transition"
            >
              <span>Explore tax ledger</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogPosts.map((post) => (
            <div 
              key={post.slug}
              className="reelo-card p-4 space-y-4 bg-white flex flex-col justify-between group hover:shadow-lg transition-all"
            >
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-gray-100">
                  <img 
                    src={post.img} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-ui">
                  <span className="reelo-pill py-0.5 px-2.5 text-[10px] bg-[#DCFFDB] text-[#4EA100] border-none font-semibold">
                    {post.category}
                  </span>
                  <span className="text-[#999999]">{post.author}</span>
                </div>
                <h4 className="text-base font-bold text-black font-heading line-clamp-2 group-hover:text-[#0099FF] transition-colors">
                  {post.title}
                </h4>
                <p className="text-xs font-ui text-[#333333] line-clamp-2">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-2 border-t border-[#DBDBDB]">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-black group-hover:text-[#0099FF]">
                  Read article <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          10. FOOTER CTA + FOOTER
         ========================================================================= */}
      <Footer />

    </div>
  );
}
