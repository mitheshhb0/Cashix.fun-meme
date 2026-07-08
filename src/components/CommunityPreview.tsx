"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Trade {
  id: string;
  type: "BUY" | "SELL";
  user: string;
  amount: string;
  time: string;
}

export default function CommunityPreview() {
  const [trades, setTrades] = useState<Trade[]>([
    { id: "t1", type: "BUY", user: "0x7a...f68d", amount: "1.24 BNB", time: "12s ago" },
    { id: "t2", type: "SELL", user: "0x3c...d81a", amount: "0.45 BNB", time: "25s ago" },
    { id: "t3", type: "BUY", user: "0x9d...c42b", amount: "3.50 BNB", time: "42s ago" },
    { id: "t4", type: "BUY", user: "0xf1...e59c", amount: "0.85 BNB", time: "1m ago" },
    { id: "t5", type: "BUY", user: "0x4b...a27e", amount: "2.10 BNB", time: "2m ago" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const isBuy = Math.random() > 0.3; // 70% buys, 30% sells
      const randomUser = "0x" + Math.random().toString(16).substring(2, 6) + "..." + Math.random().toString(16).substring(2, 6);
      const randomAmount = (Math.random() * 4 + 0.1).toFixed(2) + " BNB";
      
      const newTrade: Trade = {
        id: Date.now().toString(),
        type: isBuy ? "BUY" : "SELL",
        user: randomUser,
        amount: randomAmount,
        time: "Just now"
      };

      setTrades((prev) => {
        const updatedPrev = prev.map((t) => {
          if (t.time === "Just now") return { ...t, time: "4s ago" };
          if (t.time === "4s ago") return { ...t, time: "8s ago" };
          if (t.time === "8s ago") return { ...t, time: "12s ago" };
          if (t.time === "12s ago") return { ...t, time: "20s ago" };
          if (t.time === "20s ago") return { ...t, time: "30s ago" };
          if (t.time === "30s ago") return { ...t, time: "1m ago" };
          return t;
        });
        
        return [newTrade, ...updatedPrev.slice(0, 5)];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="community" className="glass-card rounded-[2.5rem] p-6 lg:p-8 w-full overflow-hidden text-left scroll-mt-24">
      <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 text-white">
        Recent Trades
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C853] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00C853]"></span>
        </span>
      </h2>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase text-[#8A99AD] font-bold">
              <th className="pb-4 font-black">Type</th>
              <th className="pb-4 font-black">User Address</th>
              <th className="pb-4 font-black text-right">Amount (BNB)</th>
              <th className="pb-4 font-black text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white font-bold text-sm">
            <AnimatePresence initial={false}>
              {trades.map((trade) => (
                <motion.tr
                  key={trade.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-black tracking-wider ${
                        trade.type === "BUY"
                          ? "bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20"
                          : "bg-[#FF4D00]/10 text-[#FF4D00] border border-[#FF4D00]/20"
                      }`}
                    >
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-4 font-mono opacity-80">{trade.user}</td>
                  <td className="py-4 text-right text-white">{trade.amount}</td>
                  <td className="py-4 text-right text-[#8A99AD] font-medium">{trade.time}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </section>
  );
}
