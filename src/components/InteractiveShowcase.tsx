"use client";

import { Compass, Link as LinkIcon, Droplet, Users, Activity, Cpu, ChevronRight } from "lucide-react";
import React from "react";

export default function InteractiveShowcase() {
  const pipeline = [
    { icon: Compass, label: "Scanner", desc: "Live chain monitoring", color: "text-[#3B82F6] bg-blue-500/10 border-blue-500/20" },
    { icon: LinkIcon, label: "Pairs", desc: "New pair detection", color: "text-[#3B82F6] bg-blue-500/10 border-blue-500/20" },
    { icon: Droplet, label: "Liquidity", desc: "LP depth & health check", color: "text-[#00AEFF] bg-sky-500/10 border-sky-500/20" },
    { icon: Users, label: "Holders", desc: "Holder growth analysis", color: "text-[#00C853] bg-emerald-500/10 border-emerald-500/20" },
    { icon: Activity, label: "Whales", desc: "Smart money tracking", color: "text-[#00AEFF] bg-sky-500/10 border-sky-500/20" },
    { icon: Cpu, label: "AI Score", desc: "Opportunity scoring", color: "text-[#A855F7] bg-purple-500/10 border-purple-500/20" }
  ];

  return (
    <section id="showcase" className="relative py-16 bg-[#07090E] select-none text-center border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Header Block */}
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Our Algorithm
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
            Advanced AI Pipeline
          </h2>
        </div>

        {/* Flowchart stepper cards grid */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 overflow-x-auto py-4 scrollbar-none font-sans">
          {pipeline.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={idx}>
                {/* Flow Step Card */}
                <div className="bg-[#0B0E11]/80 border border-slate-800 p-5 rounded-2xl text-center shrink-0 w-full lg:w-[160px] flex flex-col items-center justify-center gap-3 shadow-lg hover:border-slate-700 transition-colors">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.color} shadow-inner`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider block leading-none">{step.label}</h4>
                    <span className="text-[9px] text-slate-500 font-medium block mt-1.5 leading-tight">{step.desc}</span>
                  </div>
                </div>

                {/* Arrow Connector (Hidden on last item, rotates on mobile vs desktop) */}
                {idx < pipeline.length - 1 && (
                  <div className="text-slate-700 font-bold shrink-0 select-none py-1 flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 rotate-90 lg:rotate-0" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
