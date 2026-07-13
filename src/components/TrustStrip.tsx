"use client";

import { motion } from "framer-motion";
import { Database, ShieldAlert, Cpu, Activity } from "lucide-react";

export default function TrustStrip() {
  const integrations = [
    { name: "DexScreener", label: "Market Feeds" },
    { name: "Helius", label: "Solana RPC" },
    { name: "SocialData", label: "Sentiment Index" },
    { name: "OpenAI", label: "Model Intelligence" }
  ];

  const metrics = [
    { icon: Activity, value: "Real-time", label: "Market Intelligence" },
    { icon: Database, value: "100,000+", label: "Daily Events Audited" },
    { icon: Cpu, value: "Instant", label: "Deterministic Scoring" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-8">
      <div className="bg-[#0D1117]/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center backdrop-blur-md">
        {/* Integrations Column */}
        <div className="md:col-span-6 space-y-4">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
            Powered By Institutional Data
          </span>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {integrations.map((item) => (
              <div key={item.name} className="flex flex-col text-left">
                <span className="text-sm font-black text-white tracking-tight uppercase">
                  {item.name}
                </span>
                <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Separator for desktop */}
        <div className="hidden md:block md:col-span-1 h-12 w-[1px] bg-slate-800/60 mx-auto" />

        {/* Metrics Column */}
        <div className="md:col-span-5 grid grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="text-left space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-black text-white tracking-tight">
                    {metric.value}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block leading-tight">
                  {metric.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
