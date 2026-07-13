"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Terminal, HelpCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface PricingPlan {
  name: string;
  price: string;
  billing: string;
  desc: string;
  features: string[];
  recommended?: boolean;
  ctaText: string;
}

export default function Stats() {
  const { user } = useAuth();

  const plans: PricingPlan[] = [
    {
      name: "Starter Feed",
      price: "$49",
      billing: "per month",
      desc: "Access basic market data and community discussions.",
      features: [
        "Live Market Pulse feeds",
        "Discovery Engine listings",
        "General Trading Floor view",
        "Standard security scores",
        "24-hour update latency"
      ],
      ctaText: "Begin Starter Run"
    },
    {
      name: "Intelligence Pro",
      price: "$149",
      billing: "per month",
      desc: "Complete access to algorithmic intelligence & signals.",
      features: [
        "Market Intelligence Score index",
        "Live Whale Intelligence tracking",
        "Alpha Desk trade signals & updates",
        "Complete contract Risk audits",
        "Real-time websocket events",
        "Private community floor discuss",
        "Priority alert updates"
      ],
      recommended: true,
      ctaText: "Unlock Pro Terminal"
    },
    {
      name: "Institutional VIP",
      price: "$499",
      billing: "per month",
      desc: "For quantitative operations requiring custom integration.",
      features: [
        "Everything in Intelligence Pro",
        "Custom webhook alert notifications",
        "Direct REST & WebSocket API access",
        "Dedicated analyst support",
        "Priority access to whitelist models"
      ],
      ctaText: "Deploy VIP System"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-[#07090E] border-t border-slate-800/60 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest text-blue-500 font-bold block">
            Pricing Plans
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
            Deploy Institutional Intelligence
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base font-light">
            Choose a tier to match your trading complexity. We sell access to high-conviction metrics, deterministic indicators, and data integrations.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch text-left">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className={`bg-[#0D1117]/65 border rounded-2xl p-6 md:p-8 flex flex-col justify-between relative shadow-xl hover:bg-[#0D1117] hover:border-slate-700/80 transition-all ${
                plan.recommended 
                  ? "border-blue-500/50 shadow-blue-500/5 scale-102 z-10" 
                  : "border-slate-800/80"
              }`}
            >
              {plan.recommended && (
                <span className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  Most Popular
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl md:text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{plan.billing}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal mt-2 font-medium">
                    {plan.desc}
                  </p>
                </div>

                {/* Features List */}
                <div className="border-t border-slate-800/60 pt-6 space-y-3.5">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block">
                    INCLUDED FEATURES
                  </span>
                  <ul className="space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 mt-auto w-full">
                <Link
                  href={user ? "/dashboard" : "/login"}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                    plan.recommended
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-350 border border-slate-800"
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  {plan.ctaText}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
