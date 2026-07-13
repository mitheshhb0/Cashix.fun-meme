"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Terminal, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[75vh] flex flex-col items-center justify-center text-center px-4 pt-32 pb-8 overflow-hidden bg-[#07090E]">
      {/* Subtle Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-45" />

      {/* Terminal Live Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0D1117]/60 border border-slate-800 mb-8"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
          Terminal v4.0 Active
        </span>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-none text-white max-w-5xl"
      >
        Trade Meme Coins
        <br />
        <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
          With Institutional Intelligence
        </span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-sm sm:text-base md:text-lg font-medium max-w-3xl mx-auto px-4 text-slate-400 mt-6 leading-relaxed"
      >
        Discover high-conviction meme coin opportunities using real-time on-chain analytics, whale tracking, AI market intelligence, deterministic scoring, and a private community of experienced traders.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mt-10 z-10"
      >
        <Link
          href={user ? "/dashboard" : "/login"}
          className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs rounded-xl transition-colors flex items-center justify-center gap-2.5 tracking-wider shadow-lg cursor-pointer"
        >
          Enter Terminal
          <ArrowRight className="w-4 h-4" />
        </Link>
        <a
          href="#showcase"
          className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white font-bold uppercase text-xs rounded-xl transition-colors text-center tracking-wider cursor-pointer"
        >
          Watch Platform Demo
        </a>
      </motion.div>
    </section>
  );
}
