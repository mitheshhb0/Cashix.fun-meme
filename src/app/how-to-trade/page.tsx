"use client";

import Link from "next/link";
import { ArrowLeft, Wallet, ArrowDownToLine, Search, ArrowRightLeft, TrendingUp } from "lucide-react";

export default function HowToTrade() {
  return (
    <div className="min-h-screen bg-[#060913] font-sans text-white premium-mesh-bg">
      {/* Background neon blobs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 rounded-full bg-[#FFD600]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-[#FF4D00]/3 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="backdrop-blur-md bg-[#0D1426]/50 border-b border-white/5 shadow-md px-4 py-3 md:px-8 md:py-6 flex items-center justify-between sticky top-0 z-50">
        <Link className="flex items-center gap-2 hover:text-[#FFD600] transition-colors" href="/">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          <span className="font-black uppercase text-sm md:text-base tracking-wider">Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-[#FFD600] to-[#FF4D00] rounded-full flex items-center justify-center border border-white/10 shadow-md">
            <span className="text-sm md:text-base font-black text-black font-mono leading-none">$</span>
          </div>
          <span className="text-lg md:text-xl font-black uppercase tracking-tighter">cashix.fun</span>
        </div>
      </header>

      {/* Main Guide Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-4 bg-gradient-to-b from-white to-[#FFD600] bg-clip-text text-transparent gold-glow-text">
            How to Trade
          </h1>
          <p className="text-base md:text-lg font-medium text-[#8A99AD] max-w-2xl mx-auto leading-relaxed">
            A complete step-by-step guide to buying crypto on Binance, transferring to your Web3 Wallet, adding our contract, and grabbing your first bag of our token.
          </p>
        </div>

        {/* Video Tutorials */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-center mb-10 flex items-center justify-center gap-3">
            <span className="w-10 h-10 bg-gradient-to-tr from-[#FFD600] to-[#FF4D00] text-black rounded-full flex items-center justify-center shadow-lg font-black text-sm">
              ▶
            </span>
            Video Walkthroughs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4 bg-[#0D1426]/40 border border-white/5 p-5 rounded-[2rem] shadow-xl backdrop-blur-md">
              <h3 className="text-base font-black uppercase text-white tracking-wide">1. Buy Crypto on Binance</h3>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black/40">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/EyNnvug3AdQ"
                  title="How to buy crypto on Binance Exchange"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            <div className="flex flex-col gap-4 bg-[#0D1426]/40 border border-white/5 p-5 rounded-[2rem] shadow-xl backdrop-blur-md">
              <h3 className="text-base font-black uppercase text-white tracking-wide">2. Use Binance Web3 Wallet</h3>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black/40">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/ZJOneTJMF44"
                  title="How to use Binance Web3 Wallet"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Sections */}
        <div className="space-y-16 md:space-y-28">
          
          {/* Step 1 */}
          <section className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-4 text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFD600] to-[#FF4D00] border-4 border-white/10 font-black text-xl text-black shadow-sm mb-2">
                1
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3 text-white">
                <Wallet className="w-6 h-6 md:w-8 md:h-8 text-[#FF4D00]" />
                Buy BNB on Binance
              </h2>
              <p className="text-sm md:text-base text-[#8A99AD] leading-relaxed">
                First, you need some BNB (or SOL) to trade. Open your{" "}
                <a
                  href="https://www.binance.com/en-IN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-black underline text-white hover:text-[#FFD600] transition-colors"
                >
                  Binance account
                </a>{" "}
                and ensure you are on the <strong>Exchange</strong> tab. Add funds via P2P or card, and buy BNB.
              </p>
              <ul className="space-y-2.5 font-bold text-xs md:text-sm text-[#8A99AD]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Open Binance App
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Tap &quot;Add Funds&quot; or &quot;P2P&quot;
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Buy BNB
                </li>
              </ul>
            </div>
            
            {/* Phone Mockup 1 */}
            <div className="flex-1 w-full relative aspect-[4/3] bg-[#0D1426]/30 border border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden flex items-center justify-center p-6 select-none backdrop-blur-md">
              <div className="w-full max-w-[280px] h-[340px] bg-[#0A0E17] text-white rounded-3xl border border-white/10 flex flex-col shadow-inner relative overflow-hidden font-sans">
                <div className="flex justify-center mt-4">
                  <div className="bg-[#1E232F] rounded-full p-1 flex">
                    <div className="px-4 py-1 rounded-full bg-[#0A0E17] text-[10px] font-black text-white">Exchange</div>
                    <div className="px-4 py-1 rounded-full text-neutral-500 text-[10px] font-black">Wallet</div>
                  </div>
                </div>
                <div className="p-4 mt-4 text-left flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-neutral-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">Est. Total Value</div>
                    <div className="text-2xl font-black mb-4">$420.00</div>
                  </div>
                  <div className="bg-gradient-to-r from-[#FFD600] to-[#FF4D00] text-black font-black text-center py-2.5 rounded-xl mb-4 text-xs cursor-pointer">
                    Add Funds
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center text-[10px] font-bold text-neutral-400">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 bg-[#1E232F] rounded-full"></div>
                      <span>Spot</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 bg-[#1E232F] rounded-full"></div>
                      <span>P2P</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 bg-[#1E232F] rounded-full"></div>
                      <span>Earn</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 bg-[#1E232F] rounded-full"></div>
                      <span>Transfer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section className="flex flex-col lg:flex-row-reverse gap-12 items-center">
            <div className="flex-1 space-y-4 text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFD600] to-[#FF4D00] border-4 border-white/10 font-black text-xl text-black shadow-sm mb-2">
                2
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3 text-white">
                <ArrowDownToLine className="w-6 h-6 md:w-8 md:h-8 text-[#00C853]" />
                Move to Web3 Wallet
              </h2>
              <p className="text-sm md:text-base text-[#8A99AD] leading-relaxed">
                Toggle the top switch from <strong>Exchange</strong> to <strong>Wallet</strong> to access your Binance Web3 Wallet. Tap <strong>Receive</strong> and select <strong>Transfer from Binance Exchange</strong> to move your BNB securely into your wallet.
              </p>
              <ul className="space-y-2.5 font-bold text-xs md:text-sm text-[#8A99AD]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Switch to Web3 Wallet
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Tap &quot;Receive&quot;
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Select &quot;Transfer from Binance Exchange&quot;
                </li>
              </ul>
            </div>
            
            {/* Phone Mockup 2 */}
            <div className="flex-1 w-full relative aspect-[4/3] bg-[#0D1426]/30 border border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden flex items-center justify-center p-6 select-none backdrop-blur-md">
              <div className="w-full max-w-[280px] h-[340px] bg-[#0A0E17] text-white rounded-3xl border border-white/10 flex flex-col shadow-inner relative overflow-hidden font-sans">
                <div className="flex justify-center mt-4">
                  <div className="bg-[#1E232F] rounded-full p-1 flex">
                    <div className="px-4 py-1 rounded-full text-neutral-500 text-[10px] font-black">Exchange</div>
                    <div className="px-4 py-1 rounded-full bg-[#0A0E17] text-[10px] font-black text-white">Wallet</div>
                  </div>
                </div>
                <div className="p-4 mt-6 text-left flex-1 flex flex-col justify-center">
                  <div className="text-center font-black text-sm mb-5">Receive Assets</div>
                  <div className="space-y-3">
                    <div className="bg-[#1E232F] border border-white/5 p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:border-white/25 transition-colors">
                      <ArrowRightLeft className="w-5 h-5 text-[#00E5FF] shrink-0" />
                      <div>
                        <div className="font-bold text-[11px]">Binance Exchange Transfer</div>
                        <div className="text-[8px] text-neutral-500">Withdraw assets from Exchange</div>
                      </div>
                    </div>
                    <div className="bg-[#1E232F] border border-white/5 p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:border-white/25 transition-colors">
                      <Search className="w-5 h-5 text-[#00C853] shrink-0" />
                      <div>
                        <div className="font-bold text-[11px]">Receive via Address</div>
                        <div className="text-[8px] text-neutral-500">Copy custom wallet address</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-4 text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFD600] to-[#FF4D00] border-4 border-white/10 font-black text-xl text-black shadow-sm mb-2">
                3
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3 text-white">
                <Search className="w-6 h-6 md:w-8 md:h-8 text-[#00E5FF]" />
                Manage Tokens
              </h2>
              <p className="text-sm md:text-base text-[#8A99AD] leading-relaxed">
                In your Web3 Wallet assets list, tap <strong>Manage Tokens</strong> at the bottom. In the search bar, paste the exact token contract address that we provide on our official <strong>Telegram channel</strong>. Toggle the switch to add it.
              </p>
              <ul className="space-y-2.5 font-bold text-xs md:text-sm text-[#8A99AD]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Get Contract Address from our Telegram
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Tap &quot;Manage Tokens&quot;
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Paste Address and Toggle On
                </li>
              </ul>
            </div>
            
            {/* Phone Mockup 3 */}
            <div className="flex-1 w-full relative aspect-[4/3] bg-[#0D1426]/30 border border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden flex items-center justify-center p-6 select-none backdrop-blur-md">
              <div className="w-full max-w-[280px] h-[340px] bg-[#0A0E17] text-white rounded-3xl border border-white/10 flex flex-col shadow-inner relative overflow-hidden font-sans">
                <div className="p-4 border-b border-white/5 flex items-center gap-3 text-left">
                  <ArrowLeft className="w-4 h-4 cursor-pointer" />
                  <span className="font-black text-xs uppercase tracking-wide">Manage Tokens</span>
                </div>
                <div className="p-4 text-left flex-1 flex flex-col justify-between">
                  <div className="bg-[#1E232F] rounded-xl px-3 py-2.5 flex items-center gap-2 mb-4">
                    <Search className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-[10px] text-neutral-500">Search contract address</span>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between items-center bg-[#1E232F]/40 p-2 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-[#F3BA2F] rounded-full flex items-center justify-center">
                          <span className="text-black font-black text-[8px]">BNB</span>
                        </div>
                        <div>
                          <div className="font-bold text-[10px] leading-tight">BNB</div>
                          <div className="text-[8px] text-neutral-500 leading-tight">BNB Chain</div>
                        </div>
                      </div>
                      <div className="w-8 h-4 bg-[#FFD600] rounded-full relative">
                        <div className="w-3.5 h-3.5 bg-black rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-[#1E232F]/40 p-2 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-[#FFD600] rounded-full flex items-center justify-center">
                          <span className="text-black font-black text-[8px]">OUR</span>
                        </div>
                        <div>
                          <div className="font-bold text-[10px] leading-tight">OUR TOKEN</div>
                          <div className="text-[8px] text-neutral-500 leading-tight">Custom BEP20</div>
                        </div>
                      </div>
                      <div className="w-8 h-4 bg-[#FFD600] rounded-full relative">
                        <div className="w-3.5 h-3.5 bg-black rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 4 */}
          <section className="flex flex-col lg:flex-row-reverse gap-12 items-center">
            <div className="flex-1 space-y-4 text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFD600] to-[#FF4D00] border-4 border-white/10 font-black text-xl text-black shadow-sm mb-2">
                4
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3 text-white">
                <ArrowRightLeft className="w-6 h-6 md:w-8 md:h-8 text-[#1DA1F2]" />
                Swap for Our Token
              </h2>
              <p className="text-sm md:text-base text-[#8A99AD] leading-relaxed">
                Tap on the token you just added, and select <strong>Swap</strong>. Choose BNB as the token to pay with, and our token as the one you will receive. Enter the amount, confirm the swap, and welcome to the community!
              </p>
              <ul className="space-y-2.5 font-bold text-xs md:text-sm text-[#8A99AD]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Tap Swap
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Swap BNB for Our Token
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Confirm Transaction
                </li>
              </ul>
            </div>
            
            {/* Phone Mockup 4 */}
            <div className="flex-1 w-full relative aspect-[4/3] bg-[#0D1426]/30 border border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden flex items-center justify-center p-6 select-none backdrop-blur-md">
              <div className="w-full max-w-[280px] h-[340px] bg-[#0A0E17] text-white rounded-3xl border border-white/10 flex flex-col shadow-inner relative overflow-hidden font-sans">
                <div className="flex justify-center gap-4 mt-4 text-[10px] font-black border-b border-white/5 pb-2">
                  <span className="text-neutral-500">Buy</span>
                  <span className="border-b-2 border-[#FFD600] pb-2 px-2 text-white">Swap</span>
                </div>
                <div className="p-4 flex flex-col h-full text-left justify-between">
                  <div className="bg-[#1E232F] p-3 rounded-xl mb-1 relative z-10 border border-white/5">
                    <div className="text-[9px] text-neutral-500 flex justify-between mb-2 font-bold uppercase">
                      <span>Pay</span>
                      <span>Bal: 1.5 BNB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-black">1.0</span>
                      <span className="font-black flex items-center gap-1 text-[11px] text-[#FFD600]">
                        <div className="w-3.5 h-3.5 bg-[#F3BA2F] rounded-full"></div> BNB
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center -my-3.5 relative z-20">
                    <div className="w-7 h-7 bg-[#0A0E17] rounded-full border-2 border-white/10 text-[#FFD600] flex items-center justify-center">
                      <ArrowRightLeft className="w-3.5 h-3.5 rotate-90" />
                    </div>
                  </div>
                  <div className="bg-[#1E232F] p-3 rounded-xl mt-1 border border-white/5">
                    <div className="text-[9px] text-neutral-500 flex justify-between mb-2 font-bold uppercase">
                      <span>Receive</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-black">142,069</span>
                      <span className="font-black flex items-center gap-1 text-[11px] text-[#00E5FF]">
                        <div className="w-3.5 h-3.5 bg-[#FFD600] rounded-full"></div> TKN
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 bg-gradient-to-r from-[#FFD600] to-[#FF4D00] text-black font-black text-center py-2 rounded-lg text-xs cursor-pointer">
                    Preview Swap
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 5 */}
          <section className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-4 text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFD600] to-[#FF4D00] border-4 border-white/10 font-black text-xl text-black shadow-sm mb-2">
                5
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3 text-white">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-[#00C853]" />
                Trade Our Token
              </h2>
              <p className="text-sm md:text-base text-[#8A99AD] leading-relaxed">
                Once you hold our token, you can tap on it in your Wallet to view its live chart and trade. Use the <strong>Buy</strong> and <strong>Sell</strong> tabs to easily execute market or limit orders directly within Binance Web3 Wallet.
              </p>
              <ul className="space-y-2.5 font-bold text-xs md:text-sm text-[#8A99AD]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Tap on Our Token in Wallet
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> View Live Charts
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span> Execute Buy / Sell Orders
                </li>
              </ul>
            </div>
            
            {/* Phone Mockup 5 */}
            <div className="flex-1 w-full relative aspect-[4/3] bg-[#0D1426]/30 border border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden flex items-center justify-center p-6 select-none backdrop-blur-md">
              <div className="w-full max-w-[280px] h-[340px] bg-[#0A0E17] text-white rounded-3xl border border-white/10 flex flex-col shadow-inner relative overflow-hidden font-sans">
                <div className="p-4 border-b border-white/5 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-[#FFD600] rounded-full flex items-center justify-center">
                        <span className="text-black font-black text-[7px]">TKN</span>
                      </div>
                      <span className="font-black text-[10px]">OUR TOKEN</span>
                    </div>
                    <span className="text-[#00C853] font-black text-[10px]">+12.4%</span>
                  </div>
                  <div className="text-lg font-black">$0.000420</div>
                </div>
                <div className="p-4 flex flex-col h-full text-left justify-between">
                  <div className="flex bg-[#1E232F] rounded-lg p-0.5 mb-3 text-center border border-white/5">
                    <div className="flex-1 py-1 bg-white/10 text-white rounded-md font-black text-[10px]">Buy</div>
                    <div className="flex-1 py-1 text-neutral-500 font-black text-[10px]">Sell</div>
                  </div>
                  <div className="flex justify-between text-[9px] text-neutral-500 font-bold uppercase mb-1">
                    <span>Available</span>
                    <span>1.5 BNB</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 mb-3 text-center text-[9px] font-black text-neutral-400">
                    <div className="bg-[#1E232F] rounded py-1 cursor-pointer">25%</div>
                    <div className="bg-[#1E232F] rounded py-1 cursor-pointer">50%</div>
                    <div className="bg-[#1E232F] rounded py-1 cursor-pointer">75%</div>
                    <div className="bg-[#1E232F] rounded py-1 cursor-pointer">100%</div>
                  </div>
                  <div className="bg-[#1E232F] border border-white/5 rounded-xl p-2.5 flex justify-between items-center mb-3">
                    <span className="text-neutral-400 font-bold text-xs">0.1</span>
                    <span className="font-black text-[10px] text-[#FFD600]">BNB</span>
                  </div>
                  <div className="bg-[#00C853] text-black font-black text-center py-2.5 rounded-lg text-xs cursor-pointer">
                    Buy OUR TOKEN
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Action Banner footer */}
        <div className="text-center pt-8 border-t border-white/10 mt-20">
          <h3 className="text-2xl font-black uppercase mb-4 text-white">Ready to Ape In?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link className="px-8 py-4 bg-white text-black font-black uppercase text-sm rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer" href="/">
              Back to Home
            </Link>
            <a
              href="https://dexscreener.com/solana/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-[#FFD600] to-[#FF4D00] text-black font-black uppercase text-sm rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer"
            >
              Open DexScreener
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
