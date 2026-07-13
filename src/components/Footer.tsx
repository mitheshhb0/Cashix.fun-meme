"use client";

import Link from "next/link";

export default function Footer() {
  const links = {
    platform: [
      { name: "Terminal", href: "/dashboard" },
      { name: "Workflow", href: "#workflow" },
      { name: "Showcase", href: "#showcase" }
    ],
    documentation: [
      { name: "API Docs", href: "#" },
      { name: "Methodology", href: "#" },
      { name: "Security Audits", href: "#" },
      { name: "Guide", href: "/how-to-trade" }
    ],
    legal: [
      { name: "Terms of Service", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Risk Disclaimer", href: "#" }
    ],
    support: [
      { name: "Help Desk", href: "#" },
      { name: "Community Support", href: "#" }
    ]
  };

  return (
    <footer className="bg-[#07090E] border-t border-slate-800/60 px-6 md:px-12 py-16 mt-16 w-full text-left">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Branding Column */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
              <span className="text-sm font-black text-white font-mono leading-none">$</span>
            </div>
            <span className="text-lg font-black uppercase text-white tracking-tighter">
              CASHIX
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium max-w-xs">
            An AI-powered Meme Coin Intelligence Platform combining algorithmic scoring, smart whale traces, contract risk parameters, and an exclusive private community.
          </p>
          <p className="text-[10px] text-slate-600 font-medium">
            © {new Date().getFullYear()} CASHIX. All rights reserved.
          </p>
        </div>

        {/* Link Columns Grid */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              {links.platform.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-slate-500 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Documentation</h4>
            <ul className="space-y-2.5 text-xs">
              {links.documentation.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-slate-500 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Legal</h4>
            <ul className="space-y-2.5 text-xs">
              {links.legal.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-slate-500 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Support</h4>
            <ul className="space-y-2.5 text-xs">
              {links.support.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-slate-500 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
