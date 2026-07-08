"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Home as HomeIcon, 
  TrendingUp as ChartIcon, 
  ArrowRightLeft as TradesIcon, 
  Coins as TokenomicsIcon,
  User as UserIcon 
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import InteractiveShowcase from "@/components/InteractiveShowcase";
import Benefits from "@/components/Benefits";
import HowItWorks from "@/components/HowItWorks";
import CommunityPreview from "@/components/CommunityPreview";
import CommunityCTA from "@/components/CommunityCTA";
import Stats from "@/components/Stats";
import Faq from "@/components/Faq";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";

type TabType = "HOME" | "CHART" | "TRADES" | "TOKENOMICS";

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("HOME");

  return (
    <div className="relative min-h-screen bg-[#060913] text-white flex flex-col font-sans">
      
      {/* ---------------------------------------------------- */}
      {/* DESKTOP VERSION (hidden on mobile, flex on md+)     */}
      {/* ---------------------------------------------------- */}
      <div className="hidden md:flex flex-col min-h-screen w-full">
        <Navbar />
        <main className="flex-grow flex flex-col gap-6 lg:gap-12 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 pt-32">
          <Hero />
          <InteractiveShowcase />
          <Benefits />
          <HowItWorks />
          <CommunityPreview />
          <CommunityCTA />
          <Stats />
          <Faq />
          <FinalCTA />
        </main>
        <Footer />
      </div>

      {/* ---------------------------------------------------- */}
      {/* MOBILE VERSION (flex on mobile, hidden on md+)       */}
      {/* ---------------------------------------------------- */}
      <div className="flex md:hidden flex-col min-h-screen w-full pb-24 text-left relative overflow-x-hidden">
        
        {/* Mobile Header Bar */}
        <header className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-[#060913]/95 backdrop-blur-md border-b border-white/5 z-50">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#FFD600] rounded-full flex items-center justify-center border border-black/10 shadow-[0_0_10px_rgba(255,214,0,0.4)]">
              <span className="text-sm font-black text-black font-mono leading-none">$</span>
            </div>
            <h1 className="text-lg font-black uppercase text-white tracking-tighter leading-none">
              cashix.fun
            </h1>
          </Link>
          
          <div className="flex items-center gap-2.5">
            <Link 
              href="/how-to-trade" 
              className="bg-white/5 border border-white/10 text-white px-3.5 py-1.5 text-[10px] rounded-full font-black uppercase tracking-wider"
            >
              Guide
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-[#FFD600] to-[#FF4D00] text-black px-3.5 py-1.5 text-[10px] rounded-full font-black uppercase tracking-wider flex items-center gap-1"
              >
                <UserIcon className="w-3 h-3" />
                Portal
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-[#FFD600] to-[#FF4D00] text-black px-3.5 py-1.5 text-[10px] rounded-full font-black uppercase tracking-wider"
              >
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Dynamic Mobile Tab Panels */}
        <main className="px-4 py-4 space-y-6 flex-grow">
          {activeTab === "HOME" && (
            <div className="flex flex-col gap-6">
              <Hero />
              <Benefits />
              <HowItWorks />
              <CommunityCTA />
              <Faq />
              <FinalCTA />
            </div>
          )}
          {activeTab === "CHART" && (
            <InteractiveShowcase />
          )}
          {activeTab === "TRADES" && (
            <CommunityPreview />
          )}
          {activeTab === "TOKENOMICS" && (
            <Stats />
          )}
        </main>

        {/* Sticky Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D1426]/90 border-t border-white/10 backdrop-blur-xl py-3 px-6 flex items-center justify-between">
          
          <button 
            onClick={() => setActiveTab("HOME")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === "HOME" ? "text-[#FFD600]" : "text-neutral-500 hover:text-white"}`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[8px] uppercase font-black tracking-wider">Home</span>
          </button>

          <button 
            onClick={() => setActiveTab("CHART")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === "CHART" ? "text-[#FFD600]" : "text-neutral-500 hover:text-white"}`}
          >
            <ChartIcon className="w-5 h-5" />
            <span className="text-[8px] uppercase font-black tracking-wider">Ticker</span>
          </button>

          <button 
            onClick={() => setActiveTab("TRADES")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === "TRADES" ? "text-[#FFD600]" : "text-neutral-500 hover:text-white"}`}
          >
            <TradesIcon className="w-5 h-5" />
            <span className="text-[8px] uppercase font-black tracking-wider">Trades</span>
          </button>

          <button 
            onClick={() => setActiveTab("TOKENOMICS")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === "TOKENOMICS" ? "text-[#FFD600]" : "text-neutral-500 hover:text-white"}`}
          >
            <TokenomicsIcon className="w-5 h-5" />
            <span className="text-[8px] uppercase font-black tracking-wider">Stats</span>
          </button>

        </div>
      </div>

    </div>
  );
}
