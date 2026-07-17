"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, Sparkles, Zap, TrendingUp, AlertTriangle, Lock, Users, ShieldCheck, Brain, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// ─── SVG Google Icon ─────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// ─── GPU-Accelerated Canvas Background with Flowing Packets ────────────────
function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const nodeCount = Math.min(45, Math.floor((width * height) / 16000));
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    for (let i = 0; i < nodeCount; i++) {
      const isGreen = Math.random() > 0.6;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 2 + 1.2,
        color: isGreen ? "rgba(16, 185, 129, 0.3)" : "rgba(59, 130, 246, 0.3)",
      });
    }

    // Active flowing data packets along connecting links
    interface Packet {
      startIdx: number;
      endIdx: number;
      progress: number;
      speed: number;
      color: string;
    }
    const packets: Packet[] = [];

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle Background Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.008)";
      ctx.lineWidth = 0.8;
      const spacing = 50;
      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Candlesticks outlines in background
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx.lineWidth = 1;
      const columns = 5;
      const colWidth = width / columns;
      for (let i = 1; i < columns; i++) {
        const x = i * colWidth + Math.sin(i * 123) * 15;
        const wickTop = height * 0.25 + Math.sin(i * 99) * 40;
        const wickBottom = height * 0.75 - Math.cos(i * 44) * 40;
        ctx.beginPath();
        ctx.moveTo(x, wickTop);
        ctx.lineTo(x, wickBottom);
        ctx.stroke();

        ctx.fillStyle = i % 2 === 0 ? "rgba(16, 185, 129, 0.025)" : "rgba(239, 68, 68, 0.025)";
        const bodyHeight = (wickBottom - wickTop) * 0.4;
        ctx.fillRect(x - 6, wickTop + bodyHeight * 0.6, 12, bodyHeight);
      }

      // Update & Draw Nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      // Draw Links and build potential paths for packets
      ctx.lineWidth = 0.5;
      const connectionThreshold = 140;
      const validLinks: Array<{ i: number; j: number }> = [];

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionThreshold) {
            validLinks.push({ i, j });
            const alpha = (1 - dist / connectionThreshold) * 0.06;
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Randomly spawn packets on active links
      if (validLinks.length > 0 && packets.length < 15 && Math.random() < 0.05) {
        const link = validLinks[Math.floor(Math.random() * validLinks.length)];
        const nodeA = nodes[link.i];
        packets.push({
          startIdx: link.i,
          endIdx: link.j,
          progress: 0,
          speed: Math.random() * 0.008 + 0.004,
          color: nodeA.color.replace("0.3", "0.6"),
        });
      }

      // Update & Draw Packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          packets.splice(i, 1);
          continue;
        }

        const start = nodes[p.startIdx];
        const end = nodes[p.endIdx];

        if (start && end) {
          const px = start.x + (end.x - start.x) * p.progress;
          const py = start.y + (end.y - start.y) * p.progress;

          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── Main Portal Component ──────────────────────────────────────────────────
export default function Login() {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();

  const [status, setStatus] = useState<"idle" | "authenticating" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user && status === "idle") {
      router.push("/dashboard");
    }
  }, [user, router, status]);

  const handleGoogleLogin = async () => {
    if (status === "authenticating" || status === "success") return;
    
    setStatus("authenticating");
    setErrorMsg("");

    try {
      await signInWithGoogle();
      setStatus("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    } catch (error: any) {
      console.error("Google login failure:", error);
      setStatus("error");
      
      let msg = error.message || "Failed to connect Google account. Please try again.";
      if (error.code === "auth/popup-closed-by-user") {
        msg = "Popup closed before authentication finished. Please try again.";
      } else if (
        error.code === "auth/internal-error" || 
        error.code === "auth/network-request-failed" ||
        error.message?.includes("internal-error") || 
        error.message?.includes("network-request-failed")
      ) {
        msg = "Google Auth connection failed or was blocked by the browser. Please check if an adblocker, Brave Shields, or privacy extension is blocking scripts from 'apis.google.com', then disable it and try again.";
      }
      setErrorMsg(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-start relative overflow-x-hidden font-sans max-w-[480px] mx-auto border-x border-[#2B3139] shadow-2xl pb-6">
      <NetworkBackground />

      {/* Floating Coin icons */}
      <div className="absolute top-16 right-10 w-8 h-8 rounded-full bg-[#12161A] border border-[#2B3139]/80 flex items-center justify-center text-[10px] shadow-[0_0_15px_rgba(56,189,248,0.2)] text-[#38BDF8] select-none font-bold animate-bounce">
        Ξ
      </div>
      <div className="absolute top-28 left-6 w-7 h-7 rounded-full bg-[#12161A] border border-[#2B3139]/80 flex items-center justify-center text-[8px] shadow-[0_0_12px_rgba(168,85,247,0.2)] text-[#A855F7] select-none font-bold animate-pulse">
        S
      </div>
      <div className="absolute top-48 right-6 w-8 h-8 rounded-full bg-[#12161A] border border-[#2B3139]/80 flex items-center justify-center text-[10px] shadow-[0_0_15px_rgba(240,185,11,0.2)] text-[#F0B90B] select-none font-bold animate-bounce">
        ฿
      </div>

      <div className="w-full flex-grow flex flex-col justify-between p-5 relative z-10 space-y-6">
        
        {/* Header Logo */}
        <div className="flex items-center gap-2 px-1 select-none text-left shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-base font-black text-white font-sans leading-none">C</span>
          </div>
          <div>
            <h2 className="text-xs font-black uppercase text-white tracking-widest leading-none">
              CASHIX
            </h2>
            <span className="text-[7.5px] uppercase tracking-widest text-slate-500 font-bold block mt-0.5">Terminal v4</span>
          </div>
        </div>

        {/* Hero Block */}
        <div className="text-center space-y-3.5 select-none pt-4 shrink-0">
          <span className="text-[9.5px] font-black uppercase tracking-widest text-blue-500 block">
            AI Powered
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white leading-none">
            Meme Coin <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Intelligence</span>
          </h1>
          <p className="text-[#8A99AD] text-[10.5px] leading-relaxed max-w-xs mx-auto font-semibold">
            Real-time market scanning, AI scoring, smart money tracking & on-chain intelligence — all in one terminal.
          </p>
        </div>

        {/* 3 highlights row */}
        <div className="grid grid-cols-3 gap-2 text-center select-none shrink-0">
          {[
            { title: "LIVE", desc: "Market Scanning", val: "24/7 Real-time", icon: Zap, color: "text-[#0ECB81] bg-[#0ECB81]/5 border-[#0ECB81]/15" },
            { title: "AI SCORE", desc: "Advanced Algorithm", val: "40+ Factors", icon: Brain, color: "text-[#A855F7] bg-[#A855F7]/5 border-[#A855F7]/15" },
            { title: "SMART", desc: "Risk Protection", val: "Stay Ahead", icon: Shield, color: "text-[#38BDF8] bg-[#38BDF8]/5 border-[#38BDF8]/15" }
          ].map((h, i) => {
            const Icon = h.icon;
            return (
              <div key={i} className="bg-[#12161A] border border-[#2B3139] rounded-xl p-3.5 flex flex-col items-center justify-center space-y-1">
                <Icon className={`w-4 h-4 ${i === 0 ? "text-[#0ECB81]" : i === 1 ? "text-[#A855F7]" : "text-[#38BDF8]"}`} />
                <span className="text-[9px] font-black uppercase tracking-wide text-white block pt-1 leading-none">{h.title}</span>
                <span className="text-[7.5px] text-slate-500 font-bold block leading-tight mt-0.5">{h.desc}</span>
                <span className={`text-[7.5px] font-bold block mt-1 leading-none ${i === 0 ? "text-[#0ECB81]" : i === 1 ? "text-[#A855F7]" : "text-[#38BDF8]"}`}>
                  {h.val}
                </span>
              </div>
            );
          })}
        </div>

        {/* Auth form card */}
        <div className="bg-[#12161A] border border-[#2B3139] rounded-2xl p-5.5 space-y-5 shadow-2xl relative text-center">
          
          <div className="space-y-1.5">
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 block">
              Welcome Back
            </span>
            <h3 className="text-xl font-black uppercase text-white tracking-wide">
              Enter Terminal
            </h3>
            <p className="text-[10px] text-[#8A99AD] leading-relaxed max-w-xs mx-auto font-medium">
              Access the private, members-only intelligence platform for serious meme coin traders.
            </p>
          </div>

          {/* Feedback error messages */}
          {errorMsg && (
            <div className="text-[9.5px] bg-rose-500/10 border border-rose-500/20 text-rose-450 font-semibold p-3.5 rounded-xl flex items-start gap-2 text-left shadow-md">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-450" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google login Button */}
          <div className="pt-1">
            <button
              onClick={handleGoogleLogin}
              disabled={status === "authenticating" || status === "success"}
              className={`w-full py-4.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center cursor-pointer border select-none ${
                status === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg"
                  : status === "authenticating"
                  ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-855 border-blue-500/30 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:scale-[1.01]"
              }`}
            >
              {status === "idle" && (
                <>
                  <div className="w-5 h-5 mr-2.5 rounded-full bg-white flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-blue-600 font-sans font-black">G</span>
                  </div>
                  Continue with Google
                </>
              )}
              {status === "authenticating" && (
                <div className="flex items-center gap-2 font-black">
                  <div className="w-4 h-4 border-2 border-slate-650 border-t-slate-350 rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              )}
              {status === "success" && (
                <span className="font-black">Entering Terminal...</span>
              )}
              {status === "error" && (
                <>
                  <div className="w-5 h-5 mr-2.5 rounded-full bg-white flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-blue-600 font-sans font-black">G</span>
                  </div>
                  Continue with Google
                </>
              )}
            </button>
          </div>

          {/* Separator line */}
          <div className="relative flex py-1 items-center justify-center text-[8.5px] font-black uppercase text-slate-500">
            <div className="flex-grow border-t border-[#2B3139]/60"></div>
            <span className="flex-shrink mx-3">OR</span>
            <div className="flex-grow border-t border-[#2B3139]/60"></div>
          </div>

          {/* Value props 4 columns list */}
          <div className="grid grid-cols-4 gap-1.5 text-center select-none pt-1">
            {[
              { label: "Secure", sub: "Bank-level encryption", icon: Lock, color: "text-[#0ECB81]" },
              { label: "Fast Access", sub: "One-click login", icon: Zap, color: "text-[#A855F7]" },
              { label: "Members Only", sub: "Exclusive intelligence", icon: Users, color: "text-[#38BDF8]" },
              { label: "Privacy First", sub: "Your data is protected", icon: ShieldCheck, color: "text-[#0ECB81]" }
            ].map((prop, idx) => {
              const PropIcon = prop.icon;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`p-1.5 rounded bg-slate-900 border border-[#2B3139] ${prop.color} shrink-0`}>
                    <PropIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[8px] font-black text-slate-200 uppercase mt-1 leading-none">{prop.label}</span>
                  <span className="text-[6.5px] text-slate-500 font-bold leading-tight block mt-0.5">{prop.sub}</span>
                </div>
              );
            })}
          </div>

          {/* Footer details link */}
          <div className="pt-2 text-center text-[9.5px] font-bold text-slate-500">
            New to Cashix?{" "}
            <a href="https://t.me/cashix_bot" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-black inline-flex items-center gap-0.5">
              Request Access <ArrowRight className="w-3 h-3" />
            </a>
          </div>

        </div>

        {/* Legal / Policy Note */}
        <div className="text-center text-[8.5px] text-slate-500 leading-relaxed font-semibold shrink-0 select-none pb-2 flex items-center justify-center gap-1">
          <span>🔒 By continuing, you agree to our</span>
          <a href="#" className="underline hover:text-white">Terms of Service</a>
          <span>and</span>
          <a href="#" className="underline hover:text-white">Privacy Policy</a>
          <span>.</span>
        </div>

      </div>
    </div>
  );
}
