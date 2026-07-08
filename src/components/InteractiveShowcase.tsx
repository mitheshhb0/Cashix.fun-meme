"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Check, Wallet, Coins, TrendingUp } from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
  isMe?: boolean;
}

export default function InteractiveShowcase() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m1", user: "DeFi_God", message: "Aping in 2 BNB, this chart is looking parabolic! 🔥", time: "12s ago" },
    { id: "m2", user: "whale_watcher", message: "Bonding curve is already at 69%, Raydium pool launch soon! 🚀", time: "25s ago" },
    { id: "m3", user: "sol_maxi", message: "Whales are accumulating, do not miss the launch window guys.", time: "45s ago" },
  ]);

  const [inputMsg, setInputMsg] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Social action states for verification
  const [followedX, setFollowedX] = useState(false);
  const [joinedTelegram, setJoinedTelegram] = useState(false);

  // SVG Chart State
  const [chartData, setChartData] = useState<number[]>([40, 50, 45, 60, 55, 70, 65, 80, 85, 95]);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; idx: number } | null>(null);

  // Stats State
  const [mcap, setMcap] = useState(42069);
  const [curveProgress, setCurveProgress] = useState(69);

  // Trade inputs
  const [buyAmount, setBuyAmount] = useState("0.1");

  // Chart coordinates calculation
  const width = 600;
  const height = 280;
  const padding = 30;

  const points = chartData.map((val, idx) => {
    const x = padding + (idx * (width - padding * 2)) / (chartData.length - 1);
    const y = height - padding - (val * (height - padding * 2)) / 100;
    return { x, y, val };
  });

  // SVG Path generator
  const getPathD = () => {
    if (points.length === 0) return "";
    return points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");
  };

  // SVG Gradient Area Path generator
  const getAreaD = () => {
    if (points.length === 0) return "";
    const path = getPathD();
    return `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  };

  // Add new points dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => {
        const lastVal = prev[prev.length - 1];
        const change = (Math.random() - 0.45) * 12; // bias upward
        const nextVal = Math.min(100, Math.max(10, Number((lastVal + change).toFixed(0))));
        
        // Dynamic market cap & progress updates
        setMcap((prevMcap) => Number((prevMcap * (1 + (change > 0 ? change / 250 : change / 400))).toFixed(0)));
        setCurveProgress((prevProg) => {
          if (prevProg >= 99) return 99;
          const addProgress = change > 0 ? Number((change / 12).toFixed(1)) : 0;
          return Math.min(99, Number((prevProg + addProgress).toFixed(1)));
        });

        return [...prev.slice(1), nextVal];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "You (Anon Degen)",
      message: inputMsg,
      time: "Just now",
      isMe: true
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMsg("");

    // Simulate community response
    setTimeout(() => {
      const responses = [
        "LFG!!! 🚀🚀🚀",
        "Direct buy button works seamlessly.",
        "We are sending this to 10M today.",
        "Aping more BNB right now! 💎"
      ];
      const randomResponse = {
        id: (Date.now() + 1).toString(),
        user: "dgen_helper",
        message: responses[Math.floor(Math.random() * responses.length)],
        time: "Just now"
      };
      setMessages((prev) => [...prev, randomResponse]);
    }, 1500);
  };

  const handleJoinChat = () => {
    setIsJoining(true);
    setTimeout(() => {
      setIsJoined(true);
      setIsJoining(false);
    }, 1200);
  };

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    const bAmt = Number(buyAmount);
    if (isNaN(bAmt) || bAmt <= 0) return;

    // Simulate ape-in effect
    setChartData((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = Math.min(100, updated[updated.length - 1] + 8);
      return updated;
    });

    setMcap((prev) => prev + Math.round(bAmt * 2400));
    setCurveProgress((prev) => Math.min(99, prev + Number((bAmt * 1.5).toFixed(1))));

    alert(`Successfully aped ${bAmt} BNB! Bonding curve progress updated.`);
  };

  return (
    <section id="chart" className="py-12 px-4 max-w-7xl mx-auto w-full scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Live Chart & Progress */}
        <div className="lg:col-span-8 space-y-8 text-left">
          <div className="glass-card rounded-[2.5rem] p-6 lg:p-8 flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8A99AD] font-bold">Market Momentum</span>
                <h2 className="text-3xl font-black uppercase text-white mt-1">Live Chart Ticker</h2>
              </div>
              <div className="bg-[#060913]/60 border border-white/5 rounded-2xl px-5 py-3 flex items-center gap-5">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#8A99AD] font-bold block">Market Cap</span>
                  <span className="text-xl font-black text-[#FFD600] gold-glow-text">${mcap.toLocaleString()}</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#8A99AD] font-bold block">Liquidity</span>
                  <span className="text-xl font-black text-[#00C853]">$28.4K</span>
                </div>
              </div>
            </div>

            {/* SVG Live Chart Canvas */}
            <div className="relative bg-[#060913]/40 border border-white/5 rounded-2xl p-4 overflow-hidden min-h-[300px]">
              <svg 
                viewBox={`0 0 ${width} ${height}`} 
                className="w-full h-full overflow-visible"
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Defs for glow filter and gradient area fill */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFD600" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#FFD600" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Grid horizontal lines */}
                {[0, 25, 50, 75, 100].map((gridVal) => {
                  const y = height - padding - (gridVal * (height - padding * 2)) / 100;
                  return (
                    <line
                      key={gridVal}
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.03)"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* SVG Area fill under path */}
                <path d={getAreaD()} fill="url(#chartGradient)" />

                {/* SVG Glowing Line path */}
                <motion.path
                  d={getPathD()}
                  fill="none"
                  stroke="#FFD600"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  layout
                />

                {/* Chart Nodes / Dots */}
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.idx === idx ? 8 : 4}
                    fill={hoveredPoint?.idx === idx ? "#FF4D00" : "#FFD600"}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, val: p.val, idx })}
                  />
                ))}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  className="absolute bg-[#0D1426] border border-[#FFD600]/30 shadow-xl rounded-xl p-2.5 text-xs font-black z-30 pointer-events-none"
                  style={{
                    left: `${(hoveredPoint.x / width) * 100}%`,
                    top: `${(hoveredPoint.y / height) * 100 - 15}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <span className="text-[#FFD600]">${(hoveredPoint.val * 420.69).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Bonding Curve Tracker */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-black uppercase text-white tracking-wide">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#00C853]" />
                  Bonding Curve Progress
                </span>
                <span className="text-[#FFD600]">{curveProgress}%</span>
              </div>
              <div className="w-full bg-[#060913]/60 rounded-full h-4 border border-white/5 overflow-hidden p-0.5">
                <motion.div
                  className="bg-gradient-to-r from-[#FFD600] via-[#00C853] to-[#00E5FF] h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${curveProgress}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <p className="text-[10px] text-[#8A99AD] font-bold leading-normal">
                When the bonding curve reaches 100%, liquidity will be locked and migrated to Raydium.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Ape-in & VIP Chat */}
        <div className="lg:col-span-4 space-y-8 text-left w-full">
          
          {/* Ape-in glass block */}
          <div className="glass-card rounded-[2.5rem] p-6 flex flex-col gap-5 w-full">
            <h3 className="text-xl font-black uppercase text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#FFD600]" />
              Quick Ape-In
            </h3>
            <form onSubmit={handleBuy} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#8A99AD] tracking-wider block mb-1">
                  Amount (BNB)
                </label>
                <div className="relative flex items-center bg-[#060913]/60 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-[#FFD600] transition-colors">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="bg-transparent border-0 text-white font-black text-lg focus:outline-none w-full placeholder:text-neutral-600"
                    placeholder="0.1"
                  />
                  <span className="font-black text-sm text-[#FFD600] shrink-0">BNB</span>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#FFD600] to-[#FF4D00] text-black font-black uppercase text-sm rounded-full hover:scale-102 transition-transform hover:shadow-[0_0_20px_rgba(255,214,0,0.3)] tracking-wider cursor-pointer text-center"
              >
                Ape In Now
              </button>
            </form>
          </div>

          {/* VIP Chat glass block */}
          <div className="glass-card rounded-[2.5rem] p-6 flex flex-col gap-4 w-full min-h-[340px] relative overflow-hidden">
            <h3 className="text-xl font-black uppercase text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <MessageSquare className="w-5 h-5 text-[#00E5FF]" />
              VIP Degen Chat
            </h3>

            {!isJoined ? (
              <div className="absolute inset-0 bg-[#0D1426]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center">
                <Wallet className="w-10 h-10 text-[#FFD600] animate-float mb-2" />
                <h4 className="text-base font-black uppercase text-white mb-1">Verify Social Actions</h4>
                <p className="text-[10px] text-[#8A99AD] font-bold leading-normal mb-4 max-w-[220px]">
                  Join our Telegram community and follow our Twitter account to unlock VIP Chat access.
                </p>
                
                <div className="flex flex-col gap-2 w-full max-w-[240px] mb-4">
                  <button
                    onClick={() => {
                      window.open("http://x.com/XRPz_meme", "_blank");
                      setFollowedX(true);
                    }}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      followedX
                        ? "bg-[#00C853]/10 border-[#00C853]/20 text-[#00C853]"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <span>1. Follow Twitter Account</span>
                    {followedX ? <Check className="w-3.5 h-3.5 text-[#00C853]" /> : <span className="text-[10px] opacity-60">→</span>}
                  </button>

                  <button
                    onClick={() => {
                      window.open("https://t.me/our_telegram", "_blank");
                      setJoinedTelegram(true);
                    }}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      joinedTelegram
                        ? "bg-[#00C853]/10 border-[#00C853]/20 text-[#00C853]"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <span>2. Join Telegram Group</span>
                    {joinedTelegram ? <Check className="w-3.5 h-3.5 text-[#00C853]" /> : <span className="text-[10px] opacity-60">→</span>}
                  </button>
                </div>

                <button
                  onClick={handleJoinChat}
                  disabled={isJoining || !followedX || !joinedTelegram}
                  className="w-full max-w-[240px] py-3 bg-[#00E5FF] disabled:bg-neutral-800 disabled:text-neutral-500 disabled:shadow-none text-black font-black uppercase text-xs rounded-full hover:scale-102 transition-all hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] tracking-wider cursor-pointer"
                >
                  {isJoining ? "Verifying..." : "Verify & Unlock Chat"}
                </button>
              </div>
            ) : null}

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[180px] scrollbar-none pr-1">
              {messages.map((m) => (
                <div key={m.id} className="text-xs text-left leading-normal font-bold">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`text-[10px] ${m.isMe ? "text-[#FFD600]" : "text-[#00E5FF]"} font-black`}>
                      {m.user}
                    </span>
                    <span className="text-[9px] text-[#8A99AD] font-medium">{m.time}</span>
                  </div>
                  <p className="text-white/80 font-medium bg-white/5 border border-white/5 px-3 py-2 rounded-2xl rounded-tl-none">
                    {m.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Chat Send Input */}
            <form onSubmit={handleSend} className="relative flex items-center bg-[#060913]/60 border border-white/10 rounded-2xl px-4 py-2 mt-auto focus-within:border-[#00E5FF] transition-colors">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Send a degen shoutout..."
                className="bg-transparent border-0 text-white font-bold text-xs focus:outline-none w-full placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-[#00E5FF] text-black flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
