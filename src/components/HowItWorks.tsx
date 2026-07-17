"use client";

import React from "react";

export default function HowItWorks() {
  const steps = [
    { num: "1", title: "Market Discovery", desc: "Our automated scrapers monitor newly launched profiles, community takeovers, and trending meme coins in real-time across supported chains." },
    { num: "2", title: "Market Intelligence", desc: "Calculate deterministic Market Intelligence Scores for each candidate using liquidity pool depth, whale transactions, volume profiles, social momentum, and smart contract audits." },
    { num: "3", title: "Community Validation", desc: "Experienced traders, quantitative analysts, and coordinators discuss high-conviction opportunities inside our private community to filter noise." },
    { num: "4", title: "Trade With Confidence", desc: "Access transparent buy/sell signals in the Token Center, complete with entrance targets, stop losses, risk parameters, and detailed AI reasoning reports." }
  ];

  return (
    <section id="workflow" className="relative py-20 bg-[#07090E] select-none text-center border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Header Block */}
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            How It Works
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
            Find Opportunities in Steps
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className={`space-y-4 text-center px-4 relative ${idx < 3 ? "lg:border-r lg:border-slate-800/40" : ""}`}>
              {/* Number Circle Badge */}
              <div className="mx-auto w-10 h-10 rounded-full border border-blue-500/30 bg-blue-500/5 flex items-center justify-center text-xs font-black text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                {s.num}
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">{s.title}</h3>
                <p className="text-[10.5px] text-slate-400 leading-relaxed font-medium max-w-xs mx-auto">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
