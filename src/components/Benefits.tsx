"use client";

import { CheckCircle2, ChevronRight, Database, Cpu, Users, ShieldAlert, Globe, Zap, BarChart3, Star, Heart, TrendingUp } from "lucide-react";
import React from "react";

export default function Benefits() {
  const items = [
    { title: "Real-time on-chain & off-chain data", desc: "Deterministic, real-time on-chain data streams vs. traditional unverified hype", icon: Database },
    { title: "AI-powered opportunity scoring", desc: "Transparent scoring methodology vs. traditional biased shills with zero alignment", icon: Cpu },
    { title: "Whale & smart money tracking", desc: "Automated wallet trace triggers vs. traditional unsourced claims", icon: Users },
    { title: "Risk analysis & safety checks", desc: "Automated honeypot & LP lock checks vs. traditional no safety verification", icon: ShieldAlert },
    { title: "Multi-chain support", desc: "Sub-second websocket triggers across multiple chains vs. delayed manual calls", icon: Globe },
    { title: "Designed for speed & accuracy", desc: "AI-generated breakdowns & references vs. traditional no rationale provided", icon: Zap }
  ];

  const factors = [
    { label: "Liquidity Health", icon: CheckCircle2 },
    { label: "Holder Growth", icon: CheckCircle2 },
    { label: "Whale Activity", icon: CheckCircle2 },
    { label: "Volume Momentum", icon: CheckCircle2 },
    { label: "Developer Trust", icon: CheckCircle2 },
    { label: "Social Sentiment", icon: CheckCircle2 },
    { label: "Price Action", icon: CheckCircle2 },
    { label: "Risk Analysis", icon: CheckCircle2 }
  ];

  return (
    <section id="comparison" className="relative py-20 bg-[#07090E] select-none text-center border-t border-slate-900">
      <div className="max-w-4xl mx-auto px-6 space-y-20">
        
        {/* Section 1: Built for Serious Traders */}
        <div className="space-y-10">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              Why CASHIX is Different
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
              Built for Serious Traders
            </h2>
          </div>

          {/* List Card Container Stack */}
          <div className="bg-[#0B0E11]/80 border border-slate-800 rounded-2xl divide-y divide-slate-800/40 text-left shadow-lg">
            {items.map((row, idx) => {
              const Icon = row.icon;
              return (
                <div key={idx} className="p-4.5 flex items-center justify-between gap-4 group hover:bg-slate-900/20 transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 bg-blue-600/10 border border-blue-500/25 p-2 rounded-xl text-blue-400 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider block leading-none">{row.title}</h4>
                      <p className="text-[9.5px] text-slate-500 mt-1.5 truncate max-w-[280px] sm:max-w-md md:max-w-xl leading-none">{row.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Market Intelligence Score */}
        <div className="space-y-10">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              The Market Intelligence Score
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
              40+ Factors. 1 Powerful Score.
            </h2>
          </div>

          {/* Factor tags grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {factors.map((f, idx) => (
              <div key={idx} className="bg-[#0B0E11]/60 border border-slate-800/60 rounded-xl px-3 py-2 flex items-center gap-2 text-left justify-center shadow">
                <f.icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-[9.5px] font-bold text-slate-350 tracking-wide uppercase leading-none">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Intelligence Score gauge showcase card */}
          <div className="bg-[#0B0E11] border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 text-left shadow-lg">
            {/* Circular Gauge Graphic */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#1F2937" strokeWidth="7" fill="transparent" />
                <circle cx="50" cy="50" r="42" stroke="#0ECB81" strokeWidth="7" fill="transparent" strokeDasharray="263.8" strokeDashoffset="15.8" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                <span className="text-2xl font-black text-white leading-none">94</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">/100</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#0ECB81] uppercase tracking-wider block">HIGH OPPORTUNITY</span>
              <p className="text-xs text-slate-350 leading-relaxed font-medium">
                Strong liquidity, active smart money, healthy holder growth and positive market sentiment.
              </p>
              <div className="flex items-center gap-1.5 text-[8.5px] text-slate-500 font-mono pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-pulse inline-block" />
                <span>Updated 2s ago</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
