import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Star, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Footer from '../components/Footer';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const contactTestimonials = [
    {
      quote: "One idea turned into multiple high-performing videos. We scaled content without increasing workload.",
      name: "Jassie M.",
      audience: "1.02M Subscriber",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face"
    },
    {
      quote: "We improved watch time from around 40% to over 80%. That single change doubled our overall reach.",
      name: "Ajoy S.",
      audience: "20K Followers",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face"
    }
  ];

  return (
    <div className="space-y-24 pt-8 pb-12 overflow-hidden">
      
      {/* Header Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="reelo-pill">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span className="font-ui text-xs font-semibold">Contact</span>
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-black font-heading leading-tight">
          Get a free content growth audit
        </h1>

        <p className="text-base sm:text-lg text-[#333333] font-ui max-w-2xl mx-auto leading-relaxed">
          Actionable strategies, content breakdowns, and real-world lessons behind high-performing short-form content.
        </p>

        {/* Row of Stat Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
          <div className="reelo-pill py-1 px-3 text-xs bg-white">
            <span className="w-2 h-2 rounded-full bg-[#4EA100]"></span>
            <span>+2.4M Views Generated</span>
          </div>
          <div className="reelo-pill py-1 px-3 text-xs bg-white">
            <span>50+ Creators Scaled</span>
          </div>
          <div className="reelo-pill py-1 px-3 text-xs bg-white">
            <span>120+ Videos Produced</span>
          </div>
          <div className="reelo-pill py-1 px-3 text-xs bg-white">
            <span className="font-mono text-[#0099FF] font-bold">85% Avg Retention</span>
          </div>
          <div className="reelo-pill py-1 px-3 text-xs bg-white">
            <span>+20K Followers Gained</span>
          </div>
        </div>
      </section>

      {/* Main Form & Info Cards Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 reelo-card p-8 sm:p-12 space-y-6 bg-white">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#DCFFDB] text-[#4EA100] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-heading text-black">
                  Audit Request Received!
                </h3>
                <p className="text-sm font-ui text-[#333333] max-w-md mx-auto">
                  Thanks for reaching out! Our team will review your channel and deliver your custom growth blueprint within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="reelo-btn-black px-6 py-2.5 text-xs font-semibold"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 text-[#FF4F4F] text-xs font-medium rounded-xl border border-red-200">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5 font-ui">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-[#DBDBDB] bg-[#F2F2F2] text-sm text-black focus:outline-none focus:border-black focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 font-ui">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-[#DBDBDB] bg-[#F2F2F2] text-sm text-black focus:outline-none focus:border-black focus:bg-white transition"
                    />
                  </div>
                  <div className="space-y-1.5 font-ui">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 rounded-2xl border border-[#DBDBDB] bg-[#F2F2F2] text-sm text-black focus:outline-none focus:border-black focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 font-ui">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">
                    Message / Channel Links
                  </label>
                  <textarea
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your channels, audience goals, or video volume..."
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-[#DBDBDB] bg-[#F2F2F2] text-sm text-black focus:outline-none focus:border-black focus:bg-white transition"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full reelo-btn-black py-4 text-base font-semibold shadow-md hover:scale-[1.01] transition-all"
                >
                  Submit
                </button>

                {/* Micro Steps under Form */}
                <div className="pt-2 text-center text-xs font-ui text-[#999999]">
                  Review your content —&gt; Identify bottlenecks —&gt; Send you a custom plan
                </div>
              </form>
            )}
          </div>

          {/* Right Column: 3 Contact Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Card 1: Book a Call */}
            <div className="reelo-card p-6 sm:p-7 space-y-2 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#999999] font-ui">
                    Book a Call
                  </h4>
                  <p className="text-base font-bold text-black font-mono">
                    +880 1321 345 134
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Message Us */}
            <div className="reelo-card p-6 sm:p-7 space-y-2 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0099FF] text-white flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#999999] font-ui">
                    Message Us
                  </h4>
                  <a 
                    href="mailto:ajoy.sayhello@gmail.com" 
                    className="text-base font-bold text-black hover:text-[#0099FF] transition"
                  >
                    ajoy.sayhello@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Card 3: Location */}
            <div className="reelo-card p-6 sm:p-7 space-y-2 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#4EA100] text-white flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#999999] font-ui">
                    Location
                  </h4>
                  <p className="text-base font-bold text-black">
                    Dhaka, Bangladesh
                  </p>
                </div>
              </div>
            </div>

            {/* CA / FinSense Tools Bridge Pill */}
            <div className="reelo-card p-6 bg-[#F2F2F2] border border-[#DBDBDB] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-black">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0099FF]" />
                  FinSense Ledger Engine
                </span>
                <Link to="/bills" className="text-[#0099FF] hover:underline">
                  Launch Invoices →
                </Link>
              </div>
              <p className="text-xs font-ui text-[#333333]">
                Manage invoices, run PaddleOCR tests, and inspect deterministic GST records.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Testimonial Marquee (Jassie M. & Ajoy S. quotes) */}
      <section className="space-y-6 pt-4">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#999999] font-ui">
            Trusted by top creators
          </span>
        </div>
        <div className="animate-ticker-left space-x-6">
          {[...contactTestimonials, ...contactTestimonials, ...contactTestimonials].map((t, idx) => (
            <div 
              key={idx}
              className="reelo-card p-6 w-[360px] sm:w-[420px] shrink-0 space-y-3 bg-white"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs font-ui text-[#333333] leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-2.5 pt-2 border-t border-[#DBDBDB]">
                <img 
                  src={t.avatar} 
                  alt={t.name}
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <div>
                  <h4 className="text-xs font-bold text-black font-heading">{t.name}</h4>
                  <p className="text-[10px] text-[#999999] font-ui">{t.audience}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shared Footer CTA + Footer */}
      <Footer />

    </div>
  );
}
