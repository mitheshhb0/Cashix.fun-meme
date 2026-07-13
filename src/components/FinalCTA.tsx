"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Terminal, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function FinalCTA() {
  const { user } = useAuth();

  return (
    <section className="relative py-24 bg-[#07090E] overflow-hidden border-t border-slate-800/60">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[160px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-8">
        <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tight text-white max-w-2xl mx-auto leading-none">
          Elevate Your Meme Coin Trading Today
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base font-light">
          Unlock deterministic scoring models, real-time whale trackers, and elite coordinator discussions instantly on the CASHIX terminal.
        </p>

        <div className="flex items-center justify-center w-full max-w-xs mx-auto pt-4">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs rounded-xl transition-colors flex items-center justify-center gap-2.5 tracking-wider shadow-lg cursor-pointer"
          >
            Enter Terminal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
