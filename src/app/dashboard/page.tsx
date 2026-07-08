"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  ArrowLeft, 
  Shield, 
  Send, 
  Bell, 
  Copy, 
  Check, 
  Upload, 
  MessageSquare, 
  RefreshCw, 
  Globe,
  TrendingUp,
  AlertTriangle,
  Lock,
  FileCheck2
} from "lucide-react";

interface TokenLink {
  type?: string;
  label?: string;
  url: string;
}

interface TokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  description?: string;
  links?: TokenLink[];
}

interface ChatMessage {
  id: string;
  user: string;
  email: string;
  message: string;
  time: string;
  isAdmin?: boolean;
}

interface TokenSignal {
  tokenName: string;
  action: "BUY" | "SELL";
  contractAddress: string;
  entryPrice: string;
  targetPrice: string;
  stopLoss: string;
  rationale: string;
  timestamp: string;
}

type TabType = "CHAT" | "SIGNALS" | "SECURITY" | "FEED";

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Active tab inside mobile view
  const [activeTab, setActiveTab] = useState<TabType>("CHAT");

  // Buy/Sell Signal States
  const [activeSignal, setActiveSignal] = useState<TokenSignal>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cashix_active_signal");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fall through to default
        }
      }
    }
    return {
      tokenName: "XRPz",
      action: "BUY",
      contractAddress: "0x75e7a6aEc1104dA979ADeb3757F892e430e37c60",
      entryPrice: "$0.0042",
      targetPrice: "$0.0150",
      stopLoss: "$0.0028",
      rationale: "Breaking out of accumulation base with 4x volume multiplier. LP locked, honeypot safe.",
      timestamp: "10m ago"
    };
  });

  // Admin signal form state
  const [signalToken, setSignalToken] = useState("XRPz");
  const [signalAction, setSignalAction] = useState<"BUY" | "SELL">("BUY");
  const [signalAddress, setSignalAddress] = useState("");
  const [signalEntry, setSignalEntry] = useState("");
  const [signalTarget, setSignalTarget] = useState("");
  const [signalStop, setSignalStop] = useState("");
  const [signalRationale, setSignalRationale] = useState("");

  const [copied, setCopied] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  // DexScreener Ticker profiles
  const [tokenProfiles, setTokenProfiles] = useState<TokenProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  // Chat Room State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", user: "Sajibur", email: "sajibur@cashix.fun", message: "Aping in XRPz now, this chart is looking parabolic! 🔥", time: "12:45 PM" },
    { id: "2", user: "whale_watcher", email: "whale@watcher.com", message: "Locked LP is burned forever. XRPz looks super safe.", time: "12:46 PM" },
    { id: "3", user: "sol_maxi", email: "maxi@sol.com", message: "Where is the contract address? Admin upload please!", time: "12:48 PM" }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch DexScreener profiles on mount
  const fetchProfiles = async (showLoading = true) => {
    if (showLoading) {
      setProfilesLoading(true);
    }
    try {
      const res = await fetch("https://api.dexscreener.com/token-profiles/latest/v1");
      if (res.ok) {
        const data = await res.json();
        setTokenProfiles(Array.isArray(data) ? data.slice(0, 10) : []);
      }
    } catch (err) {
      console.error("Error fetching token profiles:", err);
    } finally {
      setProfilesLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfiles(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#070A13] text-white flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#C4FF61] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user.email === "admin@cashix.fun";

  // Post new Buy/Sell signal (Admin only)
  const handlePostSignal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signalToken || !signalAddress || !signalEntry || !signalTarget || !signalStop) return;

    const newSignal: TokenSignal = {
      tokenName: signalToken,
      action: signalAction,
      contractAddress: signalAddress,
      entryPrice: signalEntry,
      targetPrice: signalTarget,
      stopLoss: signalStop,
      rationale: signalRationale || "Technical breakout verified by admin coordinator.",
      timestamp: "Just now"
    };

    localStorage.setItem("cashix_active_signal", JSON.stringify(newSignal));
    setActiveSignal(newSignal);
    setUploaded(true);
    setTimeout(() => setUploaded(false), 2000);

    // Broadcast new signal notification to community chat
    const alertMsg: ChatMessage = {
      id: Date.now().toString(),
      user: "COORDINATOR",
      email: "admin@cashix.fun",
      message: `🚨 NEW SIGNAL POSTED: [${newSignal.action}] ${newSignal.tokenName} at ${newSignal.entryPrice}. Target: ${newSignal.targetPrice}. Address: ${newSignal.contractAddress}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdmin: true
    };
    setChatMessages((prev) => [...prev, alertMsg]);
  };

  // Copy Contract Address to clipboard
  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Send message inside chat room
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: user.displayName || user.email?.split("@")[0] || "Anon Degen",
      email: user.email || "",
      message: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdmin: isAdmin
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");

    if (chatInput.toLowerCase().includes("signal") || chatInput.toLowerCase().includes("buy")) {
      setTimeout(() => {
        const reply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          user: "DeFi_God",
          email: "god@defi.com",
          message: `Active signal is on ${activeSignal.tokenName}. Target: ${activeSignal.targetPrice} 🚀`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages((prev) => [...prev, reply]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white font-sans flex items-center justify-center p-0 md:p-6 select-none">
      
      {/* Centered Mobile Device Frame Mockup */}
      <div className="w-full max-w-md min-h-screen md:min-h-[850px] md:h-[850px] md:rounded-[3rem] bg-[#070A13] flex flex-col justify-between relative overflow-hidden border border-white/0 md:border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] pb-24 md:pb-24">
        
        {/* Top Header Bar */}
        <header className="px-6 pt-6 pb-4 flex items-center justify-between bg-[#070A13]/90 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C4FF61] to-[#00E5FF] flex items-center justify-center border border-white/15 text-black font-black text-sm">
              {user.displayName ? user.displayName[0].toUpperCase() : "U"}
            </div>
            <div className="text-left">
              <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block">Holder Portal</span>
              <h2 className="text-sm font-black text-white leading-none mt-0.5">
                Hi, {user.displayName || user.email?.split("@")[0] || "Anon Degen"}!
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/" className="w-8.5 h-8.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-[#C4FF61] transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <button className="w-8.5 h-8.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <Bell className="w-4 h-4" />
            </button>
            <button 
              onClick={() => signOut()}
              className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-white hover:bg-white/10"
              title="Sign Out"
            >
              Exit
            </button>
          </div>
        </header>

        {/* Stateful Navigation Body */}
        <div className="px-5 py-5 flex-1 overflow-y-auto space-y-6">
          
          {/* TAB 1: COMMUNITY CHAT ROOM (Main Tab) */}
          {activeTab === "CHAT" && (
            <div className="bg-[#0D1426]/60 border border-white/5 rounded-[2rem] p-5.5 shadow-xl flex flex-col h-[600px] justify-between relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4FF61]/3 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3.5 mb-4 shrink-0">
                <div className="text-left">
                  <h3 className="text-sm font-black uppercase text-white flex items-center gap-1.5 tracking-wide">
                    <MessageSquare className="w-4.5 h-4.5 text-[#C4FF61]" />
                    VIP Community Chat
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-[#8A99AD] font-bold">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
                      Live Feed
                    </span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>6 online</span>
                  </div>
                </div>
                <span className="bg-[#C4FF61]/15 text-[#C4FF61] border border-[#C4FF61]/35 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  VERIFIED
                </span>
              </div>

              {/* Chat messages stream */}
              <div className="flex-grow overflow-y-auto space-y-3.5 max-h-[420px] scrollbar-none pr-1 mb-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-[11px] leading-relaxed text-left">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={`font-black uppercase tracking-wide flex items-center gap-1 ${
                        msg.isAdmin ? "text-[#C4FF61]" : "text-[#00E5FF]"
                      }`}>
                        {msg.user}
                        {msg.isAdmin && <span className="text-[7px] bg-[#C4FF61]/10 px-1 py-0.5 rounded text-[#C4FF61]">COORD</span>}
                      </span>
                      <span className="text-[8px] text-neutral-600 font-bold">{msg.time}</span>
                    </div>
                    <p className="text-neutral-300 bg-[#060913]/60 border border-white/5 rounded-xl rounded-tl-none px-3.5 py-2">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Form to submit messages */}
              <form onSubmit={handleSendChat} className="flex gap-2 shrink-0 pt-2 border-t border-white/5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type trading update..."
                  className="bg-[#060913]/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none w-full font-medium"
                />
                <button type="submit" className="p-2.5 bg-[#C4FF61] text-black rounded-xl shrink-0 cursor-pointer">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: BUY/SELL SIGNALS FEED */}
          {activeTab === "SIGNALS" && (
            <div className="space-y-6">
              
              {/* Active Signal overview card */}
              <div className="bg-[#0D1426]/60 border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden text-left">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                  <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#FF4D00]" />
                    Active Trade Call
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase border ${
                    activeSignal.action === "BUY" 
                      ? "bg-[#00C853]/10 text-[#00C853] border-[#00C853]/25" 
                      : "bg-red-500/10 text-red-500 border-red-500/25"
                  }`}>
                    {activeSignal.action}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black uppercase text-white leading-none">{activeSignal.tokenName}</h3>
                    <span className="text-[8px] text-neutral-500 font-bold">{activeSignal.timestamp}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 border-t border-b border-white/5 py-3.5 text-center">
                    <div>
                      <span className="text-[8px] uppercase text-neutral-500 block mb-0.5">Entry</span>
                      <span className="text-xs font-black text-white">{activeSignal.entryPrice}</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase text-[#C4FF61] block mb-0.5">Target</span>
                      <span className="text-xs font-black text-[#C4FF61]">{activeSignal.targetPrice}</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase text-red-500 block mb-0.5">SL</span>
                      <span className="text-xs font-black text-red-500">{activeSignal.stopLoss}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[8px] uppercase font-black text-neutral-500 mb-1">Coordinator Rationale</h5>
                    <p className="text-[11px] text-neutral-400 font-medium leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                      {activeSignal.rationale}
                    </p>
                  </div>

                  <div className="pt-1">
                    <label className="text-[8px] uppercase font-black text-neutral-500 block mb-1">Copy Address</label>
                    <div className="flex items-center bg-[#060913]/60 border border-white/10 rounded-xl p-2.5 gap-2">
                      <span className="font-mono text-[9px] text-white break-all flex-1">
                        {activeSignal.contractAddress}
                      </span>
                      <button
                        onClick={() => handleCopyAddress(activeSignal.contractAddress)}
                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-[#C4FF61]"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-[#00C853]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coordinator upload console (Admin only) */}
              {isAdmin && (
                <div className="bg-[#0D1426]/60 border border-white/5 rounded-[2rem] p-6 space-y-4 text-left">
                  <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#C4FF61]" />
                    Coordinator Panel
                  </h4>
                  <form onSubmit={handlePostSignal} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={signalToken}
                        onChange={(e) => setSignalToken(e.target.value)}
                        placeholder="Token"
                        className="bg-[#060913]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none w-full"
                        required
                      />
                      <select
                        value={signalAction}
                        onChange={(e) => setSignalAction(e.target.value as "BUY" | "SELL")}
                        className="bg-[#060913]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none w-full"
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>
                    </div>
                    
                    <input
                      type="text"
                      value={signalAddress}
                      onChange={(e) => setSignalAddress(e.target.value)}
                      placeholder="Contract Address"
                      className="bg-[#060913]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none w-full font-mono"
                      required
                    />

                    <div className="grid grid-cols-3 gap-1.5">
                      <input
                        type="text"
                        value={signalEntry}
                        onChange={(e) => setSignalEntry(e.target.value)}
                        placeholder="Entry"
                        className="bg-[#060913]/60 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none w-full"
                        required
                      />
                      <input
                        type="text"
                        value={signalTarget}
                        onChange={(e) => setSignalTarget(e.target.value)}
                        placeholder="Target"
                        className="bg-[#060913]/60 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none w-full"
                        required
                      />
                      <input
                        type="text"
                        value={signalStop}
                        onChange={(e) => setSignalStop(e.target.value)}
                        placeholder="SL"
                        className="bg-[#060913]/60 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none w-full"
                        required
                      />
                    </div>

                    <textarea
                      value={signalRationale}
                      onChange={(e) => setSignalRationale(e.target.value)}
                      placeholder="Rationale..."
                      className="bg-[#060913]/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none w-full mt-2"
                      rows={2}
                    />

                    <button type="submit" className="w-full py-2.5 bg-[#C4FF61] text-black font-black uppercase text-xs rounded-xl mt-2 tracking-wider">
                      {uploaded ? "Published!" : "Publish Call"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SECURITY TRUST VERIFICATION */}
          {activeTab === "SECURITY" && (
            <div className="bg-[#0D1426]/60 border border-white/5 rounded-[2rem] p-6 shadow-xl space-y-5 text-left">
              <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                <Shield className="w-4.5 h-4.5 text-[#C4FF61]" />
                Security Verification
              </h3>

              <div className="grid grid-cols-1 gap-3.5">
                <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] border border-[#00E5FF]/20">
                      <Lock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-white">LP Locked</h4>
                      <p className="text-[9px] text-neutral-400 mt-0.5">UNISWAP / LIQUIDITY POOL</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    100% Lock
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#C4FF61]/10 flex items-center justify-center text-[#C4FF61] border border-[#C4FF61]/20">
                      <FileCheck2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-white">Tech Audit</h4>
                      <p className="text-[9px] text-neutral-400 mt-0.5">COMPILER & LOGIC</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Passed
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FF4D00]/10 flex items-center justify-center text-[#FF4D00] border border-[#FF4D00]/20">
                      <AlertTriangle className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-white">Honeypot</h4>
                      <p className="text-[9px] text-neutral-400 mt-0.5">0% TAX</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Safe
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEXSCREENER FEED */}
          {activeTab === "FEED" && (
            <div className="bg-[#0D1426]/60 border border-white/5 rounded-[2rem] p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#00E5FF]" />
                  DexScreener Latest
                </h4>
                <button onClick={() => fetchProfiles()} className="p-1 bg-white/5 border border-white/5 rounded-full">
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-450" />
                </button>
              </div>

              {profilesLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <div className="w-6 h-6 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-neutral-500 font-bold">Querying...</span>
                </div>
              ) : tokenProfiles.length > 0 ? (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto scrollbar-none">
                  {tokenProfiles.slice(0, 5).map((profile, i) => (
                    <div key={i} className="bg-[#060913]/60 border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {profile.icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profile.icon} alt="icon" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-[10px] shrink-0 text-white">
                            {profile.chainId[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 text-left">
                          <div className="font-bold text-[11px] text-white truncate">
                            {profile.description ? (profile.description.split(" ").slice(0, 2).join(" ")) : "Token"}
                          </div>
                          <span className="text-[8px] text-[#00E5FF] font-black uppercase mt-0.5 inline-block">
                            {profile.chainId}
                          </span>
                        </div>
                      </div>
                      <a 
                        href={profile.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-2.5 py-1.5 bg-[#C4FF61] text-black font-black uppercase text-[9px] rounded-lg shrink-0"
                      >
                        Trade
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-neutral-500 font-bold text-center py-6">
                  No active profiles found.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Sticky Mobile Navigation Tab Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-[#0D1426]/90 border-t border-white/10 backdrop-blur-xl py-3 px-6 flex items-center justify-between">
          <button 
            onClick={() => setActiveTab("CHAT")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === "CHAT" ? "text-[#C4FF61]" : "text-neutral-500 hover:text-white"}`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "CHAT" ? "bg-[#C4FF61]" : "bg-neutral-500"}`} />
            </div>
            <span className="text-[8px] uppercase font-black tracking-wider">Chat</span>
          </button>

          <button 
            onClick={() => setActiveTab("SIGNALS")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === "SIGNALS" ? "text-[#C4FF61]" : "text-neutral-500 hover:text-white"}`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "SIGNALS" ? "bg-[#C4FF61]" : "bg-neutral-500"}`} />
            </div>
            <span className="text-[8px] uppercase font-black tracking-wider">Signals</span>
          </button>

          <button 
            onClick={() => setActiveTab("SECURITY")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === "SECURITY" ? "text-[#C4FF61]" : "text-neutral-500 hover:text-white"}`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "SECURITY" ? "bg-[#C4FF61]" : "bg-neutral-500"}`} />
            </div>
            <span className="text-[8px] uppercase font-black tracking-wider">Security</span>
          </button>

          <button 
            onClick={() => setActiveTab("FEED")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === "FEED" ? "text-[#C4FF61]" : "text-neutral-500 hover:text-white"}`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "FEED" ? "bg-[#C4FF61]" : "bg-neutral-500"}`} />
            </div>
            <span className="text-[8px] uppercase font-black tracking-wider">Feed</span>
          </button>
        </div>

      </div>

    </div>
  );
}
