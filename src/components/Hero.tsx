"use client";

import Link from "next/link";
import { ArrowRight, Copy, Check, TrendingUp, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

export default function Hero() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("0x91F7906d274a2db6f8c27dbd283A497334");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative w-full pt-12 pb-16 overflow-hidden bg-[#07090E] select-none text-left">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-60" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Column: Heading and copy */}
        <div className="lg:col-span-7 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/25 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
              ~ AI Powered Meme Market Intelligence
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.95] text-white">
            Trade Meme Coins
            <br />
            With <span className="bg-gradient-to-r from-blue-400 to-[#93C5FD] bg-clip-text text-transparent">Institutional</span>
            <br />
            Intelligence
          </h1>

          {/* Description */}
          <p className="text-slate-400 max-w-xl text-sm sm:text-base font-normal leading-relaxed">
            Real-time AI scanning, market intelligence & high-probability opportunities across multiple blockchains.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold uppercase text-xs rounded-xl transition-all flex items-center justify-center gap-2 tracking-wider shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              Launch Terminal 🚀
            </Link>
            <a
              href="#showcase"
              className="px-8 py-4 bg-[#0B0E11] border border-slate-800 hover:bg-slate-900 text-slate-350 hover:text-white font-bold uppercase text-xs rounded-xl transition-all text-center tracking-wider cursor-pointer"
            >
              View Live Markets 📈
            </a>
          </div>
        </div>

        {/* Right Column: High-Fidelity Mobile App Mockup */}
        <div className="lg:col-span-5 flex justify-center relative">
          {/* Mockup Outer Device Shell */}
          <div className="w-[290px] h-[550px] bg-[#0B0E11] border-[6px] border-[#2B3139] rounded-[36px] shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden font-sans select-none ring-1 ring-white/5">
            {/* Phone Notch/Camera */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-[#2B3139] rounded-full z-30 flex items-center justify-between px-3">
              <span className="w-1.5 h-1.5 bg-black rounded-full" />
              <span className="w-12 h-1 bg-black/40 rounded-full" />
              <span className="w-2.5 h-1.5 bg-[#0B0E11] rounded-full border border-black/10" />
            </div>

            {/* Mockup App Header */}
            <div className="pt-6 pb-2.5 border-b border-[#2B3139]/45 flex justify-between items-center text-xs">
              <div className="text-left">
                <span className="font-black text-white block text-xs">PEPEAI</span>
                <span className="text-[7.5px] font-mono text-slate-500 flex items-center gap-0.5 mt-0.5">
                  0x91F...34A 
                  <button onClick={handleCopy} className="p-0.5 hover:text-white cursor-pointer">
                    {copied ? <Check className="w-2.5 h-2.5 text-[#0ECB81]" /> : <Copy className="w-2.5 h-2.5" />}
                  </button>
                </span>
              </div>
              
              <div className="bg-[#0ECB81]/15 border border-[#0ECB81]/25 text-[#0ECB81] px-2 py-0.5 rounded text-center shrink-0 min-w-[50px]">
                <span className="text-[10px] font-black font-mono block leading-none">94</span>
                <span className="text-[6px] font-bold block uppercase tracking-wider mt-0.5 leading-none">AI SCORE</span>
              </div>
            </div>

            {/* Price section */}
            <div className="py-2.5 text-left select-none">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Price</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-black text-white font-mono leading-none">$0.0000213</span>
                <span className="text-[9.5px] font-bold text-[#0ECB81] font-mono">+128.6% (24h)</span>
              </div>
            </div>

            {/* Graph Chart Representation */}
            <div className="flex-grow flex items-end h-[160px] pb-4 relative select-none">
              <div className="absolute inset-0 flex flex-col justify-between text-[7px] font-mono text-slate-700 pointer-events-none py-2">
                <div className="border-b border-[#2B3139]/20 w-full" />
                <div className="border-b border-[#2B3139]/20 w-full" />
                <div className="border-b border-[#2B3139]/20 w-full" />
                <div className="border-b border-[#2B3139]/20 w-full" />
              </div>
              <svg className="w-full h-full text-[#0ECB81] z-10" viewBox="0 0 100 80" fill="none">
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0ECB81" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0ECB81" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0,60 Q15,50 30,55 T60,25 T80,10 T100,5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0,60 Q15,50 30,55 T60,25 T80,10 T100,5 L100,80 L0,80 Z" fill="url(#grad)" />
              </svg>
            </div>

            {/* Interval Selection Tabs */}
            <div className="flex justify-between text-[9px] font-bold text-slate-500 border-y border-[#2B3139]/40 py-1.5 select-none shrink-0 z-20">
              {["1m", "5m", "15m", "1h", "4h", "1d"].map((i) => (
                <span key={i} className={`px-1.5 py-0.5 rounded cursor-pointer uppercase ${i === "5m" ? "text-blue-400 bg-blue-500/10 border border-blue-500/20" : "hover:text-white"}`}>
                  {i}
                </span>
              ))}
            </div>

            {/* Info Grid parameters */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 py-3 text-left shrink-0 select-none">
              <div>
                <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider block">Liquidity</span>
                <span className="text-xs font-black text-white font-mono block mt-0.5">$28.4K</span>
              </div>
              <div>
                <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider block">Volume 24h</span>
                <span className="text-xs font-black text-white font-mono block mt-0.5">$182.3K</span>
              </div>
              <div>
                <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider block">Holders</span>
                <span className="text-xs font-black text-white font-mono block mt-0.5">284</span>
              </div>
              <div>
                <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider block">Age</span>
                <span className="text-xs font-black text-white font-mono block mt-0.5">3m 12s</span>
              </div>
            </div>

            {/* Bottom details CTA button */}
            <div className="pt-2 pb-1 shrink-0 z-20">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] uppercase transition-all tracking-wider flex items-center justify-center gap-1 cursor-pointer"
              >
                View Details
              </Link>
            </div>
          </div>

          {/* Absolute Background Glow Badge behind phone */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />
        </div>

      </div>
    </section>
  );
}
