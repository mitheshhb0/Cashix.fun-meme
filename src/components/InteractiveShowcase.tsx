"use client";

import React from "react";
import { 
  Droplet, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Megaphone, 
  LineChart, 
  Target 
} from "lucide-react";

export default function InteractiveShowcase() {
  const factors = [
    { name: "Liquidity Health", icon: Droplet },
    { name: "Holder Growth", icon: Users },
    { name: "Whale Activity", icon: Users },
    { name: "Volume Momentum", icon: TrendingUp },
    { name: "Developer Trust", icon: ShieldCheck },
    { name: "Social Sentiment", icon: Megaphone },
    { name: "Price Action", icon: LineChart },
    { name: "Risk Analysis", icon: Target }
  ];

  return (
    <section id="showcase" className="py-20 bg-[#07090E] border-t border-slate-800/60 select-none">
      <div className="max-w-xl mx-auto px-6 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-blue-500 font-extrabold block">
            The Market Intelligence Score
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
            40+ Factors. 1 Powerful Score.
          </h2>
        </div>

        {/* 8 Factors Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {factors.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i} 
                className="bg-[#12161A] border border-[#2B3139] px-4 py-3 rounded-xl flex items-center gap-2.5 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="text-blue-500 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wide text-slate-350">
                  {f.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Score circular gauge card */}
        <div className="bg-[#12161A] border border-[#2B3139] p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-8 shadow-2xl text-left relative overflow-hidden">
          
          {/* Left: Concentric circular progress gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
              {/* Background circle track */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#1B2026"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Glowing progress circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#0ECB81"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * 94) / 100}
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(14,203,129,0.55)]"
              />
            </svg>
            
            {/* Center score numbers */}
            <div className="absolute flex flex-col items-center justify-center text-center select-none mt-1">
              <span className="text-3xl font-black font-mono text-white leading-none">94</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-sans font-bold mt-1">/100</span>
            </div>
          </div>

          {/* Right: Summary description */}
          <div className="space-y-3.5 text-center sm:text-left">
            <div>
              <span className="text-sm font-black text-[#0ECB81] uppercase tracking-wider block">
                High Opportunity
              </span>
              <p className="text-[11.5px] text-slate-400 leading-relaxed font-medium mt-1.5 max-w-xs">
                Strong liquidity, active smart money, healthy holder growth and positive market sentiment.
              </p>
            </div>
            
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[9px] font-bold text-slate-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-pulse" />
              <span>Updated 2s ago</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
