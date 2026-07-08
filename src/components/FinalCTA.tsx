"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertCircle, X, Wallet, ShieldCheck } from "lucide-react";

export default function FinalCTA() {
  const [handle, setHandle] = useState("");
  const [checkStatus, setCheckStatus] = useState<"idle" | "checking" | "available" | "error">("idle");
  const [showModal, setShowModal] = useState(false);
  const [claimCounter, setClaimCounter] = useState(92491);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Increment counter occasionally to simulate live registration
  useEffect(() => {
    const interval = setInterval(() => {
      setClaimCounter((c) => c + Math.floor(Math.random() * 2) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (val: string) => {
    setHandle(val);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!val || val.length < 3) {
      setCheckStatus("idle");
      return;
    }

    // Regex check for alphanumeric
    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(val)) {
      setCheckStatus("error");
      return;
    }

    setCheckStatus("checking");

    timeoutRef.current = setTimeout(() => {
      const reserved = ["satoshi", "vitalik", "admin", "cashix", "moderator"];
      const isReserved = reserved.includes(val.toLowerCase());
      setCheckStatus(isReserved ? "error" : "available");
    }, 600);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkStatus === "available") {
      setShowModal(true);
    }
  };

  return (
    <section id="claim-handle" className="relative py-24 bg-bg-primary overflow-hidden border-t border-border-custom/50">
      {/* Dynamic gradients in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-accent-primary/10 to-accent-secondary/5 blur-[160px] pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-60 h-60 rounded-full bg-accent-primary/10 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 uppercase text-[#FFD600] gold-glow-text"
        >
          Claim Your Cashix Handle Today
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-text-secondary max-w-lg mx-auto text-sm md:text-base font-light mb-12"
        >
          Reserve your early adopter handle in the Cashix army. Unlock priority access to our upcoming whitelist channels and community contests.
        </motion.p>

        {/* Form panel */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="p-8 rounded-2xl glass-panel relative border border-border-custom/80 shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-xl mx-auto overflow-hidden bg-[#0D1426]/60 backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <div className="relative flex items-center bg-bg-primary border border-border-custom focus-within:border-accent-primary rounded-full px-5 py-2.5 transition-colors duration-300">
              <span className="text-text-secondary text-sm font-medium tracking-tight pr-1 shrink-0 font-mono select-none">
                cashix.fun/
              </span>
              <input
                type="text"
                value={handle}
                onChange={(e) => handleInputChange(e.target.value.trim())}
                placeholder="yourhandle"
                className="bg-transparent border-0 text-text-primary text-sm font-semibold focus:outline-none w-full placeholder:text-text-secondary/50 font-mono"
                maxLength={20}
              />
              {/* Checking indicator icon */}
              <div className="shrink-0 ml-2">
                {checkStatus === "checking" && (
                  <div className="w-5 h-5 border-2 border-accent-secondary/20 border-t-accent-secondary rounded-full animate-spin" />
                )}
                {checkStatus === "available" && (
                  <CheckCircle2 className="w-5 h-5 text-accent-success" />
                )}
                {checkStatus === "error" && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>

            {/* Availability Status Messages */}
            <div className="h-6 text-xs text-left px-4">
              <AnimatePresence mode="wait">
                {checkStatus === "checking" && (
                  <motion.span
                    key="checking"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-accent-secondary font-mono"
                  >
                    Resolving on registry ledger...
                  </motion.span>
                )}
                {checkStatus === "available" && (
                  <motion.span
                    key="available"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-accent-success font-semibold"
                  >
                    ✔ cashix.fun/{handle} is available to claim.
                  </motion.span>
                )}
                {checkStatus === "error" && (
                  <motion.span
                    key="error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 font-medium"
                  >
                    {handle.length < 3
                      ? "Handle must be at least 3 characters."
                      : !/^[a-zA-Z0-9_]+$/.test(handle)
                      ? "Only letters, numbers, and underscores allowed."
                      : `✗ cashix.fun/${handle} is already reserved.`}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Claim button */}
            <motion.button
              type="submit"
              disabled={checkStatus !== "available"}
              whileHover={{ scale: checkStatus === "available" ? 1.05 : 1 }}
              whileTap={{ scale: checkStatus === "available" ? 0.95 : 1 }}
              className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all duration-300 ${
                checkStatus === "available"
                  ? "bg-gradient-to-r from-accent-primary to-accent-secondary text-black shadow-[0_0_20px_rgba(255,214,0,0.3)]"
                  : "bg-bg-secondary border border-border-custom text-text-secondary cursor-not-allowed"
              }`}
            >
              Claim Handle
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          {/* Social Proof statistic */}
          <p className="text-[11px] text-text-secondary mt-6 font-mono">
            🔥 <strong className="text-text-primary">{claimCounter.toLocaleString()}</strong> handles claimed. Setup settled gaslessly.
          </p>
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md p-6 rounded-2xl glass-panel relative border-accent-success/30 shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-10 text-center bg-[#0D1426] border border-white/10"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1.5 text-text-secondary hover:text-text-primary rounded-full hover:bg-bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-accent-success/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-success/40 animate-bounce">
                <ShieldCheck className="w-7 h-7 text-accent-success" />
              </div>

              <h3 className="text-xl font-bold text-text-primary mb-2">Handle Reserved!</h3>
              <p className="text-xs text-text-secondary leading-relaxed font-light mb-6">
                The name <strong className="text-text-primary font-semibold">cashix.fun/{handle}</strong> has been temporarily locked under your session signature. Connect your wallet to write this record permanently on-chain.
              </p>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255,214,0,0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-black font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-5 h-5" />
                  Connect Wallet to Claim
                </motion.button>
                <button
                  onClick={() => setShowModal(false)}
                  className="py-2.5 rounded-xl border border-border-custom bg-transparent text-text-secondary hover:text-text-primary font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel & Release Handle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
