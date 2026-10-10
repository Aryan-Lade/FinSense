import React, { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import Footer from '../components/Footer';

export default function Home() {
  const [visibleAudits, setVisibleAudits] = useState(3);
  const [faqOpen, setFaqOpen] = useState(0);

  const audits = [
    {
      id: 1,
      supplier: 'Reliance Retail Ltd',
      gstin: '27AABCR2026A1Z5',
      amount: '₹ 1,42,800',
      state: 'Maharashtra (27)',
      status: 'ITC Verified · Passed',
      img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=1000&fit=crop'
    },
    {
      id: 2,
      supplier: 'Tata Power Company Ltd',
      gstin: '07AAACT2727Q1ZT',
      amount: '₹ 84,250',
      state: 'Delhi (07)',
      status: 'Reverse Charge Match',
      img: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&h=1000&fit=crop'
    },
    {
      id: 3,
      supplier: 'Infosys Hardware Supplies',
      gstin: '29AAACI4400E1Z3',
      amount: '₹ 3,19,400',
      state: 'Karnataka (29)',
      status: 'Inter-State IGST Pass',
      img: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&h=1000&fit=crop'
    },
    {
      id: 4,
      supplier: 'Titan Industrial Works',
      gstin: '33AAACT0822K1ZK',
      amount: '₹ 56,000',
      state: 'Tamil Nadu (33)',
      status: 'Bilingual Hindi OCR',
      img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=1000&fit=crop'
    },
    {
      id: 5,
      supplier: 'Apollo Logistics & Healthcare',
      gstin: '36AAACA1111N1ZG',
      amount: '₹ 92,100',
      state: 'Telangana (36)',
      status: 'MSMED 45-Day Tracked',
      img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=1000&fit=crop'
    },
    {
      id: 6,
      supplier: 'Delhi Metro Construction Tech',
      gstin: '07AAACD9900M1ZL',
      amount: '₹ 4,75,000',
      state: 'Delhi (07)',
      status: 'Audit Trail Encrypted',
      img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=1000&fit=crop'
    }
  ];

  const testimonials = [
    {
      quote: "FinSense saved our firm over ₹4.2 Lakhs in ineligible ITC claims in our very first quarterly audit.",
      name: "CA Rajesh Singhania",
      role: "Senior Partner, Singhania & Associates",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face"
    },
    {
      quote: "The deterministic GST verification is a game changer. No hallucinations, pure mathematical accuracy.",
      name: "Pooja Varma",
      role: "Head of Accounts, Varma Traders",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face"
    },
    {
      quote: "Bilingual PaddleOCR reads crumpled paper bills in both Hindi and English flawlessly on our local server.",
      name: "Amitabh Sen",
      role: "CFO, Apex LogiTech India",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face"
    },
    {
      quote: "Reconciliation time dropped from 3 days to under 15 minutes. Our vendor payment friction is completely gone.",
      name: "Sunita Deshmukh",
      role: "Tax Director, Horizon Enterprises",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face"
    },
    {
      quote: "The MSMED 45-day payment reminder prevents statutory interest liabilities before our auditors even notice.",
      name: "Karan Johar",
      role: "Financial Controller, Zen Retail",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face"
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
      q: "Can I claim Input Tax Credit (ITC) with FinSense?",
      a: "Yes. FinSense cross-checks supplier GSTIN formats, active state jurisdiction codes, and computes eligible ITC breakdowns so your tax team can reconcile GSTR-2B with zero friction."
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
          1. HERO SECTION
         ========================================================================= */}
      <section className="pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        
        {/* Pill Tag */}
        <div className="flex justify-center">
          <div className="reelo-pill shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0099FF] animate-pulse"></span>
            <span className="font-ui text-xs font-semibold tracking-wide">
              AI GST &amp; Bill Intelligence
            </span>
          </div>
        </div>

        {/* H1 Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-black max-w-5xl mx-auto leading-[0.98] font-heading">
          Invoices That Reconcile Every Single Time
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#333333] max-w-2xl mx-auto font-ui leading-relaxed">
          FinSense turns messy invoices into validated, audit-friendly financial records using bilingual PaddleOCR, 7-point deterministic verification, and automated payment workflows.
        </p>

        {/* Dual CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/upload"
            className="reelo-btn-black px-8 py-4 text-base font-semibold shadow-md hover:scale-105 transition-all gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Invoice Now</span>
          </Link>
          <Link
            to="/bills"
            className="reelo-btn-white px-8 py-4 text-base font-semibold hover:scale-105 transition-all"
          >
            <span>View All Bills</span>
          </Link>
        </div>

        {/* Center Visual: Black Phone Mockup + Notch + Floating Stat Badges */}
        <div className="relative pt-12 pb-6 max-w-4xl mx-auto flex justify-center items-center">
          
          {/* Floating Stat Pills (Surrounding Phone) */}
          <div className="hidden lg:block absolute left-4 top-20 z-20">
            <div className="reelo-pill shadow-md border border-[#DBDBDB] animate-bounce duration-1000">
              <ShieldCheck className="w-4 h-4 text-[#4EA100]" />
              <span className="font-mono text-xs font-bold">100% Math Accuracy</span>
            </div>
          </div>

          <div className="hidden lg:block absolute left-0 bottom-28 z-20">
            <div className="reelo-pill shadow-md border border-[#DBDBDB]">
              <TrendingUp className="w-4 h-4 text-[#0099FF]" />
              <span className="font-ui text-xs font-semibold">₹2,46,720 Settled</span>
            </div>
          </div>

          <div className="hidden lg:block absolute right-8 top-16 z-20">
            <div className="reelo-pill shadow-md border border-[#DBDBDB]">
              <span className="w-2 h-2 rounded-full bg-[#4EA100]"></span>
              <span className="font-mono text-xs font-bold">7-Point GST Check</span>
            </div>
          </div>

          <div className="hidden lg:block absolute right-2 bottom-36 z-20">
            <div className="reelo-pill shadow-md border border-[#DBDBDB]">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="font-ui text-xs font-semibold">PaddleOCR Bilingual</span>
            </div>
          </div>

          {/* Platform Badges (Left & Right Flanking) */}
          <div className="hidden sm:flex flex-col gap-3 absolute -left-8 top-1/2 -translate-y-1/2 z-10 text-xs font-bold font-mono">
            <div className="px-3 py-2 rounded-2xl bg-white border border-[#DBDBDB] text-black shadow-lg transform -rotate-6">
              PDF Vector
            </div>
            <div className="px-3 py-2 rounded-2xl bg-[#0099FF] text-white shadow-lg transform rotate-3">
              GSTR-2B Ready
            </div>
          </div>

          <div className="hidden sm:flex flex-col gap-3 absolute -right-8 top-1/2 -translate-y-1/2 z-10 text-xs font-bold font-mono">
            <div className="px-3 py-2 rounded-2xl bg-[#171717] text-white shadow-lg transform rotate-6">
              SHA-256 Hash
            </div>
          </div>

          {/* Black Phone Mockup */}
          <div className="relative w-[280px] sm:w-[320px] bg-black rounded-[54px] p-3.5 shadow-2xl ring-1 ring-black/10">
            
            {/* Inner Phone Screen */}
            <div className="relative bg-[#171717] rounded-[44px] overflow-hidden aspect-[9/18] text-white flex flex-col justify-between">
              
              {/* Dynamic Island Notch */}
              <div className="w-28 h-6 bg-black rounded-full mx-auto mt-2.5 flex items-center justify-end px-2 z-30">
                <div className="w-2.5 h-2.5 rounded-full bg-[#262626]"></div>
              </div>

              {/* Scanned Invoice UI Container */}
              <div className="absolute inset-0 z-0 overflow-hidden flex flex-col justify-between p-4 pt-12">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 space-y-2 border border-white/20 text-left">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#0099FF] font-bold">INV-2026-0891</span>
                    <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                  </div>
                  <p className="text-xs font-bold">Reliance Retail Ltd</p>
                  <p className="text-[10px] text-white/70 font-mono">GSTIN: 27AABCR2026A1Z5</p>
                  
                  <div className="border-t border-white/10 pt-2 grid grid-cols-2 gap-1 text-[10px] font-mono">
                    <div>
                      <span className="text-white/60">Subtotal:</span>
                      <p className="font-bold">₹ 1,21,017</p>
                    </div>
                    <div>
                      <span className="text-white/60">CGST+SGST:</span>
                      <p className="font-bold text-amber-300">₹ 21,783</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/80 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-left space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-ui text-[10px] text-white/70">Total Reconciled:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">₹ 1,42,800.00</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#0099FF] h-full w-full"></div>
                  </div>
                  <p className="text-[9px] text-white/60 font-mono">Deterministic Match • 0 Errors</p>
                </div>
              </div>

              {/* Laser scanning beam animation overlay */}
              <div className="absolute top-10 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#0099FF] to-transparent animate-scan-line pointer-events-none z-20"></div>

              {/* Reel Mockup Overlay details */}
              <div className="relative z-10 p-3 mt-auto text-left">
                <div className="flex items-center justify-between text-[10px] text-white/70">
                  <span>PaddleOCR Engine v4</span>
                  <span className="font-mono text-emerald-400 font-bold">0.4s Latency</span>
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
                  <span className="font-ui text-xs font-semibold">₹35Cr+ Invoices Verified</span>
                </div>
                <div className="reelo-pill">
                  <span className="font-mono text-xs font-bold text-[#0099FF]">99.98% GST Math Accuracy</span>
                </div>
                <div className="reelo-pill">
                  <span className="font-ui text-xs font-semibold">0.4s PaddleOCR Latency</span>
                </div>
                <div className="reelo-pill">
                  <span className="font-ui text-xs font-semibold">36 Indian State Codes</span>
                </div>
                <div className="reelo-pill">
                  <span className="font-mono text-xs font-bold text-[#4EA100]">100% Deterministic Rules</span>
                </div>
                <div className="reelo-pill">
                  <span className="font-ui text-xs font-semibold">400+ Chartered Accountants</span>
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
          5. FEATURED AUDITS & INVOICE SAMPLES
         ========================================================================= */}
      <section id="featured-projects" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 scroll-mt-24">
        <div className="text-center space-y-3">
          <div className="reelo-pill">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span className="font-ui text-xs font-semibold">Live Ledger</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black font-heading">
            Audited Bills in Production
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {audits.slice(0, visibleAudits).map((a) => (
            <div 
              key={a.id}
              className="reelo-card p-6 bg-white space-y-4 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="reelo-pill py-0.5 px-2.5 text-[10px] bg-[#DCFFDB] text-[#4EA100] border-none font-bold">
                    {a.status}
                  </span>
                  <span className="font-mono text-[#999999]">{a.state}</span>
                </div>
                <h4 className="text-xl font-bold text-black font-heading">{a.supplier}</h4>
                <p className="text-xs font-mono text-[#333333]">{a.gstin}</p>
              </div>

              <div className="pt-4 border-t border-[#DBDBDB] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-ui text-[#999999]">Total Bill Amount</span>
                  <p className="text-xl font-bold font-mono text-black">{a.amount}</p>
                </div>
                <Link
                  to="/bills"
                  className="reelo-btn-black px-4 py-2 text-xs font-semibold"
                >
                  Inspect
                </Link>
              </div>
            </div>
          ))}
        </div>

        {visibleAudits < audits.length && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setVisibleAudits(audits.length)}
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
          7. TESTIMONIALS (2-Row Scrolling Marquee)
         ========================================================================= */}
      <section className="space-y-12 overflow-hidden">
        <div className="text-center space-y-3 px-4">
          <div className="reelo-pill">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span className="font-ui text-xs font-semibold">Testimonial</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black font-heading">
            Proof that our method works perfectly
          </h2>
        </div>

        {/* Row 1 */}
        <div className="animate-ticker-left space-x-6">
          {[...testimonials, ...testimonials].map((t, idx) => (
            <div 
              key={idx}
              className="reelo-card p-6 sm:p-7 w-[360px] sm:w-[420px] shrink-0 space-y-4 bg-white flex flex-col justify-between"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm font-ui text-[#333333] leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#DBDBDB]">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-sm font-bold text-black font-heading">{t.name}</h4>
                  <p className="text-xs text-[#999999] font-ui">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="animate-ticker-right space-x-6">
          {[...testimonials.slice().reverse(), ...testimonials.slice().reverse()].map((t, idx) => (
            <div 
              key={idx}
              className="reelo-card p-6 sm:p-7 w-[360px] sm:w-[420px] shrink-0 space-y-4 bg-white flex flex-col justify-between"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm font-ui text-[#333333] leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#DBDBDB]">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-sm font-bold text-black font-heading">{t.name}</h4>
                  <p className="text-xs text-[#999999] font-ui">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
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
