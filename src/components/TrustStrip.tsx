"use client";

import { TrendingUp, Droplet, Activity, Users } from "lucide-react";

export default function TrustStrip() {
  const stats = [
    { icon: TrendingUp, label: "NEW PAIRS (5M)", value: "24", change: "+20.0%", color: "text-blue-400" },
    { icon: Droplet, label: "LIQUIDITY", value: "$182K", change: "+28.6%", color: "text-[#00AEFF]" },
    { icon: Activity, label: "VOLUME 24H", value: "$1.24M", change: "+14.3%", color: "text-[#00AEFF]" },
    { icon: Users, label: "WALLETS", value: "3.42K", change: "+9.7%", color: "text-purple-400" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 mt-8 select-none">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-[#0B0E11]/80 border border-slate-800 rounded-2xl p-4.5 text-left flex flex-col justify-between min-h-[90px] shadow-lg">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
                <Icon className="w-3.5 h-3.5 opacity-60 text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-white font-mono leading-none">{s.value}</span>
                <span className="text-[9px] font-bold text-[#0ECB81] font-mono">{s.change}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
