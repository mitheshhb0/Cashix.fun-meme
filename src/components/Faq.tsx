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
    question: "What is Cashix.fun?",
    answer: "Cashix.fun is the ultimate community ecosystem. Built on BNB Chain, it supports our native XRPz token with aggressive community culture, real-time trading alpha, and transparent tokenomics.",
  },
  {
    question: "How do I participate in the weekly Meme Contest?",
    answer: "Post your best XRPz mascot meme or animation on X tagging @XRPz_meme and submit your link in the Degen Dashboard. Our community moderators select the winners weekly.",
  },
  {
    question: "Is the Liquidity Pool secured?",
    answer: "Yes, 50% of the XRPz token supply was deposited directly into the PancakeSwap liquidity pool and the LP tokens have been burned forever, preventing any rug pulls.",
  },
  {
    question: "How do I access the VIP Telegram & Discord?",
    answer: "Just sign up with your email or Google account on our platform. Once logged in, you will unlock immediate access to our private coordinators group chat links.",
  },
  {
    question: "What are the token transaction taxes?",
    answer: "XRPz has zero transaction tax. Buying, selling, or transferring XRPz tokens incurs absolutely no protocol fees, only standard network gas fees.",
  },
];

export default function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-24 bg-bg-primary overflow-hidden border-t border-border-custom/50">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 uppercase text-[#FFD600] gold-glow-text"
          >
            Frequently Answered Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-text-secondary text-sm md:text-base font-light"
          >
            Everything you need to know about Cashix.fun, LP security, and the community.
          </motion.p>
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
                    ? "bg-bg-secondary border-accent-primary/50 shadow-[0_4px_30px_rgba(255,214,0,0.1)]"
                    : "bg-bg-secondary/40 border-border-custom/60 hover:bg-bg-secondary hover:border-border-custom"
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-5 px-6 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                >
                  <span className="text-sm md:text-base font-bold text-text-primary pr-4">
                    {faq.question}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-bg-primary border border-border-custom flex items-center justify-center shrink-0">
                    {isOpen ? (
                      <Minus className="w-3.5 h-3.5 text-accent-secondary" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-text-secondary" />
                    )}
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[200px]" : "max-h-0"
                  }`}
                >
                  <p className="px-6 pb-6 text-xs md:text-sm text-text-secondary leading-relaxed font-light border-t border-border-custom/30 pt-4">
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
