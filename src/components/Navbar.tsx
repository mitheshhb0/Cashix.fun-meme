"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const Twitter = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#07090E]/90 backdrop-blur-md border-b border-slate-900 px-6 py-3 flex items-center justify-between select-none">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group text-left">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-sm font-black text-white font-mono leading-none">$</span>
          </div>
          <div>
            <h1 className="text-sm font-black uppercase text-white tracking-tighter leading-none">
              CASHIX<span className="text-blue-500">.FUN</span>
            </h1>
          </div>
        </Link>

        {/* Action Button & Menu */}
        <div className="flex items-center gap-3">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs rounded-lg font-bold transition-all shadow cursor-pointer uppercase tracking-wider"
          >
            Launch App
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Menu className="w-5.5 h-5.5 text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-[100%] left-0 right-0 bg-[#07090E]/95 border-b border-slate-900 p-6 flex flex-col gap-4 font-bold shadow-2xl">
          <a href="#workflow" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white uppercase text-xs tracking-wider">Workflow</a>
          <a href="#showcase" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white uppercase text-xs tracking-wider">Showcase</a>
          <a href="#comparison" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white uppercase text-xs tracking-wider">Why CASHIX</a>
          {user && (
            <button onClick={() => { signOut(); setIsOpen(false); }} className="text-slate-400 hover:text-white uppercase text-xs tracking-wider text-left">Disconnect</button>
          )}
        </div>
      )}
    </header>
  );
}
