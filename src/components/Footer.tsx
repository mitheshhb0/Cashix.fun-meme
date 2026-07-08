"use client";

import { motion } from "framer-motion";

export default function Footer() {
  const stats = [
    { value: "1B", label: "Total Supply" },
    { value: "0%", label: "Buy/Sell Tax" },
    { value: "45%", label: "Burnt Supply" },
    { value: "100%", label: "LP Locked" },
  ];

  return (
    <footer className="bg-[#0D1426]/50 border-t border-white/5 px-6 md:px-10 py-16 flex flex-col md:flex-row items-center gap-12 mt-12 w-full rounded-t-[3.5rem] shadow-[0_-10px_35px_rgba(0,0,0,0.3)] text-left relative overflow-hidden">
      {/* Background neon dots */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-20 rounded-full bg-[#FFD600]/5 blur-3xl pointer-events-none" />

      {/* Stats Grid */}
      <div className="flex-1 w-full flex justify-around flex-wrap gap-8 z-10">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="text-center min-w-[120px]"
          >
            <p className="text-[#FFD600] text-4xl sm:text-5xl font-black tracking-tight gold-glow-text">
              {stat.value}
            </p>
            <p className="text-xs uppercase font-bold tracking-widest mt-2 text-[#8A99AD]">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Verified Holders card */}
      <motion.div
        whileHover={{ rotate: 0, scale: 1.05 }}
        initial={{ rotate: -3 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-48 h-32 bg-gradient-to-tr from-[#FFD600] to-[#FF4D00] text-black flex flex-col items-center justify-center font-black rounded-3xl shadow-[0_0_30px_rgba(255,214,0,0.25)] select-none cursor-pointer shrink-0 z-10"
      >
        <p className="text-xs uppercase leading-none tracking-widest opacity-80">Verified</p>
        <p className="text-3xl tracking-tighter mt-1">HOLDERS</p>
      </motion.div>
    </footer>
  );
}
