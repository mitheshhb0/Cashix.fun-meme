"use client";

import { motion } from "framer-motion";
import { Coins, Users, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-32 pb-16 overflow-hidden">
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/10 w-72 h-72 rounded-full bg-[#FFD600]/10 blur-[100px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-[#FF4D00]/5 blur-[120px] animate-float pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[#00E5FF]/5 blur-[100px] animate-float-delayed pointer-events-none" />

      {/* Subtle Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40" />

      {/* Trending Badges */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/5 border border-white/10 mb-8"
      >
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C853] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00C853]"></span>
        </span>
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FFD600]">
          #1 Trending on DexScreener
        </span>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-none bg-gradient-to-b from-white via-white to-[#FFD600]/80 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(255,214,0,0.15)]"
      >
        THE WORLD&apos;S
        <br />
        <span className="text-[#FFD600] gold-glow-text">GOODEST MEME COIN.</span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-base sm:text-xl md:text-2xl font-medium max-w-3xl mx-auto px-4 text-[#8A99AD] mt-6 leading-relaxed"
      >
        Decentralized fun, simplified. No false promises or empty roadmaps—just pure culture and the most aggressive community in crypto.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mt-10 z-10"
      >
        <a
          href="https://t.me/our_telegram"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-4 bg-[#00E5FF] text-black font-black uppercase text-sm rounded-full hover:scale-105 transition-transform hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2 tracking-wider"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.6 1.48-1.54 2.72-2.6 3.96-3.77.56-.53 1.13-1.25.9-1.58-.23-.33-.94-.22-1.35-.11-1.36.37-6.07 3.53-6.42 3.76-.5.33-1 .49-1.42.48-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.74 3.88-1.69 6.47-2.8 7.77-3.32 3.7-1.53 4.47-1.8 4.97-1.8.11 0 .36.03.52.16.14.12.18.28.2.45-.02.07.01.2.02.32z" />
          </svg>
          Join VIP Community
        </a>
        <a
          href="https://dexscreener.com/solana/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FFD600] to-[#FF4D00] text-black font-black uppercase text-sm rounded-full hover:scale-105 transition-transform hover:shadow-[0_0_25px_rgba(255,214,0,0.35)] text-center tracking-wider"
        >
          Buy $TOKEN
        </a>
        <a
          href="#chart"
          className="w-full sm:w-auto px-8 py-4 backdrop-blur-md bg-white/5 border border-white/10 text-white hover:text-[#FFD600] font-black uppercase text-sm rounded-full hover:scale-105 transition-all text-center tracking-wider"
        >
          View Live Chart
        </a>
      </motion.div>

      {/* Stat tags */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mt-16 font-black text-xs uppercase tracking-wider text-[#8A99AD]"
      >
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-[#FFD600]" />
          <span>No Tax</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#00E5FF]" />
          <span>LP Burnt</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00C853]" />
          <span>Mint Revoked</span>
        </div>
      </motion.div>
    </section>
  );
}

