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
  const [price, setPrice] = useState(0.00042);
  const [priceChange, setPriceChange] = useState(0.00);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.49) * 0.05;
      setPriceChange((prev) => Number((prev + change).toFixed(2)));
      setPrice((prev) => Number((prev * (1 + change / 100)).toFixed(6)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 w-full">
      <header className="backdrop-blur-xl bg-[#0D1426]/50 border border-white/10 shadow-[0_10px_32px_0_rgba(0,0,0,0.37)] px-6 py-3 md:py-4 rounded-full flex items-center justify-between gap-2 max-w-7xl w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-[#FFD600] rounded-full flex items-center justify-center border border-black/10 shadow-[0_0_15px_rgba(255,214,0,0.4)] transition-transform group-hover:scale-105">
            <span className="text-lg md:text-xl font-black text-black font-mono leading-none">$</span>
          </div>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tighter uppercase text-white group-hover:text-[#FFD600] transition-colors leading-none">
            cashix.fun
          </h1>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-black text-xs uppercase tracking-wider">
          <a href="#chart" className="text-white/70 hover:text-[#FFD600] transition-all hover:scale-105 duration-200">
            Live Chart
          </a>
          <a href="#tokenomics" className="text-white/70 hover:text-[#FFD600] transition-all hover:scale-105 duration-200">
            Tokenomics
          </a>
          <a href="#community" className="text-white/70 hover:text-[#FFD600] transition-all hover:scale-105 duration-200">
            VIP Chat
          </a>
          {user && (
            <Link href="/dashboard" className="text-white/70 hover:text-[#FFD600] transition-all hover:scale-105 duration-200">
              Dashboard
            </Link>
          )}
          <a 
            href="http://x.com/XRPz_meme" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white/70 hover:text-[#FFD600] transition-all hover:scale-105 duration-200 flex items-center gap-1.5"
          >
            <Twitter className="w-3.5 h-3.5 text-[#1DA1F2] fill-[#1DA1F2] shrink-0" />
            Twitter
          </a>
        </div>

        {/* Live Price and CTA */}
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <div className="hidden lg:flex flex-col items-end font-bold leading-none">
            <span className="text-[9px] uppercase opacity-55 mb-0.5 tracking-wider">Live Price</span>
            <span className="text-sm text-[#00C853] font-black">
              ${price.toFixed(6)}{" "}
              <span className="text-[10px] ml-0.5 font-bold">
                {priceChange >= 0 ? "▲" : "▼"}{Math.abs(priceChange)}%
              </span>
            </span>
          </div>
          
          <Link 
            href="/how-to-trade" 
            className="hidden sm:inline-block bg-white/5 border border-white/10 text-white px-5 py-2.5 text-xs rounded-full font-black uppercase hover:bg-white/10 transition-colors whitespace-nowrap tracking-wider cursor-pointer"
          >
            Guide
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-[#FFD600] to-[#FF4D00] text-black px-5 py-2.5 text-xs rounded-full font-black uppercase hover:scale-105 transition-transform hover:shadow-[0_0_20px_rgba(255,214,0,0.4)] tracking-wider flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Portal
              </Link>
              <button
                onClick={() => signOut()}
                className="p-2 text-white/60 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-[#FFD600] to-[#FF4D00] text-black px-5 py-2.5 text-xs rounded-full font-black uppercase hover:scale-105 transition-transform hover:shadow-[0_0_20px_rgba(255,214,0,0.4)] whitespace-nowrap tracking-wider cursor-pointer"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white hover:text-[#FFD600] transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {isOpen && (
          <div className="absolute top-[calc(100%+12px)] left-4 right-4 bg-[#0D1426]/95 border border-white/10 backdrop-blur-xl rounded-3xl p-6 flex flex-col gap-4 font-bold md:hidden shadow-2xl animate-float-delayed">
            <a 
              href="#chart" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-[#FFD600] uppercase text-base"
            >
              Live Chart
            </a>
            <a 
              href="#tokenomics" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-[#FFD600] uppercase text-base"
            >
              Tokenomics
            </a>
            <a 
              href="#community" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-[#FFD600] uppercase text-base"
            >
              VIP Chat
            </a>
            <a 
              href="http://x.com/XRPz_meme" 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-[#FFD600] flex items-center gap-2 uppercase text-base"
            >
              <Twitter className="w-5 h-5 text-[#1DA1F2] fill-[#1DA1F2]" />
              Twitter
            </a>
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className="text-xs uppercase opacity-60 font-bold">Live Price</span>
              <span className="text-base text-[#00C853] font-black">
                ${price.toFixed(6)} {priceChange >= 0 ? "▲" : "▼"}{Math.abs(priceChange)}%
              </span>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
