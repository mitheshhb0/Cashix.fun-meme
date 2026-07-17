"use client";

import React, { Fragment } from "react";
import { Zap, Droplet, BarChart3, Users, Target, Link, Brain } from "lucide-react";

export default function TrustStrip() {
  const stats = [
    { title: "New Pairs (5m)", val: "24", sub: "+20.0%", icon: Zap, color: "text-[#0ECB81]" },
    { title: "Liquidity", val: "$182K", sub: "+28.6%", icon: Droplet, color: "text-[#38BDF8]" },
    { title: "Volume 24h", val: "$1.24M", sub: "+14.3%", icon: BarChart3, color: "text-[#0ECB81]" },
    { title: "Wallets", val: "3.42K", sub: "+9.7%", icon: Users, color: "text-[#A855F7]" },
  ];

  const pipeline = [
    { id: 1, name: "Scanner", desc: "Live chain monitoring", icon: Target, active: true },
    { id: 2, name: "Pairs", desc: "New pair detection", icon: Link, active: true },
    { id: 3, name: "Liquidity", desc: "LP depth & health check", icon: Droplet, active: true },
    { id: 4, name: "Holders", desc: "Holder growth analysis", icon: Users, active: true },
    { id: 5, name: "Whales", desc: "Smart money tracking", icon: Users, active: true },
    { id: 6, name: "AI Score", desc: "Opportunity scoring", icon: Brain, active: true }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-12 select-none">
      
      {/* 4-Column Key Stats Row Card */}
      <div className="bg-[#12161A] border border-[#2B3139] rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-left shadow-lg">
        {stats.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="flex flex-col justify-between space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <span>{c.title}</span>
                <Icon className="w-3.5 h-3.5 text-slate-450" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-white">{c.val}</span>
                <span className="text-[10px] font-black text-[#0ECB81] font-mono">{c.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced AI Pipeline Block */}
      <div className="space-y-8 pt-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-blue-500 font-extrabold block">
            Our Algorithm
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
            Advanced AI Pipeline
          </h2>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 font-sans justify-start md:justify-center scrollbar-none">
          {pipeline.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Fragment key={item.id}>
                {/* Pipeline step card */}
                <div className="bg-[#12161A] border border-[#2B3139] rounded-xl px-4.5 py-5.5 text-center min-w-[105px] max-w-[130px] flex flex-col items-center justify-center space-y-2.5 shrink-0 hover:border-slate-700 transition-colors shadow-md">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[10.5px] font-black tracking-tight text-white uppercase">{item.name}</h4>
                    <p className="text-[8.5px] text-slate-500 font-medium leading-tight mt-1">{item.desc}</p>
                  </div>
                </div>

                {/* Arrow */}
                {idx < 5 && (
                  <span className="text-slate-700 font-mono text-sm select-none shrink-0 px-1 font-bold">→</span>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

    </div>
  );
}
