"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Allocation {
  name: string;
  percentage: number;
  color: string;
  desc: string;
}

export default function Stats() {
  const allocations: Allocation[] = [
    { name: "Liquidity Pool", percentage: 50, color: "#00C853", desc: "Deposited into Raydium pool & burned forever." },
    { name: "Community Rewards", percentage: 30, color: "#00E5FF", desc: "Airdrops, contests, and staking yields." },
    { name: "Burned Forever", percentage: 15, color: "#FF4D00", desc: "Permanently removed from active circulation." },
    { name: "Team (Locked)", percentage: 5, color: "#FFD600", desc: "Vested over 12 months for core development." },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // SVG calculations for donut segments
  const size = 300;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative offset angles
  let accumulatedPercent = 0;

  return (
    <section id="tokenomics" className="glass-card rounded-[2.5rem] p-8 md:p-12 border border-white/5 scroll-mt-24 w-full text-left relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-[#FFD600]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-[#FF4D00]/5 blur-3xl pointer-events-none" />

      <div className="text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black uppercase mb-4 text-[#FFD600] gold-glow-text"
        >
          Tokenomics
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-lg sm:text-xl font-bold text-[#8A99AD]"
        >
          Fair launch. No VC dumps. Built for the community.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Animated SVG Donut Chart */}
        <div className="flex justify-center items-center relative min-h-[300px]">
          <svg width={size} height={size} className="transform -rotate-90">
            {allocations.map((alloc, idx) => {
              const strokeDasharray = `${(alloc.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += alloc.percentage;
              const isHovered = activeIndex === idx;

              return (
                <motion.circle
                  key={alloc.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={alloc.color}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  initial={{ strokeDashoffset: circumference }}
                  whileInView={{ strokeDashoffset }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                  style={{ transformOrigin: "50% 50%" }}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                />
              );
            })}
          </svg>

          {/* Central text display */}
          <div className="absolute text-center select-none pointer-events-none">
            {activeIndex !== null ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <span className="text-4xl font-black" style={{ color: allocations[activeIndex].color }}>
                  {allocations[activeIndex].percentage}%
                </span>
                <span className="text-xs uppercase font-bold text-[#8A99AD] mt-1 max-w-[140px] truncate">
                  {allocations[activeIndex].name}
                </span>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white">1 BILLION</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFD600] mt-1">
                  Total Supply
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details list */}
        <div className="space-y-4">
          {allocations.map((alloc, idx) => {
            const isHovered = activeIndex === idx;
            return (
              <div
                key={alloc.name}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`bg-white/5 border p-4 md:p-6 rounded-2xl flex flex-col justify-between hover:border-[#FFD600]/40 transition-all duration-300 gap-2 cursor-pointer ${
                  isHovered ? "border-[#FFD600]/40 shadow-[0_0_20px_rgba(255,214,0,0.1)] translate-x-2" : "border-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0 animate-pulse" 
                      style={{ backgroundColor: alloc.color }}
                    />
                    <span className="font-black uppercase text-base md:text-xl leading-none text-white">
                      {alloc.name}
                    </span>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-[#FFD600] shrink-0 leading-none">
                    {alloc.percentage}%
                  </div>
                </div>
                <p className="text-xs text-[#8A99AD] font-semibold ml-6 leading-relaxed">
                  {alloc.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
