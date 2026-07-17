"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Terminal, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[75vh] flex flex-col items-center justify-center text-center lg:text-left px-4 pt-28 pb-12 overflow-hidden bg-[#07090E] select-none">
      {/* Subtle Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-45" />

      {/* Two Column Grid */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Info Column */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start space-y-6">
          
          {/* Live Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D1117]/85 border border-slate-800 w-fit">
            <span className="text-blue-500 text-[10px]">✦</span>
            <span className="text-[9.5px] font-black uppercase tracking-widest text-[#8A99AD]">
              AI Powered Meme Market Intelligence
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase leading-[0.95] text-white text-center lg:text-left max-w-2xl">
            Trade Meme Coins <br />
            With <span className="text-blue-500">Institutional</span> <br />
            Intelligence
          </h1>

          {/* Subtext */}
          <p className="text-slate-400 text-sm md:text-md max-w-xl text-center lg:text-left leading-relaxed font-medium">
            Real-time AI scanning, market intelligence & high-probability opportunities across multiple blockchains.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center lg:justify-start w-full pt-4">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer tracking-wider shrink-0"
            >
              Launch Terminal 🚀
            </Link>
            <a
              href="#workflow"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#0D1117]/60 border border-slate-800 hover:bg-[#0D1117] text-slate-300 font-bold uppercase text-xs rounded-xl transition-all text-center cursor-pointer tracking-wider shrink-0"
            >
              View Live Markets 📈
            </a>
          </div>
        </div>

        {/* Right Phone Device Mockup Column */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative">
            {/* Ambient behind-glow */}
            <div className="absolute inset-0 bg-blue-500/10 rounded-[42px] blur-2xl pointer-events-none" />
            
            {/* Phone Body Shell */}
            <div className="w-[280px] h-[520px] bg-[#0D1117] border-[6px] border-slate-800 rounded-[38px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col p-3 text-left border-slate-800/80">
              
              {/* Speaker / Camera Notch */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-slate-900 rounded-full z-20 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-850" />
                <span className="w-6 h-0.5 rounded-full bg-slate-800" />
              </div>

              {/* Status Info Row */}
              <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-500 px-2 pt-2.5 pb-2 border-b border-slate-800/60 font-mono">
                <span>9:41 AM</span>
                <span className="flex items-center gap-1">⚡ 88%</span>
              </div>

              {/* Device Main Workspace */}
              <div className="flex-grow flex flex-col justify-between pt-3 space-y-3 font-sans">
                
                {/* Active Token Ticker Header */}
                <div className="bg-[#12161A] border border-[#2B3139] p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🐸</span>
                    <div>
                      <h4 className="text-xs font-black text-white leading-none">PEPEAI</h4>
                      <span className="text-[7.5px] text-slate-500 font-mono leading-none tracking-tight block mt-0.5">0x91F...34A</span>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 bg-[#0ECB81]/10 border border-[#0ECB81]/25 rounded text-center">
                    <span className="text-[9px] font-black text-[#0ECB81] block">94</span>
                    <span className="text-[6.5px] text-slate-500 uppercase font-sans leading-none block">AI Score</span>
                  </div>
                </div>

                {/* Price block */}
                <div className="px-1 flex justify-between items-baseline">
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider block">Price</span>
                    <span className="text-lg font-black text-white font-mono mt-0.5 block leading-none">$0.0000213</span>
                    <span className="text-[9.5px] font-black text-[#0ECB81] font-mono mt-1 block">+128.6% (24h)</span>
                  </div>
                </div>

                {/* Sparkline Canvas Chart */}
                <div className="flex-grow border border-[#2B3139] bg-[#12161A]/40 rounded-xl p-2 relative flex flex-col justify-between min-h-[120px]">
                  {/* Glowing line SVG */}
                  <div className="flex-grow w-full flex items-center justify-center">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                      <path
                        d="M0,35 Q12,8 24,24 T48,12 T72,4 T96,8 Q98,12 100,0"
                        fill="none"
                        stroke="#0ECB81"
                        strokeWidth="2.2"
                        className="drop-shadow-[0_0_4px_rgba(14,203,129,0.5)]"
                      />
                    </svg>
                  </div>
                  
                  {/* Timeframes tabs menu */}
                  <div className="grid grid-cols-6 gap-1 text-center text-[7.5px] font-black text-slate-500 pt-2 border-t border-slate-800/50">
                    {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
                      <span key={tf} className={`py-0.5 rounded cursor-pointer ${tf === "5m" ? "bg-blue-600 text-white font-black" : "hover:text-slate-350"}`}>
                        {tf}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metadata table grid */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  {[
                    { label: "Liquidity", val: "$28.4K" },
                    { label: "Volume 24h", val: "$182.3K" },
                    { label: "Holders", val: "284" },
                    { label: "Age", val: "3m 12s" }
                  ].map((it, idx) => (
                    <div key={idx} className="bg-[#12161A] border border-[#2B3139] p-2 rounded-lg text-left">
                      <span className="text-[7px] text-slate-500 uppercase font-bold tracking-wider block">{it.label}</span>
                      <span className="text-[10px] font-black text-white font-mono mt-0.5 block">{it.val}</span>
                    </div>
                  ))}
                </div>

                {/* Details Call to action button */}
                <button className="w-full py-2 bg-blue-600 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center font-sans">
                  View Details
                </button>
              </div>

              {/* Bottom Phone Bar line indicator */}
              <div className="w-20 h-1 bg-slate-800 rounded-full mx-auto mt-2 shrink-0" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
