"use client";

import React from "react";
import { ChevronRight, Database, Cpu, Users, ShieldAlert, Globe, Activity } from "lucide-react";

export default function Benefits() {
  const items = [
    { icon: Activity, text: "Real-time on-chain & off-chain data" },
    { icon: Cpu, text: "AI-powered opportunity scoring" },
    { icon: Users, text: "Whale & smart money tracking" },
    { icon: ShieldAlert, text: "Risk analysis & safety checks" },
    { icon: Globe, text: "Multi-chain support" },
    { icon: Database, text: "Designed for speed & accuracy" }
  ];

  return (
    <section id="comparison" className="relative py-20 bg-[#07090E] overflow-hidden border-t border-slate-800/60 select-none">
      <div className="max-w-xl mx-auto px-6 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-blue-500 font-extrabold block">
            Why Cashix is Different
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
            Built for Serious Traders
          </h2>
        </div>

        {/* Benefits list card */}
        <div className="bg-[#12161A] border border-[#2B3139] rounded-2xl overflow-hidden shadow-xl divide-y divide-[#2B3139]/60 text-left">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="px-5 py-4 flex items-center justify-between hover:bg-[#2B3139]/10 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  {/* Icon Block */}
                  <div className="w-8.5 h-8.5 bg-blue-600/10 border border-blue-500/25 text-blue-500 rounded-xl flex items-center justify-center transition-colors group-hover:bg-blue-600/20 group-hover:text-blue-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11.5px] font-black uppercase text-slate-200 tracking-wide group-hover:text-white transition-colors">
                    {item.text}
                  </span>
                </div>
                {/* Chevron */}
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-all transform group-hover:translate-x-0.5" />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
