"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, ArrowUpRight } from "lucide-react";

export default function CommunityPreview() {
  const activeSignal = {
    tokenName: "XRPz",
    symbol: "XRPZ",
    action: "BUY",
    entryRange: "$0.00042 - $0.00045",
    targetPrice: "$0.00150",
    stopLoss: "$0.00028",
    confidence: "94%",
    riskRating: "Moderate",
    timestamp: "10m ago",
    rationale: "Breaking out of accumulation base with 4x volume multiplier. LP locked, honeypot test passed. Whale accumulation traces confirm buying pressure.",
    metrics: {
      volume24h: "$1.45M",
      liquidity: "$480K",
      holders: "2,420"
    }
  };

  const recentSignals = [
    { tokenName: "WARUME", action: "BUY", entry: "$0.0012", outcome: "Target 2 Hit", gain: "+250%", date: "1d ago" },
    { tokenName: "FON", action: "BUY", entry: "$0.0540", outcome: "Target 1 Hit", gain: "+82%", date: "3d ago" },
    { tokenName: "PEPE_X", action: "SELL", entry: "$0.0085", outcome: "Stop Loss Triggered", gain: "-15%", date: "5d ago" }
  ];

  return (
    <section id="signals" className="relative py-24 bg-[#07090E] overflow-hidden border-t border-slate-800/60">
      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-4">
          <span className="text-xs uppercase tracking-widest text-blue-500 font-bold block">
            Alpha Desk
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
            Professional Trading Signals
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base font-light">
            Every trade signal is backed by measurable on-chain algorithms and audited contracts. No speculative guesses, just deterministic transparency.
          </p>
        </div>

        {/* Signals Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch text-left">
          
          {/* Main / Active Signal Card */}
          <div className="lg:col-span-8 bg-[#0D1117]/80 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-2xl" />
            
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded font-bold uppercase tracking-widest">
                  Active Alpha Setup
                </span>
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Issued {activeSignal.timestamp}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Confidence</span>
                <span className="text-sm font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
                  {activeSignal.confidence}
                </span>
              </div>
            </div>

            {/* Signal Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4 border-y border-slate-800/80 mb-6">
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Asset</span>
                <span className="text-xl font-black text-white block mt-1">
                  {activeSignal.tokenName} <span className="text-[10px] font-normal text-slate-500">/{activeSignal.symbol}</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Entry range</span>
                <span className="text-sm font-mono font-bold text-slate-300 block mt-1.5">{activeSignal.entryRange}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Target price</span>
                <span className="text-sm font-mono font-black text-emerald-400 block mt-1.5">{activeSignal.targetPrice}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Stop Loss</span>
                <span className="text-sm font-mono font-bold text-rose-500 block mt-1.5">{activeSignal.stopLoss}</span>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="space-y-2 mb-6">
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest block">AI Technical Breakdown</span>
              <p className="text-xs text-slate-400 leading-relaxed font-medium bg-slate-950 p-4 rounded-xl border border-slate-900">
                {activeSignal.rationale}
              </p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4 text-[10px] text-slate-500 uppercase font-bold tracking-wider pt-2">
              <div>Volume 24h: <span className="text-white font-mono">{activeSignal.metrics.volume24h}</span></div>
              <div>Liquidity: <span className="text-white font-mono">{activeSignal.metrics.liquidity}</span></div>
              <div>Risk Tier: <span className="text-emerald-400">{activeSignal.riskRating}</span></div>
            </div>
          </div>

          {/* Historical Updates / Side Column */}
          <div className="lg:col-span-4 bg-[#0D1117]/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest border-b border-slate-800 pb-4 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Recent Desk Outcomes
              </h3>
              
              <div className="space-y-4">
                {recentSignals.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <h4 className="font-bold text-white uppercase tracking-wider">{item.tokenName}</h4>
                      <p className="text-[9px] text-slate-500 uppercase font-bold">Entry: {item.entry}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        item.outcome.includes("Hit") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                      }`}>
                        {item.outcome}
                      </span>
                      <span className={`block font-bold text-[10px] ${item.gain.startsWith("+") ? "text-emerald-400" : "text-rose-450"}`}>
                        {item.gain}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 text-[10px] text-slate-500 font-medium leading-relaxed mt-4">
              🛡 CASHIX signals are advisory and based on algorithmic risk indices. We do not pledge guaranteed returns or profit expectations.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
