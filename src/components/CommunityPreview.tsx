"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function CommunityPreview() {
  const { user } = useAuth();

  const signals = [
    {
      symbol: "PEPEAI",
      avatar: "🐸",
      confidence: "82% Confidence",
      action: "BUY",
      entry: "$0.0000210",
      target: "$0.0000280",
      stopLoss: "$0.0000150",
      time: "2m ago"
    },
    {
      symbol: "DOGEX",
      avatar: "🐶",
      confidence: "78% Confidence",
      action: "BUY",
      entry: "$0.0000312",
      target: "$0.0000418",
      stopLoss: "$0.0000220",
      time: "4m ago"
    }
  ];

  return (
    <section id="signals" className="relative py-20 bg-[#07090E] overflow-hidden border-t border-slate-800/60 select-none">
      <div className="max-w-xl mx-auto px-6 space-y-12 text-left">
        
        {/* Section Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-blue-500 font-extrabold block">
            Professional Trading Signals
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
            Real-time Signals. Real Results.
          </h2>
        </div>

        {/* 2 Column Parallel Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {signals.map((sig, i) => (
            <div 
              key={i} 
              className="bg-[#12161A] border border-[#2B3139] rounded-2xl p-4.5 space-y-4 shadow-xl flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center border-b border-[#2B3139]/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{sig.avatar}</span>
                  <span className="text-xs font-black text-white uppercase">{sig.symbol}</span>
                </div>
                <span className="text-[9px] font-black text-[#0ECB81] bg-[#0ECB81]/10 px-2 py-0.5 rounded-lg border border-[#0ECB81]/25">
                  {sig.confidence}
                </span>
              </div>

              {/* Card Info Rows */}
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A99AD] text-[9.5px] uppercase">Action</span>
                  <span className="text-[#0ECB81] font-black uppercase text-[10px]">{sig.action}</span>
                </div>
                <div className="flex justify-between items-center font-mono">
                  <span className="text-[#8A99AD] text-[9.5px] uppercase font-sans">Entry</span>
                  <span className="text-slate-200">{sig.entry}</span>
                </div>
                <div className="flex justify-between items-center font-mono">
                  <span className="text-[#8A99AD] text-[9.5px] uppercase font-sans">Target</span>
                  <span className="text-[#0ECB81]">{sig.target}</span>
                </div>
                <div className="flex justify-between items-center font-mono">
                  <span className="text-[#8A99AD] text-[9.5px] uppercase font-sans">Stop Loss</span>
                  <span className="text-rose-500">{sig.stopLoss}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-center border-t border-[#2B3139]/60 pt-3 text-[10px]">
                <span className="text-slate-500 font-mono font-bold">{sig.time}</span>
                <Link 
                  href={user ? "/dashboard" : "/login"} 
                  className="text-blue-500 font-black hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  View Details
                </Link>
              </div>

            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="pt-2 text-center">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="w-full py-3.5 bg-[#12161A] border border-[#2B3139] text-[#8A99AD] hover:text-white font-bold uppercase text-[10.5px] tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:border-slate-700"
          >
            View All Live Signals
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
