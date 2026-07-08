"use client";

import { motion } from "framer-motion";
import { Cpu, Terminal, ArrowUpRight, DollarSign } from "lucide-react";

export default function Benefits() {
  return (
    <section id="benefits" className="relative py-24 bg-bg-primary overflow-hidden border-t border-border-custom/50">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-0 w-96 h-96 rounded-full bg-accent-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent-secondary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 uppercase text-[#FFD600] gold-glow-text"
          >
            Why Degens Ape Into XRPz
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-text-secondary max-w-lg mx-auto text-sm md:text-base font-light"
          >
            Skip the bottlenecks of generic utility tokens. Participate in a locked, zero-tax liquidity pool with real-time community engagement.
          </motion.p>
        </div>

        {/* Alternating Sections */}
        <div className="space-y-24">
          {/* Benefit 1: LP Burned */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Column */}
            <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -30 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md p-5 rounded-2xl glass-panel relative border border-border-custom/80 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden"
              >
                {/* Glow behind terminal */}
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-accent-primary/10 blur-xl rounded-full" />

                <div className="flex items-center gap-2 border-b border-border-custom/40 pb-3 mb-4">
                  <Terminal className="w-4 h-4 text-accent-primary" />
                  <span className="text-[10px] text-text-secondary font-mono tracking-widest uppercase">LIQUIDITY LEDGER AUDIT</span>
                  <div className="flex gap-1.5 ml-auto">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                  </div>
                </div>

                <div className="font-mono text-[10px] text-text-secondary space-y-2.5 leading-relaxed">
                  <p className="text-accent-secondary">$ cashix status --pool</p>
                  <p className="text-text-primary">▶ Querying LP Burn transaction... SUCCESS</p>
                  <p>▶ Burn TX: <span className="text-accent-primary">0x5f...312a</span></p>
                  <p>▶ Burn Address: <span className="text-text-primary">0x0000...0000dead</span></p>
                  <div className="p-2.5 rounded-lg bg-bg-secondary border border-border-custom/40 flex items-center justify-between text-text-primary">
                    <span>Liquidity Pool Tokens</span>
                    <span className="text-accent-success font-bold">100% BURNT</span>
                  </div>
                  <p className="text-text-secondary text-[9px] mt-2">Verified via BNB Chain ledger with permanently revoked contract mint permissions.</p>
                </div>
              </motion.div>
            </div>

            {/* Text Column */}
            <div className="lg:col-span-6 order-1 lg:order-2 text-left">
              <div className="inline-flex p-3 rounded-2xl bg-accent-primary/10 text-accent-primary mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-4">
                Rug-Proof & Revoked Contract
              </h3>
              <p className="text-text-secondary text-sm md:text-base font-light mb-6 leading-relaxed">
                The XRPz smart contract code is immutable. LP tokens were sent directly to the burn address, ensuring that no developer or third party can extract liquidity.
              </p>
              <ul className="space-y-3.5 text-xs text-text-secondary font-light">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                  <span>Administrative mint access permanently revoked</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                  <span>Fair launch allocation with zero developer pre-mine allocations</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                  <span>Fully verified contract code deployed on BNB chain explorer</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Benefit 2: Ticker alpha */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text Column */}
            <div className="lg:col-span-6 text-left">
              <div className="inline-flex p-3 rounded-2xl bg-accent-secondary/10 text-accent-secondary mb-6">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-4">
                Real-Time Ticker & Community Splits
              </h3>
              <p className="text-text-secondary text-sm md:text-base font-light mb-6 leading-relaxed">
                Track live charts and swap BNB for XRPz directly from our dashboard. Organic trade volume routes straight through the PancakeSwap smart router for micro-fees.
              </p>
              <ul className="space-y-3.5 text-xs text-text-secondary font-light">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                  <span>Staking rewards and weekly meme contest distributions</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                  <span>Immediate settlement directly into your connected Web3 wallet</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                  <span>Zero transaction tax to allow swift day-trading configurations</span>
                </li>
              </ul>
            </div>

            {/* Visual Column */}
            <div className="lg:col-span-6 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 30 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md p-6 rounded-2xl glass-panel relative border border-border-custom/80 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden"
              >
                {/* Glow behind splitter */}
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-accent-secondary/10 blur-xl rounded-full" />

                <div className="text-left border-b border-border-custom/40 pb-3 mb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-accent-secondary uppercase font-semibold tracking-wider">ROUTING CONTRACT</span>
                    <h5 className="text-xs font-bold text-text-primary mt-0.5">Token Supply Allocations</h5>
                  </div>
                  <span className="text-[10px] text-text-secondary font-mono bg-bg-secondary px-2.5 py-0.5 rounded border border-border-custom">
                    BNB Chain
                  </span>
                </div>

                {/* Animated Split Flow Mock */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary/40 border border-border-custom/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent-primary" />
                      <span className="text-xs font-bold">Total Supply Pool Volume</span>
                    </div>
                    <span className="text-xs font-semibold text-accent-primary">1 Billion Coins</span>
                  </div>

                  {/* Splits nodes */}
                  <div className="pl-4 border-l-2 border-border-custom/80 space-y-3">
                    <div className="flex items-center justify-between text-[11px] p-2 bg-bg-secondary/20 rounded">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <ArrowUpRight className="w-3.5 h-3.5 text-accent-secondary shrink-0" />
                        <span>liquidity_pool.swap</span>
                      </div>
                      <span className="font-bold text-accent-secondary">50% share</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] p-2 bg-bg-secondary/20 rounded">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <ArrowUpRight className="w-3.5 h-3.5 text-accent-success shrink-0" />
                        <span>rewards_rewards.pool</span>
                      </div>
                      <span className="font-bold text-accent-success">30% share</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] p-2 bg-bg-secondary/20 rounded">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <ArrowUpRight className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                        <span>burn_address.dead</span>
                      </div>
                      <span className="font-bold text-pink-500">15% share</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
