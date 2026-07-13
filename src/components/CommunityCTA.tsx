"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MessageSquare, Shield, Bell, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function CommunityCTA() {
  const { user } = useAuth();

  const details = [
    { icon: Shield, title: "Trade Reviews", desc: "Contract audits and whale flows verified by admin coordinators." },
    { icon: Bell, title: "Real-time alerts", desc: "Immediate smart money accumulation updates and trend spikes." },
    { icon: Sparkles, title: "AI-generated summaries", desc: "Dynamic summaries compiling community analysis hourly." }
  ];

  return (
    <section className="relative w-full py-12 bg-[#07090E]">
      {/* Background glow behind CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none animate-pulse-glow" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-[#0D1117]/60 border border-slate-800 rounded-2xl p-8 md:p-16 text-center relative overflow-hidden shadow-2xl"
      >
        {/* Floating background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-50" />

        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6 relative z-10">
          {/* Glowing Badge */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.15)] text-blue-400 mb-2"
          >
            <MessageSquare className="w-8 h-8" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight leading-none">
            Access the Elite Community
          </h2>
          
          <p className="text-sm md:text-base font-medium text-slate-450 leading-relaxed max-w-2xl">
            The VIP Community is one integrated feature of the CASHIX intelligence platform. Interact directly with quantitative analysts, discuss opportunity alerts, and validate narrative shifts on the terminal floor.
          </p>

          {/* Value props cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full my-6 text-left">
            {details.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-3">
                  <div className="text-blue-400 bg-blue-600/10 p-2 rounded-lg w-fit border border-blue-500/20">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs uppercase text-white tracking-wider">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-normal font-light">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mt-2">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto px-8 py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 tracking-wider cursor-pointer"
            >
              Enter Community
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-6 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-Time Updates Active</span>
            </div>
            <div className="w-[1px] h-3 bg-slate-800" />
            <span>Private Members Only</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
