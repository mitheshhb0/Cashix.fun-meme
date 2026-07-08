"use client";

import { motion } from "framer-motion";

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.6 1.48-1.54 2.72-2.6 3.96-3.77.56-.53 1.13-1.25.9-1.58-.23-.33-.94-.22-1.35-.11-1.36.37-6.07 3.53-6.42 3.76-.5.33-1 .49-1.42.48-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.74 3.88-1.69 6.47-2.8 7.77-3.32 3.7-1.53 4.47-1.8 4.97-1.8.11 0 .36.03.52.16.14.12.18.28.2.45-.02.07.01.2.02.32z" />
  </svg>
);

export default function CommunityCTA() {
  return (
    <section className="relative w-full py-12">
      {/* Background glow behind CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#00E5FF]/10 blur-[100px] pointer-events-none animate-pulse-glow" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="glass-card rounded-[2.5rem] p-8 md:p-16 border border-white/5 text-center relative overflow-hidden shadow-2xl bg-gradient-to-b from-[#0D1426]/60 to-[#060913]/90"
      >
        {/* Floating background grids and circles */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 relative z-10">
          {/* Glowing Telegram Badge */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.25)] text-[#00E5FF] mb-4"
          >
            <TelegramIcon className="w-10 h-10" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tight leading-none">
            JOIN THE INNER CIRCLE
          </h2>
          
          <p className="text-base md:text-lg font-medium text-[#8A99AD] leading-relaxed">
            Our Telegram group is the primary hub for real-time trade signals, bonding curve progress updates, whitelist drops, and direct coordinator verification. Do not trade alone—join the herd.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mt-6">
            <a
              href="https://t.me/our_telegram"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4.5 bg-[#00E5FF] text-black font-black uppercase text-sm rounded-full hover:scale-105 transition-all hover:shadow-[0_0_30px_rgba(0,229,255,0.45)] flex items-center justify-center gap-2.5 tracking-wider cursor-pointer"
            >
              <TelegramIcon className="w-5 h-5" />
              Join VIP Community
            </a>
            <a
              href="http://x.com/XRPz_meme"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4.5 bg-white/5 border border-white/10 text-white font-black uppercase text-sm rounded-full hover:scale-105 transition-all flex items-center justify-center gap-2.5 tracking-wider cursor-pointer"
            >
              Follow Official X
            </a>
          </div>

          <div className="flex items-center gap-6 mt-6 text-xs font-black uppercase tracking-wider text-[#8A99AD]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00C853] animate-ping" />
              <span>12,842 Degens Online</span>
            </div>
            <div className="w-[1px] h-4 bg-white/10" />
            <span>Updates Every 5m</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
