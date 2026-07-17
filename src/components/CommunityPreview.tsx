"use client";

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import React from "react";

export default function CommunityPreview() {
  const { user } = useAuth();

  const signals = [
    { name: "PEPEAI", avatar: "🐸", confidence: "82% Confidence", action: "BUY", entry: "$0.0000210", target: "$0.0000280", sl: "$0.0000150", time: "2m ago" },
    { name: "DOGEX", avatar: "🐶", confidence: "78% Confidence", action: "BUY", entry: "$0.0000312", target: "$0.0000418", sl: "$0.0000220", time: "4m ago" }
  ];

  return (
    <section id="signals" className="relative py-20 bg-[#07090E] select-none text-center border-t border-slate-900">
      <div className="max-w-4xl mx-auto px-6 space-y-12 text-left">
        
        {/* Section Header */}
        <div className="space-y-3 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Professional Trading Signals
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
            Real-time Signals. Real Results.
          </h2>
        </div>

        {/* Signals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {signals.map((sig, idx) => (
            <div key={idx} className="bg-[#0B0E11] border border-slate-800 p-5 rounded-2xl space-y-4 flex flex-col justify-between shadow-lg">
              
              {/* Header card details */}
              <div className="flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                  <span className="text-sm shrink-0">{sig.avatar}</span>
                  <span className="font-black text-white text-xs block tracking-wider uppercase leading-none">{sig.name}</span>
                </div>
                
                <span className="border border-[#0ECB81]/25 bg-[#0ECB81]/10 text-[#0ECB81] px-2.5 py-1 rounded text-[9.5px] font-black uppercase tracking-wider leading-none">
                  {sig.confidence}
                </span>
              </div>

              {/* Param details grid */}
              <div className="space-y-2.5 text-xs font-mono py-2.5 border-y border-slate-800/40">
                <div className="flex justify-between items-center leading-none">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-sans">Action</span>
                  <span className="text-[9.5px] font-black text-[#0ECB81] uppercase tracking-widest">{sig.action}</span>
                </div>
                <div className="flex justify-between items-center leading-none">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-sans">Entry</span>
                  <span className="text-xs font-black text-white">{sig.entry}</span>
                </div>
                <div className="flex justify-between items-center leading-none">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-sans">Target</span>
                  <span className="text-xs font-black text-[#0ECB81]">{sig.target}</span>
                </div>
                <div className="flex justify-between items-center leading-none">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-sans">Stop Loss</span>
                  <span className="text-xs font-black text-rose-500">{sig.sl}</span>
                </div>
              </div>

              {/* Footer details card */}
              <div className="flex justify-between items-center pt-1 select-none">
                <div className="flex items-center gap-1 text-[8.5px] font-mono text-slate-500">
                  <Clock className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  <span>{sig.time}</span>
                </div>

                <Link
                  href={user ? "/dashboard" : "/login"}
                  className="text-[#00AEFF] hover:underline text-[9.5px] font-black uppercase tracking-wider flex items-center gap-0.5 cursor-pointer font-sans"
                >
                  View Details
                </Link>
              </div>

            </div>
          ))}
        </div>

        {/* View All Live Signals Action button */}
        <div className="flex justify-center pt-4 select-none">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="w-full py-3.5 bg-[#0B0E11] border border-slate-800 hover:bg-slate-900 text-slate-350 hover:text-white font-bold uppercase text-[10px] tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
          >
            View All Live Signals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
