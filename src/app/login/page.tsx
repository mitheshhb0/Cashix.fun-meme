"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, Sparkles, Zap, TrendingUp, AlertTriangle } from "lucide-react";
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
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col md:flex-row relative overflow-hidden font-sans">
      
      {/* Immersive Left Side Visual Panel - Custom Gradient for Contrast */}
      <div className="md:w-[60%] relative flex flex-col justify-between p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-800/80 bg-gradient-to-br from-[#0F1422] via-[#0A0E18] to-[#07090E] overflow-hidden min-h-[45vh] md:min-h-screen">
        <NetworkBackground />
        
        {/* Brand Tag */}
        <Link href="/" className="flex items-center gap-2.5 hover:text-white transition-colors w-fit relative z-10">
          <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800 shadow-md">
            <span className="text-sm font-black text-white font-mono leading-none">$</span>
          </div>
          <div>
            <h2 className="text-sm font-black uppercase text-white tracking-tighter leading-none">
              CASHIX
            </h2>
            <span className="text-[7px] uppercase tracking-widest text-slate-500 font-bold block mt-0.5">Terminal v4</span>
          </div>
        </Link>

        {/* Mid section: Floating mock data cards with high glassmorphism */}
        <div className="hidden sm:flex flex-col gap-4 max-w-sm my-auto pl-2 relative z-10 select-none">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-[#0D1426]/55 border border-white/10 p-4 rounded-xl flex items-center justify-between shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 font-bold font-mono">X</div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">XRPz</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Active Stream</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-black text-emerald-400 block">+32.4%</span>
              <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider block mt-0.5">Score: 95</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-[#0D1426]/55 border border-white/10 p-4 rounded-xl flex items-center justify-between shadow-2xl backdrop-blur-md ml-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400 font-bold">🐋</div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Whale Trace</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Smart Inflows</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-black text-blue-400 block">$120,000</span>
              <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider block mt-0.5">Asset: PEPE</span>
            </div>
          </motion.div>
        </div>

        {/* Footer info tag */}
        <div className="relative z-10">
          <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">
            AI Meme Coin Intelligence Platform
          </span>
        </div>
      </div>

      {/* Sleek Right Side Authentication Panel - Matte Dark Background */}
      <div className="md:w-[40%] flex flex-col justify-center p-8 md:p-12 bg-[#07090E] relative min-h-[55vh] md:min-h-screen">
        <div className="max-w-sm w-full mx-auto space-y-8 text-left">
          
          {/* Header */}
          <div className="space-y-3">
            <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-450 uppercase tracking-tight">
              Enter Terminal
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Access the private, members-only intelligence platform for meme coin traders. No complex forms. One-click entry.
            </p>
          </div>

          {/* Feedback error messages */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] bg-rose-500/10 border border-rose-500/20 text-rose-450 font-semibold p-4 rounded-xl flex items-start gap-2.5 shadow-md"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Google Button Action - Premium Custom Styles */}
          <div className="space-y-4 pt-2">
            <button
              onClick={handleGoogleLogin}
              disabled={status === "authenticating" || status === "success"}
              className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center cursor-pointer border select-none ${
                status === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg"
                  : status === "authenticating"
                  ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-[#0E1320] border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:scale-[1.01]"
              }`}
            >
              {status === "idle" && (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
              {status === "authenticating" && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-slate-350 rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              )}
              {status === "success" && (
                <span>Entering Terminal...</span>
              )}
              {status === "error" && (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>
          </div>

          {/* Legal / Policy Note */}
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
            By continuing, you agree to our platform{" "}
            <a href="#" className="underline text-slate-455 hover:text-white">Terms of Service</a> and{" "}
            <a href="#" className="underline text-slate-455 hover:text-white">Privacy Policy</a>.
          </p>

        </div>
      </div>
      
    </div>
  );
}
