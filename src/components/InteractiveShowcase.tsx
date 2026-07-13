"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Globe, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Shield, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Database,
  Star
} from "lucide-react";

type ModuleType = "PULSE" | "DISCOVERY" | "WHALES" | "ALPHA" | "FLOOR" | "RISK";

export default function InteractiveShowcase() {
  const [activeTab, setActiveTab] = useState<ModuleType>("PULSE");
  const [isHovered, setIsHovered] = useState(false);
  const autoCycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tabs = [
    { id: "PULSE", name: "Market Pulse", icon: Zap, desc: "Real-time AI market indices" },
    { id: "DISCOVERY", name: "Discovery Engine", icon: Globe, desc: "Trending token feeds" },
    { id: "WHALES", name: "Whale Intelligence", icon: Users, desc: "Smart money trackers" },
    { id: "ALPHA", name: "Token Center", icon: TrendingUp, desc: "Verified trading signals" },
    { id: "FLOOR", name: "Community", icon: MessageSquare, desc: "Elite private discussions" },
    { id: "RISK", name: "Risk Center", icon: Shield, desc: "Automated contract audits" },
  ];

  // Auto cycle tabs unless hovered
  useEffect(() => {
    if (isHovered) {
      if (autoCycleRef.current) clearInterval(autoCycleRef.current);
      return;
    }

    autoCycleRef.current = setInterval(() => {
      setActiveTab((prev) => {
        const currentIndex = tabs.findIndex((t) => t.id === prev);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex].id as ModuleType;
      });
    }, 8000);

    return () => {
      if (autoCycleRef.current) clearInterval(autoCycleRef.current);
    };
  }, [isHovered]);

  return (
    <section id="showcase" className="py-24 bg-[#07090E] border-t border-slate-800/60 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest text-blue-500 font-bold block">
            Inside the Platform
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
            The Software is the Marketing
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-light">
            Explore the active terminal. See exactly what resources, signals, and insights are unlocked immediately after onboarding.
          </p>
        </div>

        {/* Desktop Interface Layout */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Tab selector column */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ModuleType)}
                  className={`w-full text-left px-5 py-4 rounded-xl transition-all flex items-start gap-4 border ${
                    isActive 
                      ? "bg-slate-900 border-slate-800 text-white shadow-md shadow-blue-500/5 translate-x-1" 
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                  }`}
                >
                  <div className={`p-2.5 rounded-lg border ${
                    isActive ? "bg-blue-600/10 border-blue-500/30 text-blue-400" : "bg-slate-900 border-slate-800 text-slate-500"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider">{tab.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{tab.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Render Active Mockup Canvas */}
          <div className="lg:col-span-8 bg-[#0D1117] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
            {/* Mockup Header Bar */}
            <div className="bg-slate-900/80 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
                </div>
                <div className="h-4 w-[1px] bg-slate-800 mx-2" />
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold font-mono">
                  cashix-terminal-v4.0
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] text-emerald-500 font-mono font-bold uppercase tracking-wider">
                  Live API stream
                </span>
              </div>
            </div>

            {/* Mockup Content Panel */}
            <div className="p-6 flex-grow flex flex-col justify-between text-left font-sans">
              <AnimatePresence mode="wait">
                {activeTab === "PULSE" && (
                  <motion.div
                    key="pulse"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 flex-grow flex flex-col justify-between"
                  >
                    {/* Stats Strip */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: "Market", val: "BULLISH", color: "text-emerald-400" },
                        { label: "Confidence", val: "88%", color: "text-white" },
                        { label: "Opp Score", val: "92", color: "text-blue-400" },
                        { label: "Alerts", val: "Active", color: "text-white" }
                      ].map((s) => (
                        <div key={s.label} className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">{s.label}</span>
                          <span className={`text-xs font-black mt-0.5 block ${s.color}`}>{s.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Featured Opp */}
                    <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 font-black">X</div>
                          <span className="text-xs font-black text-white">XRPz <span className="text-slate-500 text-[10px] font-bold">(Solana)</span></span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">Intel Score: 95</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Breaking out of 4-day accumulation base with 4.5x average volume multiplier. On-chain audits show locked LP and permanently revoked admin mint rights.
                      </p>
                    </div>

                    {/* Table overview mock */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Live Screen Indices</span>
                      <div className="border border-slate-800/60 rounded-xl overflow-hidden text-[10px]">
                        <div className="bg-slate-900/40 border-b border-slate-800/60 grid grid-cols-4 px-3 py-2 text-slate-500 font-bold uppercase tracking-wider">
                          <span>Asset</span>
                          <span className="text-center">Intel</span>
                          <span className="text-right">24h Change</span>
                          <span className="text-right">Liquidity</span>
                        </div>
                        <div className="divide-y divide-slate-800/40">
                          {[
                            { name: "XRPz", score: 95, change: "+32.4%", liq: "$480K" },
                            { name: "WARUME", score: 88, change: "+14.8%", liq: "$250K" },
                            { name: "FON", score: 81, change: "-4.2%", liq: "$1.2M" }
                          ].map((t) => (
                            <div key={t.name} className="grid grid-cols-4 px-3 py-2.5 font-semibold text-slate-300">
                              <span className="font-bold text-white">{t.name}</span>
                              <span className="text-center text-blue-400">{t.score}</span>
                              <span className={`text-right ${t.change.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>{t.change}</span>
                              <span className="text-right text-slate-400 font-mono">{t.liq}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "DISCOVERY" && (
                  <motion.div
                    key="discovery"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 flex-grow flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Real-time Profiles</span>
                        <span className="text-xs font-black text-white mt-0.5 block">Streaming DexScreener launches</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">2,842 Candidates / Min</span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { token: "BOSK", chain: "Solana", status: "Newly Launched", time: "12s ago", confidence: "High" },
                        { token: "CTO_KING", chain: "Solana", status: "Community Takeover", time: "24s ago", confidence: "Medium" },
                        { token: "PEPE_X", chain: "Base", status: "Boost Count Spike", time: "1m ago", confidence: "High" }
                      ].map((feed, idx) => (
                        <div key={idx} className="bg-slate-900/60 border border-slate-800/60 p-3.5 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-black text-blue-400">
                              {feed.token[0]}
                            </div>
                            <div className="space-y-0.5">
                              <h5 className="font-bold text-white">{feed.token}</h5>
                              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{feed.chain} • {feed.status}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-0.5">
                            <span className="text-[10px] text-slate-400 font-semibold block">{feed.time}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              feed.confidence === "High" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              Confidence: {feed.confidence}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "WHALES" && (
                  <motion.div
                    key="whales"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 flex-grow flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Live Smart Money Flow</span>
                      <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider font-mono">14 smart wallets active</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { address: "HkgDaQ...mp", action: "BUY", token: "XRPz", size: "$120K", duration: "2m ago" },
                        { address: "8TmUmB...mp", action: "BUY", token: "WARUME", size: "$45K", duration: "12m ago" },
                        { address: "FVQm2u...mp", action: "SELL", token: "PEPE", size: "$80K", duration: "18m ago" }
                      ].map((w, idx) => (
                        <div key={idx} className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl text-xs space-y-2">
                          <div className="flex justify-between font-bold">
                            <span className="text-blue-400 font-mono">{w.address}</span>
                            <span className={w.action === "BUY" ? "text-emerald-400" : "text-rose-500"}>{w.action}</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[11px]">
                            <span>Size: <b className="text-white font-mono">{w.size}</b></span>
                            <span>Asset: <b className="text-white">${w.token}</b></span>
                            <span className="text-slate-500">{w.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "ALPHA" && (
                  <motion.div
                    key="alpha"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 flex-grow flex flex-col justify-between"
                  >
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Terminal Alpha Signal Desk</span>

                    <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-xs space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <div>
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                            BUY SIGNAL ACTIVE
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">Post date: 15m ago</span>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-bold block">Entry Range</span>
                          <span className="text-sm font-black text-white font-mono block mt-0.5">$0.00042 - 0.00045</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-bold block">Target Price</span>
                          <span className="text-sm font-black text-emerald-400 font-mono block mt-0.5">$0.00150</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-bold block">Stop Loss</span>
                          <span className="text-sm font-black text-rose-500 font-mono block mt-0.5">$0.00028</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                        <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest block mb-1">AI RATIONALE</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Volume spikes indicate accumulation by smart money. Liquidity is locked, token contracts are verified, and whale buying patterns support target continuation.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "FLOOR" && (
                  <motion.div
                    key="floor"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 flex-grow flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">VIP Community</span>
                      <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider font-mono">142 traders online</span>
                    </div>

                    <div className="space-y-2.5 flex-grow overflow-hidden max-h-[220px]">
                      {[
                        { user: "whale_watcher", msg: "Locked LP is audited. XRPz looks safe for entry.", time: "12:45 PM" },
                        { user: "sol_maxi", msg: "Where is the contract address? Admin upload please!", time: "12:46 PM" },
                        { user: "COORDINATOR", msg: "🚨 NEW SIGNAL posted in Token Center for XRPz. Check target ranges.", time: "12:48 PM", isAdmin: true }
                      ].map((chat, idx) => (
                        <div key={idx} className="text-xs leading-normal">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className={`text-[10px] font-black ${chat.isAdmin ? "text-blue-400" : "text-slate-400"}`}>
                              {chat.user} {chat.isAdmin && "• ADMIN"}
                            </span>
                            <span className="text-[8px] text-slate-600 font-medium">{chat.time}</span>
                          </div>
                          <p className={`p-2 rounded-xl border ${
                            chat.isAdmin 
                              ? "bg-blue-600/5 border-blue-500/20 text-slate-200" 
                              : "bg-slate-900/60 border-slate-800/60 text-slate-400"
                          }`}>
                            {chat.msg}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "RISK" && (
                  <motion.div
                    key="risk"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5 flex-grow flex flex-col justify-between"
                  >
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Contract & Security Audit</span>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Honeypot Test", val: "SAFE", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" },
                        { label: "Liquidity Pool", val: "100% LOCKED", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" },
                        { label: "Admin Mint Rights", val: "REVOKED", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" },
                        { label: "Top-Wallet Concentration", val: "LOW (12%)", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" }
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${item.color}`}>
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">{item.label}</span>
                              <span className="text-xs font-black uppercase tracking-tight block">{item.val}</span>
                            </div>
                            <Icon className="w-5 h-5" />
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/80 p-3.5 rounded-xl text-[11px] text-slate-400 leading-normal flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        Contract methodology is derived deterministically from RPC bytecode traces and real-time holder allocation logs.
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
