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
    desc: "Experienced traders, quantitative analysts, and coordinators discuss high-conviction opportunities inside our private trading floor community to filter noise.",
    icon: Users,
    color: "#00C853",
  },
  {
    num: "04",
    title: "Trade With Confidence",
    desc: "Access transparent buy/sell signals on the Alpha Desk, complete with entrance targets, stop losses, risk parameters, and detailed AI reasoning reports.",
    icon: TrendingUp,
    color: "#EC4899",
  },
];

export default function HowItWorks() {
  return (
    <section id="workflow" className="relative py-24 bg-[#07090E] overflow-hidden border-t border-slate-800/60">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <span className="text-xs uppercase tracking-widest text-blue-500 font-bold block">
            The Pipeline
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
            How CASHIX Finds Opportunities
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base font-light">
            From raw blockchain event streams to verified trade setups, our framework isolates alpha from market noise.
          </p>
        </div>

        {/* Timeline body */}
        <div className="relative">
          {/* Central Vertical Line (Desktop) */}
          <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-slate-800/80" />

          {/* Steps list */}
          <div className="space-y-16 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 0;

              return (
                <div key={step.num} className="flex flex-col md:flex-row items-stretch md:items-center relative">
                  {/* Icon Node on Line */}
                  <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      className="w-10 h-10 rounded-xl bg-slate-900 border flex items-center justify-center shadow-lg"
                      style={{ borderColor: step.color }}
                    >
                      <Icon className="w-4 h-4" style={{ color: step.color }} />
                    </motion.div>
                  </div>

                  {/* Left spacer or content block */}
                  <div className={`w-full md:w-1/2 flex pl-12 md:pl-0 ${isEven ? "md:justify-end md:pr-16" : "md:order-2 md:justify-start md:pl-16"}`}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="max-w-md p-6 rounded-2xl bg-[#0D1117]/60 border border-slate-800 text-left relative"
                    >
                      {/* Step Number Glow */}
                      <span
                        className="text-4xl font-extrabold font-mono absolute top-4 right-4 opacity-5 select-none"
                        style={{ color: step.color }}
                      >
                        {step.num}
                      </span>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded" style={{ backgroundColor: `${step.color}15`, color: step.color }}>
                          Step {step.num}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2 uppercase tracking-wide">{step.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">{step.desc}</p>
                    </motion.div>
                  </div>

                  {/* Right spacer for matching heights */}
                  <div className="hidden md:block w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
