"use client";

import { motion } from "framer-motion";
import { 
  XCircle, 
  CheckCircle2, 
  Activity, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  TrendingDown,
  Database
} from "lucide-react";

export default function Benefits() {
  const comparison = [
    {
      metric: "Market Analysis",
      traditional: "Random opinions & unverified hype",
      cashix: "Deterministic, real-time on-chain data streams",
      verified: true
    },
    {
      metric: "Information Speed",
      traditional: "Delayed manual calls & recycled links",
      cashix: "Sub-second live websocket event triggers",
      verified: true
    },
    {
      metric: "Opportunity Assessment",
      traditional: "Biased shills with zero alignment",
      cashix: "Transparent Market Intelligence Scoring",
      verified: true
    },
    {
      metric: "Whale Flow Tracking",
      traditional: "No trace or unsourced claims",
      cashix: "Automated wallet trace triggers & profit histories",
      verified: true
    },
    {
      metric: "Contract Audit",
      traditional: "No safety verification or audit oversight",
      cashix: "Automated honeypot & LP lock checks",
      verified: true
    },
    {
      metric: "Explainability",
      traditional: "No rationale or proof provided",
      cashix: "AI-generated breakdowns & source references",
      verified: true
    }
  ];

  const scoreComponents = [
    {
      icon: Activity,
      title: "Market Momentum",
      desc: "Evaluates current buy/sell ratios, volume spikes, and short-term price velocity thresholds."
    },
    {
      icon: Users,
      title: "Whale Activity",
      desc: "Traces real-time smart money accumulation, wallet sizes, and smart wallets holdings."
    },
    {
      icon: Database,
      title: "Liquidity Depth",
      desc: "Measures PancakeSwap/Raydium pool depths, locked tokens ratios, and transfer limits."
    },
    {
      icon: TrendingUp,
      title: "Social Velocity",
      desc: "Scrapes X mentions, verified KOL posts, and growth curves in Telegram communities."
    },
    {
      icon: ShieldAlert,
      title: "Risk Parameters",
      desc: "Processes honeypot safety, top-holder concentration, and revoked mint flags."
    }
  ];

  return (
    <section id="comparison" className="relative py-24 bg-[#07090E] overflow-hidden border-t border-slate-800/60">
      {/* Background gradients */}
      <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-24">
        
        {/* Section 1: Comparison Matrix */}
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs uppercase tracking-widest text-blue-500 font-bold block">
              Comparison
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
              Why CASHIX is Different
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base font-light">
              Stop trading on speculation. Compare the difference between common dgen chat channels and professional quantitative intelligence.
            </p>
          </div>

          <div className="bg-[#0D1117]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 bg-slate-900/60 border-b border-slate-800 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              <div className="col-span-4">Metric</div>
              <div className="col-span-4">Traditional Telegram Channels</div>
              <div className="col-span-4">CASHIX Platform</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-800">
              {comparison.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 px-6 py-5 md:py-6 items-center gap-4 text-left text-xs md:text-sm font-semibold">
                  {/* Metric column */}
                  <div className="col-span-1 md:col-span-4 text-slate-300 font-bold uppercase tracking-wider text-[10px] md:text-xs">
                    {row.metric}
                  </div>

                  {/* Traditional column */}
                  <div className="col-span-1 md:col-span-4 flex items-start gap-2.5 text-slate-500 font-normal">
                    <XCircle className="w-4 h-4 text-rose-500/80 shrink-0 mt-0.5" />
                    <span>{row.traditional}</span>
                  </div>

                  {/* CASHIX column */}
                  <div className="col-span-1 md:col-span-4 flex items-start gap-2.5 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-medium">{row.cashix}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Intelligence Score Breakdown */}
        <div className="space-y-16 pt-8">
          <div className="text-center space-y-4">
            <span className="text-xs uppercase tracking-widest text-blue-500 font-bold block">
              Methodology
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
              The Market Intelligence Score
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base font-light">
              Every score on CASHIX is transparently calculated using verifiable blockchain indices. We trace parameters mathematically so you know exactly why a signal qualifies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
            {scoreComponents.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="bg-[#0D1117]/40 border border-slate-800 p-6 rounded-2xl space-y-4 hover:bg-[#0D1117]/80 hover:border-slate-700/80 transition-colors shadow-md flex flex-col justify-between"
                >
                  <div className="p-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl w-fit">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
