"use client";

import { motion } from "framer-motion";
import { UserCheck, Key, Shield, Landmark } from "lucide-react";

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
    title: "Initialize Web3 Wallet",
    desc: "Set up a Binance Web3 Wallet, MetaMask, or Trust Wallet, and load it with BNB to cover swap and network fee transactions.",
    icon: UserCheck,
    color: "#3B82F6",
  },
  {
    num: "02",
    title: "Grab Official Contract",
    desc: "Copy our official verified contract address from our official Telegram pin to avoid fake clone tokens.",
    icon: Key,
    color: "#22D3EE",
  },
  {
    num: "03",
    title: "Swap BNB for XRPz",
    desc: "Use our Quick Ape-in swap panel or swap via PancakeSwap. Set gas slip tolerance to low since there are no token taxes.",
    icon: Landmark,
    color: "#22C55E",
  },
  {
    num: "04",
    title: "HODL & Share Mascots",
    desc: "Gain entry to our VIP Degen Chat, track live alpha signals, and post memes to win our weekly ₹50,000 prize pool!",
    icon: Shield,
    color: "#EC4899",
  },
];

export default function HowItWorks() {
  return (
    <section id="roadmap" className="relative py-24 bg-bg-primary overflow-hidden border-t border-border-custom/50">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] rounded-full bg-accent-primary/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 uppercase text-[#FFD600] gold-glow-text"
          >
            How Cashix.fun Orchestrates
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-text-secondary max-w-lg mx-auto text-sm md:text-base font-light"
          >
            Initialize, swap, and scale your degen power in four simple steps, with locked LP guarantees and zero-tax entries.
          </motion.p>
        </div>

        {/* Timeline body */}
        <div className="relative">
          {/* Central Vertical Line (Desktop) */}
          <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-0.5 timeline-glow-line -translate-x-1/2 bg-white/10" />

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
                      className="w-10 h-10 rounded-full bg-bg-secondary border-2 flex items-center justify-center shadow-lg"
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
                      className="max-w-md p-6 rounded-2xl glass-panel glass-panel-hover text-left relative"
                    >
                      {/* Step Number Glow */}
                      <span
                        className="text-4xl font-extrabold font-mono absolute top-4 right-4 opacity-15"
                        style={{ color: step.color }}
                      >
                        {step.num}
                      </span>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ backgroundColor: `${step.color}15`, color: step.color }}>
                          Step {step.num}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-text-primary mb-2">{step.title}</h3>
                      <p className="text-xs text-text-secondary leading-relaxed font-light">{step.desc}</p>
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
