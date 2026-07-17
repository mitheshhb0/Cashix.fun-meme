"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function FinalCTA() {
  const { user } = useAuth();

  return (
    <section className="relative py-16 bg-[#07090E] overflow-hidden border-t border-slate-800/60 select-none">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Blue Gradient Mesh Card */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-850 p-8 md:p-14 text-center shadow-2xl border border-blue-500/30">
          
          {/* Subtle Grid Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-80" />
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
              Ready to Trade Smarter?
            </h2>
            <p className="text-blue-100 text-xs md:text-sm font-semibold max-w-md mx-auto leading-relaxed">
              Join thousands of traders using Cashix.fun to find the next 100x opportunities.
            </p>

            <div className="pt-4 flex items-center justify-center">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="px-8 py-3.5 bg-white hover:bg-slate-100 text-blue-600 font-extrabold uppercase text-[11px] tracking-wider rounded-xl transition-all shadow-xl cursor-pointer hover:scale-[1.02]"
              >
                Launch Cashix Terminal 🚀
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
