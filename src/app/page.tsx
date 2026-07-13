"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import InteractiveShowcase from "@/components/InteractiveShowcase";
import Benefits from "@/components/Benefits";
import HowItWorks from "@/components/HowItWorks";
import CommunityPreview from "@/components/CommunityPreview";
import CommunityCTA from "@/components/CommunityCTA";
import Faq from "@/components/Faq";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#07090E] text-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow flex flex-col gap-6 lg:gap-12 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 pt-24 md:pt-32">
        <Hero />
        <TrustStrip />
        <InteractiveShowcase />
        <HowItWorks />
        <Benefits />
        <CommunityPreview />
        <CommunityCTA />
        <Faq />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
