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

const EthereumIcon = () => (
  <svg className="w-4 h-4 text-sky-400" viewBox="0 0 784 1277" fill="currentColor">
    <path d="M392 0L383.5 29V868.5L392 877L784 645L392 0Z" fillOpacity="0.7" />
    <path d="M392 0L0 645L392 877V469.5V0Z" fillOpacity="0.9" />
    <path d="M392 956L387 962V1271.5L392 1277L784 734L392 956Z" fillOpacity="0.7" />
    <path d="M392 1277V956L0 734L392 1277Z" fillOpacity="0.9" />
  </svg>
);

const SolanaIcon = () => (
  <svg className="w-3.5 h-3.5 text-teal-400" viewBox="0 0 512 512" fill="currentColor">
    <path d="M439 122c-7-7-16-11-26-11H73c-15 0-26 15-21 29l29 90c7 7 16 11 26 11h340c15 0 26-15 21-29l-29-90zm-54 116c-7-7-16-11-26-11H19c-15 0-26 15-21 29l29 90c7 7 16 11 26 11h340c15 0 26-15 21-29l-29-90zm54 116c-7-7-16-11-26-11H73c-15 0-26 15-21 29l29 90c7 7 16 11 26 11h340c15 0 26-15 21-29l-29-90z" />
  </svg>
);

const BitcoinIcon = () => (
  <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.6 12.6c-.3-2.1-1.4-3.8-3.1-4.8c-.8-.5-1.7-.8-2.6-.9c.4-.6.7-1.3.7-2.1c0-2-1.6-3.6-3.6-3.6c-.7 0-1.3.2-1.9.5V.5c0-.3-.2-.5-.5-.5h-2c-.3 0-.5.2-.5.5v1.3H8.3V.5C8.3.2 8.1 0 7.8 0H5.7c-.3 0-.5.2-.5.5v1.3H4c-.3 0-.5.2-.5.5v1.7c0 .3.2.5.5.5h1.2v14.4H4c-.3 0-.5.2-.5.5v1.7c0 .3.2.5.5.5h1.2v1.3c0 .3.2.5.5.5h2.1c.3 0 .5-.2.5-.5v-1.3h1.8v1.3c0 .3.2.5.5.5h2c.3 0 .5-.2.5-.5v-1.3c3.4 0 6.1-2.7 6.1-6.1c0-1.8-1-3.4-2.5-4.3c1.3-.7 2.1-2.1 2.1-3.6c0-.5-.1-1-.3-1.4zm-11.4-5h3.4c.9 0 1.6.7 1.6 1.6c0 .9-.7 1.6-1.6 1.6h-3.4V7.6zm4.4 8.7h-4.4v-3.7h4.4c1 0 1.9.8 1.9 1.9c0 1-.8 1.8-1.9 1.8z" />
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
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between relative overflow-x-hidden font-sans max-w-[480px] mx-auto border-x border-[#2B3139] shadow-2xl pb-8 select-none">
      
      {/* Background Mesh/Stars Grid Canvas */}
      <NetworkBackground />

      {/* Floating High-Fidelity Coin SVGs with Glowing borders */}
      <div className="absolute top-16 right-10 w-9 h-9 rounded-full bg-[#12161A] border border-[#2B3139]/80 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.25)] text-[#38BDF8] select-none font-bold animate-bounce z-10">
        <EthereumIcon />
      </div>
      <div className="absolute top-32 left-6 w-9 h-9 rounded-full bg-[#12161A] border border-[#2B3139]/80 flex items-center justify-center shadow-[0_0_12px_rgba(20,241,149,0.25)] text-[#20F195] select-none font-bold animate-pulse z-10">
        <SolanaIcon />
      </div>
      <div className="absolute top-48 right-6 w-9 h-9 rounded-full bg-[#12161A] border border-[#2B3139]/80 flex items-center justify-center shadow-[0_0_15px_rgba(240,185,11,0.25)] text-[#F0B90B] select-none font-bold animate-bounce z-10">
        <BitcoinIcon />
      </div>

      <div className="w-full flex-grow flex flex-col justify-between p-6 relative z-10 space-y-7">
        
        {/* Header Logo */}
        <div className="flex items-center gap-2.5 px-1 select-none text-left shrink-0">
          <div className="w-9 h-9 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.2)]">
            <svg className="w-4.5 h-4.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 8C17 5 14.5 4 12 4C7.5 4 4 7.5 4 12C4 16.5 7.5 20 12 20C14.5 20 17 19 18 16" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-[12px] font-black uppercase text-white tracking-widest leading-none">
              CASHIX
            </h2>
            <span className="text-[7.5px] uppercase tracking-widest text-[#8A99AD] font-extrabold block mt-1">Terminal V4</span>
          </div>
        </div>

        {/* Hero Title Block */}
        <div className="text-center space-y-3 select-none pt-2 shrink-0">
          <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-blue-500 block leading-none">
            AI POWERED
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-none">
            MEME COIN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500">INTELLIGENCE</span>
          </h1>
          <p className="text-[#8A99AD] text-[10.5px] leading-relaxed max-w-xs mx-auto font-semibold">
            Real-time market scanning, AI scoring, smart money tracking & on-chain intelligence — all in one terminal.
          </p>
        </div>

        {/* 3 Columns Highlights Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-center select-none shrink-0">
          {[
            { title: "LIVE", desc: "Market Scanning", val: "24/7 Real-time", icon: Zap, color: "text-[#0ECB81] bg-[#0ECB81]/5 border-[#0ECB81]/15" },
            { title: "AI SCORE", desc: "Advanced Algorithm", val: "40+ Factors", icon: Brain, color: "text-[#A855F7] bg-[#A855F7]/5 border-[#A855F7]/15" },
            { title: "SMART", desc: "Risk Protection", val: "Stay Ahead", icon: Shield, color: "text-[#38BDF8] bg-[#38BDF8]/5 border-[#38BDF8]/15" }
          ].map((h, i) => {
            const Icon = h.icon;
            return (
              <div key={i} className="bg-[#12161A] border border-[#2B3139] rounded-xl p-3.5 flex flex-col items-center justify-center space-y-1">
                <Icon className={`w-4.5 h-4.5 ${i === 0 ? "text-[#0ECB81]" : i === 1 ? "text-[#A855F7]" : "text-[#38BDF8]"}`} />
                <span className="text-[9px] font-black uppercase tracking-wide text-white block pt-1 leading-none">{h.title}</span>
                <span className="text-[7.5px] text-slate-500 font-extrabold block leading-tight mt-0.5">{h.desc}</span>
                <span className={`text-[7.5px] font-extrabold block mt-1.5 leading-none ${i === 0 ? "text-[#0ECB81]" : i === 1 ? "text-[#A855F7]" : "text-[#38BDF8]"}`}>
                  {h.val}
                </span>
              </div>
            );
          })}
        </div>

        {/* Central Sign-In Container */}
        <div className="bg-[#12161A] border border-[#2B3139] rounded-[24px] p-6 space-y-6 shadow-2xl relative text-center">
          
          <div className="space-y-1.5">
            <span className="text-[8.5px] font-black uppercase tracking-widest text-blue-500 block leading-none">
              WELCOME BACK
            </span>
            <h3 className="text-xl font-black uppercase text-white tracking-wide leading-none pt-1">
              Enter Terminal
            </h3>
            <p className="text-[10px] text-[#8A99AD] leading-relaxed max-w-xs mx-auto font-semibold">
              Access the private, members-only intelligence platform for serious meme coin traders.
            </p>
          </div>

          {/* Feedback error messages */}
          {errorMsg && (
            <div className="text-[9.5px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold p-3.5 rounded-xl flex items-start gap-2.5 text-left shadow-md">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Button Action - Premium custom gradient */}
          <div className="pt-1">
            <button
              onClick={handleGoogleLogin}
              disabled={status === "authenticating" || status === "success"}
              className={`w-full py-4.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-200 flex items-center justify-center cursor-pointer border select-none ${
                status === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg"
                  : status === "authenticating"
                  ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 border-blue-500/30 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:scale-[1.01]"
              }`}
            >
              {status === "idle" && (
                <>
                  <div className="w-5.5 h-5.5 mr-3 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                  </div>
                  CONTINUE WITH GOOGLE
                </>
              )}
              {status === "authenticating" && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-650 border-t-slate-350 rounded-full animate-spin" />
                  <span>AUTHENTICATING...</span>
                </div>
              )}
              {status === "success" && (
                <span>ENTERING TERMINAL...</span>
              )}
              {status === "error" && (
                <>
                  <div className="w-5.5 h-5.5 mr-3 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                  </div>
                  CONTINUE WITH GOOGLE
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

          {/* Value Props 4 Columns list */}
          <div className="grid grid-cols-4 gap-2 text-center select-none pt-1">
            {[
              { label: "Secure", sub: "Bank-level encryption", icon: Lock, color: "text-[#0ECB81] bg-[#0ECB81]/5 border-[#0ECB81]/15" },
              { label: "Fast Access", sub: "One-click login", icon: Zap, color: "text-[#A855F7] bg-[#A855F7]/5 border-[#A855F7]/15" },
              { label: "Members Only", sub: "Exclusive intelligence", icon: Users, color: "text-[#38BDF8] bg-[#38BDF8]/5 border-[#38BDF8]/15" },
              { label: "Privacy First", sub: "Your data is protected", icon: ShieldCheck, color: "text-[#0ECB81] bg-[#0ECB81]/5 border-[#0ECB81]/15" }
            ].map((prop, idx) => {
              const PropIcon = prop.icon;
              return (
                <div key={idx} className="flex flex-col items-center space-y-1.5">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${prop.color}`}>
                    <PropIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-slate-200 uppercase leading-none block">{prop.label}</span>
                    <span className="text-[6.5px] text-slate-500 font-extrabold leading-tight block">{prop.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Telegram Request Access link */}
          <div className="pt-2 text-center text-[10px] font-extrabold text-slate-400">
            New to Cashix?{" "}
            <a href="https://t.me/cashix_bot" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 font-black inline-flex items-center gap-1 cursor-pointer">
              Request Access <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Legal / Policy Note */}
        <div className="text-center text-[8.5px] text-slate-500 leading-relaxed font-semibold shrink-0 select-none pb-2 flex items-center justify-center gap-1 z-10">
          <span>🔒 By continuing, you agree to our</span>
          <a href="#" className="underline hover:text-white">Terms of Service</a>
          <span>and</span>
          <a href="#" className="underline hover:text-white">Privacy Policy</a>
          <span>.</span>
        </div>

      </div>

      {/* Bottom Purple Wave Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none z-0">
        <svg className="w-full h-full" viewBox="0 0 480 100" preserveAspectRatio="none" fill="none">
          <path
            d="M0 80 C 120 40, 240 100, 360 50 C 420 25, 450 60, 480 80 L 480 100 L 0 100 Z"
            fill="url(#purpleGlow)"
            className="opacity-40"
          />
          <path
            d="M0 60 C 100 80, 200 30, 300 70 C 380 90, 430 40, 480 60 L 480 100 L 0 100 Z"
            fill="url(#purpleGlow)"
            className="opacity-20"
          />
          <defs>
            <linearGradient id="purpleGlow" x1="240" y1="20" x2="240" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#4F46E5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#07090E" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
