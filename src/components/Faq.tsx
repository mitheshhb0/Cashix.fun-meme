"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How are Market Intelligence Scores calculated?",
    answer: "Scores are calculated deterministically by our scoring engine. We combine five key weight parameters: Market Momentum (price action and buy/sell ratio), Whale Activity (on-chain smart money balance sheets), Liquidity Depth (pool depth and lock verification), Social Velocity (mention triggers on X and community volume spikes), and Risk assessment. Every score is mathematically traceable back to its underlying RPC data triggers.",
  },
  {
    question: "Why is the trading community private?",
    answer: "We restrict access to active terminal subscribers to maintain a high signal-to-noise ratio on the Trading Floor. This prevents bot spam, preserves trading alpha for high-conviction opportunities, and ensures that only aligned traders are reviewing active setups.",
  },
  {
    question: "How often is data updated on the terminal?",
    answer: "Our event processors operate continuously. Market Pulse indices and whale tracking flows utilize active WebSocket connections to ingest sub-second blockchain events. The Discovery Engine scans and filters newly launched token metadata pools once every 60 seconds.",
  },
  {
    question: "Which blockchains are currently supported?",
    answer: "We currently support Solana, Ethereum, and Base networks. Our infrastructure maintains dedicated RPC node links on these chains to trace liquidity pool mutations, token allocations, and smart contract audit logs instantly.",
  },
  {
    question: "How are signals generated on the Alpha Desk?",
    answer: "Alpha setups are initialized when the Discovery pipeline identifies candidates that pass all mandatory liquidity, volume, and contract security thresholds. The opportunity is then reviewed on the Trading Floor, and when verified by our coordination team, it is published to the Alpha Desk with precise target, stop loss, and AI reasoning parameters.",
  },
];

export default function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-24 bg-[#07090E] overflow-hidden border-t border-slate-800/60 scroll-mt-24">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest text-blue-500 font-bold block">
            FAQ
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
            Frequently Answered Questions
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base font-light">
            Everything you need to know about the platform scoring indices, latency, and system security rules.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? "bg-[#0D1117]/80 border-slate-700 shadow-lg shadow-blue-500/5"
                    : "bg-[#0D1117]/40 border-slate-800/80 hover:bg-[#0D1117]/80 hover:border-slate-700/60"
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-5 px-6 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                >
                  <span className="text-xs md:text-sm font-bold text-white uppercase tracking-wider pr-4">
                    {faq.question}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                    {isOpen ? (
                      <Minus className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[300px]" : "max-h-0"
                  }`}
                >
                  <p className="px-6 pb-6 text-xs text-slate-400 leading-relaxed font-light border-t border-slate-800/40 pt-4 font-sans">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
