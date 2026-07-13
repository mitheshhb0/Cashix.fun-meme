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
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 w-full">
      <header className="backdrop-blur-xl bg-[#0D1117]/85 border border-slate-800 shadow-[0_10px_32px_rgba(0,0,0,0.6)] px-6 py-3.5 rounded-2xl flex items-center justify-between gap-4 max-w-7xl w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 transition-transform group-hover:scale-105">
            <span className="text-lg font-black text-white font-mono leading-none">$</span>
          </div>
          <div>
            <h1 className="text-lg font-black uppercase text-white tracking-tighter leading-none group-hover:text-blue-400 transition-colors">
              cashix.fun
            </h1>
            <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold block mt-0.5">Intelligence</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-bold text-xs uppercase tracking-wider">
          <a href="#workflow" className="text-slate-400 hover:text-white transition-all duration-200">
            Workflow
          </a>
          <a href="#showcase" className="text-slate-400 hover:text-white transition-all duration-200">
            Showcase
          </a>
          <a href="#comparison" className="text-slate-400 hover:text-white transition-all duration-200">
            Why CASHIX
          </a>
          <a href="#faq" className="text-slate-400 hover:text-white transition-all duration-200">
            FAQ
          </a>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs rounded-xl font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-md"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Enter Terminal
              </Link>
              <button
                onClick={() => signOut()}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs rounded-xl font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              Enter Terminal
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {isOpen && (
          <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-[#0D1117]/95 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-4 font-bold md:hidden shadow-2xl">
            <a 
              href="#workflow" 
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white uppercase text-sm tracking-wider"
            >
              Workflow
            </a>
            <a 
              href="#showcase" 
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white uppercase text-sm tracking-wider"
            >
              Showcase
            </a>
            <a 
              href="#comparison" 
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white uppercase text-sm tracking-wider"
            >
              Why CASHIX
            </a>
            <a 
              href="#faq" 
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white uppercase text-sm tracking-wider"
            >
              FAQ
            </a>
          </div>
        )}
      </header>
    </div>
  );
}
