"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function FinalCTA() {
  const { user } = useAuth();

  return (
    <section className="relative py-20 bg-[#07090E] select-none text-center border-t border-slate-900">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Blue/purple gradient card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-900 border border-blue-500/30 rounded-3xl p-8 md:p-12 shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Subtle grid pattern inside */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none opacity-60" />
          
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white max-w-xl mx-auto leading-none">
            Ready to Trade Smarter?
          </h2>
          
          <p className="text-blue-100 max-w-lg mx-auto text-xs md:text-sm font-medium leading-relaxed">
            Join thousands of traders using Cashix.fun to find the next 100x opportunities.
          </p>

          <div className="flex items-center justify-center w-full max-w-xs mx-auto pt-4 relative z-10">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="w-full px-8 py-4 bg-white hover:bg-blue-50 text-[#0B0E11] font-black uppercase text-xs rounded-xl transition-all flex items-center justify-center gap-2.5 tracking-wider shadow-lg cursor-pointer"
            >
              Launch Cashix Terminal 🚀
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
