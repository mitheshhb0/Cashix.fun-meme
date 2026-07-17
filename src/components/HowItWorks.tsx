"use client";

import { motion } from "framer-motion";
import { Compass, Cpu, Users, TrendingUp } from "lucide-react";

interface Step {
  num: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

const steps: Step[] = [
  {
    num: "01",
    title: "Market Discovery",
    desc: "Our automated scrapers monitor newly launched profiles, community takeovers, and trending meme coins in real-time across supported chains.",
    icon: Compass,
    color: "#3B82F6",
  },
  {
    num: "02",
    title: "Market Intelligence",
    desc: "Calculate deterministic Market Intelligence Scores for each candidate using liquidity pool depth, whale transactions, volume profiles, social momentum, and smart contract audits.",
    icon: Cpu,
    color: "#00E5FF",
  },
  {
    num: "03",
    title: "Community Validation",
    desc: "Experienced traders, quantitative analysts, and coordinators discuss high-conviction opportunities inside our private community to filter noise.",
    icon: Users,
    color: "#00C853",
  },
  {
    num: "04",
    title: "Trade With Confidence",
    desc: "Access transparent buy/sell signals in the Token Center, complete with entrance targets, stop losses, risk parameters, and detailed AI reasoning reports.",
    icon: TrendingUp,
    color: "#EC4899",
  },
];

export default function HowItWorks() {
  const steps = [
    { num: 1, title: "AI Scans 24/7", desc: "Our bots scan new pairs, liquidity, wallets & social signals in real-time." },
    { num: 2, title: "AI Scores Opportunities", desc: "Proprietary algorithm scores each token based on 40+ intelligence factors." },
    { num: 3, title: "You Trade Smarter", desc: "Get high-probability setups & act faster than the crowd." }
  ];

  return (
    <section id="workflow" className="relative py-20 bg-[#07090E] overflow-hidden border-t border-slate-800/60 select-none">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-blue-500 font-extrabold block">
            How It Works
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
            Find Opportunities in 3 Steps
          </h2>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center items-stretch relative">
          
          {/* Subtle connecting lines on desktop */}
          <div className="hidden md:block absolute top-[30px] left-[15%] right-[15%] h-[1px] bg-slate-800/60 z-0" />

          {steps.map((st) => (
            <div key={st.num} className="relative z-10 flex flex-col items-center p-6 space-y-4 rounded-2xl bg-[#0D1117]/30 border border-slate-800/50 hover:border-slate-800 transition-colors shadow-md">
              
              {/* Number Circle Badge */}
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-base shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                {st.num}
              </div>

              <div className="space-y-2 max-w-xs mx-auto">
                <h3 className="text-sm font-black text-white uppercase tracking-wide">{st.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{st.desc}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
