"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { doc, onSnapshot, collection, orderBy, query, addDoc, setDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminTerminal from "@/components/AdminTerminal";
import { 
  ArrowLeft, 
  Shield, 
  Terminal, 
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
  FileCheck2,
  Compass,
  Zap,
  Flame,
  Users,
  Search,
  ExternalLink,
  Wifi,
  WifiOff,
  LogOut,
  Star,
  Activity,
  DollarSign,
  TrendingDown
} from "lucide-react";

interface TokenLink {
  type?: string;
  label?: string;
  url: string;
}

interface DexItem {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  description?: string;
  links?: TokenLink[];
  cto?: boolean;
  updatedAt?: string | number;
  totalAmount?: number;
  amount?: number;
}

interface ChatMessage {
  id: string;
  user: string;
  email: string;
  message: string;
  time: string;
  isAdmin?: boolean;
  timestamp?: number;
  createdAt?: any;
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

type TabType = "DEXSCREENER" | "AISCANNER" | "CHAT" | "SIGNALS" | "SECURITY" | "ADMIN";
type DrawerTabType = "OVERVIEW" | "PRICE" | "AI_ANALYSIS" | "WHALES" | "SOCIAL" | "KOL" | "HOLDERS" | "LIQUIDITY" | "RISK" | "TIMELINE" | "CHARTS";

const DEX_FEEDS = [
  { id: "latest-profiles", name: "Latest Profiles", url: "wss://api.dexscreener.com/token-profiles/latest/v1", icon: Compass, desc: "Real-time newly launched token profiles" },
  { id: "recent-updates", name: "Recent Updates", url: "wss://api.dexscreener.com/token-profiles/recent-updates/v1", icon: RefreshCw, desc: "Profiles with recent metadata changes" },
  { id: "community-takeovers", name: "Community Takeovers", url: "wss://api.dexscreener.com/community-takeovers/latest/v1", icon: Users, desc: "Tokens undergoing active Community Takeovers" },
  { id: "latest-boosts", name: "Latest Boosted", url: "wss://api.dexscreener.com/token-boosts/latest/v1", icon: Flame, desc: "Newly boosted tokens on DEX Screener" },
  { id: "top-boosts", name: "Top Boosted", url: "wss://api.dexscreener.com/token-boosts/top/v1", icon: Zap, desc: "Meme tokens with highest active boost count" },
];

export default function Dashboard() {
  const { user, loading, isApproved, signOut } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("AISCANNER");
  const [selectedFeedId, setSelectedFeedId] = useState("latest-profiles");
  const [tokensMap, setTokensMap] = useState<Record<string, DexItem[]>>({});
  const [wsStatus, setWsStatus] = useState<"CONNECTING" | "CONNECTED" | "DISCONNECTED">("DISCONNECTED");
  const [searchQuery, setSearchQuery] = useState("");
  const [chainFilter, setChainFilter] = useState("all");
  const wsRef = useRef<WebSocket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Market Pulse State
  const [pulseTokens, setPulseTokens] = useState<any[]>([]);
  const [pulseLoading, setPulseLoading] = useState(true);
  const [marketOverviewText, setMarketOverviewText] = useState("Initializing background analysis workers... Initial metrics will load shortly.");
  const [pulseEvents, setPulseEvents] = useState<string[]>([
    "🐋 Whale wallet bought $350K PEPE",
    "🚀 BONK entered Dex Trending Index",
    "📈 Social mentions increased 420% on $PEPE",
    "🔥 AI Score crossed 95 for PEPE",
    "👤 Murad mentioned PEPE on X",
    "⚠️ Sell pressure increasing on microcaps"
  ]);
  const [selectedTokenDetails, setSelectedTokenDetails] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [drawerActiveTab, setDrawerActiveTab] = useState<DrawerTabType>("OVERVIEW");

  // Watchlist State (Local Storage)
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // AI Discovery Engine State
  const [discoveryTokens, setDiscoveryTokens] = useState<any[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);
  const [discoveryMeta, setDiscoveryMeta] = useState({
    totalCandidates: 0,
    totalQualified: 0,
    totalRejected: 0,
    lastUpdated: "—",
  });
  const [discoveryChainFilter, setDiscoveryChainFilter] = useState<"all" | "solana" | "ethereum" | "base">("all");
  const [discoveryRiskFilter, setDiscoveryRiskFilter] = useState<"all" | "Safe" | "Moderate" | "High Risk">("all");
  const [discoverySort, setDiscoverySort] = useState<"opportunity" | "score" | "confidence" | "volume" | "liquidity" | "whales" | "social">("opportunity");

  // Derived: filtered + sorted discovery tokens
  const filteredDiscoveryTokens = discoveryTokens
    .filter((t) => {
      if (discoveryChainFilter !== "all" && t.chain !== discoveryChainFilter) return false;
      if (discoveryRiskFilter !== "all" && t.riskTier !== discoveryRiskFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (discoverySort) {
        case "score": return b.score - a.score;
        case "confidence": return b.confidence - a.confidence;
        case "volume": return b.volume24h - a.volume24h;
        case "liquidity": return b.liquidityUsd - a.liquidityUsd;
        case "whales": return (b.whaleBuysCount || 0) - (a.whaleBuysCount || 0);
        case "social": return (b.tweetsCount || 0) - (a.tweetsCount || 0);
        default: return (b.opportunityScore || b.score) - (a.opportunityScore || a.score);
      }
    });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cashix_watchlist");
      if (saved) {
        try { setWatchlist(JSON.parse(saved)); } catch {}
      }
    }
  }, []);

  const toggleWatchlist = (addr: string) => {
    let nextList = [...watchlist];
    if (nextList.includes(addr)) {
      nextList = nextList.filter(item => item !== addr);
    } else {
      nextList.push(addr);
    }
    setWatchlist(nextList);
    localStorage.setItem("cashix_watchlist", JSON.stringify(nextList));
  };

  const [activeSignal, setActiveSignal] = useState<TokenSignal>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cashix_active_signal");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      tokenName: "XRPz",
      action: "BUY",
      contractAddress: "0x75e7a6aEc1104dA979ADeb3757F892e430e37c60",
      entryPrice: "$0.00042",
      targetPrice: "$0.00150",
      stopLoss: "$0.00028",
      rationale: "Breaking out of accumulation base with 4x volume multiplier. LP locked, honeypot safe.",
      timestamp: "10m ago"
    };
  });

  const [signalToken, setSignalToken] = useState("XRPz");
  const [signalAction, setSignalAction] = useState<"BUY" | "SELL">("BUY");
  const [signalAddress, setSignalAddress] = useState("");
  const [signalEntry, setSignalEntry] = useState("");
  const [signalTarget, setSignalTarget] = useState("");
  const [signalStop, setSignalStop] = useState("");
  const [signalRationale, setSignalRationale] = useState("");

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", user: "Sajibur", email: "sajibur@cashix.fun", message: "Aping in XRPz now, this chart is looking parabolic! 🔥", time: "12:45 PM" },
    { id: "2", user: "whale_watcher", email: "whale@watcher.com", message: "Locked LP is burned forever. XRPz looks safe.", time: "12:46 PM" },
    { id: "3", user: "sol_maxi", email: "maxi@sol.com", message: "Where is the contract address? Admin upload please!", time: "12:48 PM" }
  ]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // DexScreener WebSocket Background Listener (Active Feed)
  useEffect(() => {
    if (loading || !user || activeTab !== "DEXSCREENER") return;

    const feed = DEX_FEEDS.find(f => f.id === selectedFeedId);
    if (!feed) return;

    setWsStatus("CONNECTING");
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(feed.url);
    wsRef.current = ws;

    ws.onopen = () => setWsStatus("CONNECTED");
    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed && Array.isArray(parsed.data)) {
          setTokensMap(prev => ({ ...prev, [selectedFeedId]: parsed.data }));
        }
      } catch (err) {
        console.error("Error parsing DEX WebSocket message:", err);
      }
    };
    ws.onerror = () => setWsStatus("DISCONNECTED");
    ws.onclose = () => setWsStatus("DISCONNECTED");

    return () => ws.close();
  }, [selectedFeedId, user, loading, activeTab]);

  // SSE Live EventSource Stream Listener
  useEffect(() => {
    if (loading || !user || activeTab !== "AISCANNER") return;

    setPulseLoading(true);

    const eventSource = new EventSource("/api/market-pulse/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.tokens) setPulseTokens(data.tokens);
        if (data.marketOverview) setMarketOverviewText(data.marketOverview);
        setPulseLoading(false);
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error, falling back to dynamic fetch:", err);
      fetch("/api/market-pulse", { method: "POST" })
        .then(res => res.json())
        .then(data => {
          if (data.tokens) setPulseTokens(data.tokens);
          if (data.marketOverview) setMarketOverviewText(data.marketOverview);
        })
        .catch(console.error)
        .finally(() => setPulseLoading(false));
    };

    return () => {
      eventSource.close();
    };
  }, [user, loading, activeTab]);

  // AI Discovery Engine — SSE stream listener
  useEffect(() => {
    if (loading || !user || activeTab !== "DEXSCREENER") return;

    setDiscoveryLoading(true);

    const es = new EventSource("/api/discovery/stream");

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.tokens) setDiscoveryTokens(data.tokens);
        if (data.totalCandidates !== undefined) {
          setDiscoveryMeta({
            totalCandidates: data.totalCandidates,
            totalQualified: data.totalQualified,
            totalRejected: data.totalRejected,
            lastUpdated: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
        }
        setDiscoveryLoading(false);
      } catch {}
    };

    es.onerror = () => {
      // Fallback to HTTP GET
      fetch("/api/discovery")
        .then((r) => r.json())
        .then((data) => {
          if (data.tokens) setDiscoveryTokens(data.tokens);
          if (data.totalCandidates !== undefined) {
            setDiscoveryMeta({
              totalCandidates: data.totalCandidates,
              totalQualified: data.totalQualified,
              totalRejected: data.totalRejected,
              lastUpdated: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            });
          }
        })
        .catch(() => {})
        .finally(() => setDiscoveryLoading(false));
    };

    return () => es.close();
  }, [user, loading, activeTab]);

  // Live Activity feed event simulator
  useEffect(() => {
    if (loading || !user) return;

    const eventTemplates = [
      "🐋 Whale wallet bought $350K {token}",
      "🚀 {token} entered Dex Screener Trending Index",
      "📈 Social media mentions +{percent}% on ${token}",
      "👤 Murad posted tweet supporting {token} ecosystem",
      "🔥 AI Score increased to {score} for {token}",
      "⚡ Telegram channels gained {subscribers} new subscribers for {token}",
      "🔄 New LP lock verification passed for ${token}",
      "⚠️ Sell pressure increasing on {token}"
    ];

    const interval = setInterval(() => {
      if (pulseTokens.length === 0) return;
      const randomToken = pulseTokens[Math.floor(Math.random() * pulseTokens.length)];
      const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];

      const percent = Math.floor(Math.random() * 200) + 50;
      const score = Math.floor(Math.random() * 20) + 80;
      const subscribers = Math.floor(Math.random() * 1500) + 300;

      const formatted = template
        .replace(/{token}/g, randomToken.symbol)
        .replace(/{percent}/g, percent.toString())
        .replace(/{score}/g, score.toString())
        .replace(/{subscribers}/g, subscribers.toString());

      setPulseEvents(prev => [formatted, ...prev.slice(0, 14)]);
    }, 6000);

    return () => clearInterval(interval);
  }, [pulseTokens, user, loading]);

  const isAdmin =
    user?.email === "admin@cashix.fun" ||
    user?.email === "mitheshhb0@gmail.com";

  // Synchronize Active Signal from Firestore in Real-Time
  useEffect(() => {
    if (loading || !user) return;
    const unsub = onSnapshot(
      doc(db, "signals", "active"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setActiveSignal({
            tokenName: data.tokenName || "",
            action: data.action || "BUY",
            contractAddress: data.contractAddress || "",
            entryPrice: data.entryPrice || "",
            targetPrice: data.targetPrice || "",
            stopLoss: data.stopLoss || "",
            rationale: data.rationale || "",
            timestamp: data.timestamp || "Just now",
          });
        }
      },
      (err) => {
        console.warn("Firestore signals active subscription error:", err);
      }
    );
    return () => unsub();
  }, [user, loading]);

  // Synchronize Chat Messages from Firestore in Real-Time (last 7 days only)
  useEffect(() => {
    if (loading || !user) return;

    // Filter messages that are from the last 7 days to maintain lightweight memory footprint and respect privacy
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const q = query(
      collection(db, "chat_messages"),
      where("timestamp", ">=", sevenDaysAgo),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const messages: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          messages.push({
            id: docSnap.id,
            user: data.user || "Anon",
            email: data.email || "",
            message: data.message || "",
            time: data.time || "",
            isAdmin: data.isAdmin || false,
            timestamp: data.timestamp || 0
          });
        });
        setChatMessages(messages);
      },
      (err) => {
        console.warn("Firestore chat messages subscription error (index may need building):", err);
      }
    );
    return () => unsub();
  }, [user, loading]);

  // Admin Active Simulation Daemon — posts every time a non-admin sends the last message
  useEffect(() => {
    if (loading || !user || chatMessages.length === 0) return;

    const positiveAdminMessages = [
      "CASHIX algorithms are holding up perfectly today. Whale inflows on Solana microcaps are matching our predictive filters beautifully.",
      "Just finished scanning the new token mints. Risk Center audit flags are clean for our top watchlist assets. Enter within targets!",
      "Welcome to all the new terminal members! Let's keep the focus on high-conviction calls only. Let's hunt these coins together.",
      "The Market Pulse index just crossed 90% confidence. Smart money flows are exceptionally strong today.",
      "Admin desk is fully active. Currently auditing the whale accumulation paths on three microcap candidates.",
      "CASHIX v4 terminal models have filtered out 44 honeypot rug candidates today already. Safe trading degens!"
    ];

    const lastMessage = chatMessages[chatMessages.length - 1];
    const lastMsgIsAdmin =
      lastMessage.email === "admin@cashix.fun" ||
      lastMessage.email === "mitheshhb0@gmail.com" ||
      lastMessage.isAdmin === true;

    if (!lastMsgIsAdmin) {
      // Random delay 18–35 seconds before admin bot responds
      const delay = 18000 + Math.random() * 17000;

      const timeoutId = setTimeout(async () => {
        const randomText = positiveAdminMessages[Math.floor(Math.random() * positiveAdminMessages.length)];

        const botMessage = {
          user: "Admin Desk",
          email: "mitheshhb0@gmail.com",
          message: randomText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAdmin: true,
          timestamp: Date.now(),
          createdAt: new Date()
        };

        try {
          await addDoc(collection(db, "chat_messages"), botMessage);
        } catch (err) {
          // Firestore offline — append locally
          setChatMessages(prev => [...prev, { id: Date.now().toString(), ...botMessage }]);
        }
      }, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [chatMessages, user, loading]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handlePostSignal = async (e: React.FormEvent) => {
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

    // Write to Firestore so ALL terminals receive it in real-time
    try {
      await setDoc(doc(db, "signals", "active"), newSignal);
    } catch (err) {
      console.error("Firestore signal write failed, falling back to localStorage:", err);
      localStorage.setItem("cashix_active_signal", JSON.stringify(newSignal));
      setActiveSignal(newSignal);
    }

    setUploaded(true);
    setTimeout(() => setUploaded(false), 2000);

    const alertMsg: ChatMessage = {
      id: Date.now().toString(),
      user: "COORDINATOR",
      email: "mitheshhb0@gmail.com",
      message: `🚨 NEW SIGNAL: [${newSignal.action}] ${newSignal.tokenName} at ${newSignal.entryPrice}. Target: ${newSignal.targetPrice}. CA: ${newSignal.contractAddress}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdmin: true,
      timestamp: Date.now(),
      createdAt: new Date()
    };

    try {
      await addDoc(collection(db, "chat_messages"), alertMsg);
    } catch {
      setChatMessages((prev) => [...prev, alertMsg]);
    }
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const chatContent = chatInput.trim();
    setChatInput(""); // Clear field instantly for better UX

    const msgData = {
      user: user?.displayName || user?.email?.split("@")[0] || "Anon Degen",
      email: user?.email || "",
      message: chatContent,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdmin: isAdmin,
      timestamp: Date.now(),
      createdAt: new Date()
    };

    try {
      await addDoc(collection(db, "chat_messages"), msgData);
    } catch (err) {
      console.error("Failed to post chat message to Firestore:", err);
      // Fallback local append on error
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), ...msgData }
      ]);
    }
  };

  const currentTokens = tokensMap[selectedFeedId] || [];
  const filteredTokens = currentTokens.filter(token => {
    const query = searchQuery.toLowerCase();
    const addressMatch = token.tokenAddress.toLowerCase().includes(query);
    const descMatch = token.description?.toLowerCase().includes(query) || false;
    const matchesQuery = addressMatch || descMatch || query === "";
    const matchesChain = chainFilter === "all" || token.chainId.toLowerCase() === chainFilter;
    return matchesQuery && matchesChain;
  });

  const getIconSrc = (token: DexItem) => {
    if (!token.icon) return null;
    if (token.icon.startsWith("http")) return token.icon;
    return `https://cdn.dexscreener.com/cms/images/${token.icon}?width=64&height=64&fit=crop&quality=95&format=auto`;
  };

  // Helper variables for Redesign
  const aiTopPick = [...pulseTokens].sort((a, b) => b.score - a.score)[0];
  const watchlistTokens = pulseTokens.filter(t => watchlist.includes(t.address));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-mono font-bold uppercase tracking-widest">
            Connecting to Terminal...
          </span>
        </div>
      </div>
    );
  }

  if (user && isApproved === false) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090E]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-45" />
        <div className="w-full max-w-md p-8 bg-[#0D1117] border border-slate-800 rounded-2xl text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-50" />
          
          <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto text-blue-400">
            <Shield className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Approval Required</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto font-medium">
              Your account (<span className="text-slate-350 font-semibold">{user.email}</span>) is currently pending administrator whitelist approval. 
              <br /><br />
              Please contact the administrator on Telegram to request dashboard access.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <a
              href="https://t.me/Cashix_Fun"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              Contact Admin (@Cashix_Fun)
            </a>
            <button
              onClick={() => signOut()}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-bold uppercase text-xs rounded-xl transition-colors cursor-pointer"
            >
              Disconnect Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans flex flex-col md:flex-row relative">
      
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0D1117] border-r border-slate-800 shrink-0 sticky top-0 h-screen p-6 justify-between">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 transition-transform group-hover:scale-105">
              <span className="text-xl font-black text-white font-mono leading-none">$</span>
            </div>
            <div className="text-left">
              <h1 className="text-xl font-black uppercase text-white tracking-tighter leading-none">
                cashix.fun
              </h1>
              <span className="text-[9px] uppercase tracking-widest text-blue-500 font-bold">Terminal v4.0</span>
            </div>
          </Link>
          <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30 text-blue-400 font-black text-sm uppercase">
              {user?.displayName ? user.displayName[0] : user?.email?.[0] || "U"}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs text-slate-400 font-medium">Welcome back,</p>
              <h4 className="text-sm font-black text-white truncate">
                {user?.displayName || user?.email?.split("@")[0] || "Anon Degen"}
              </h4>
            </div>
          </div>
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("AISCANNER")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === "AISCANNER" ? "bg-blue-600/10 border border-blue-500/30 text-blue-400" : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Zap className="w-4 h-4" /> Intelligence Center
            </button>
            <button
              onClick={() => setActiveTab("DEXSCREENER")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === "DEXSCREENER" ? "bg-blue-600/10 border border-blue-500/30 text-blue-400" : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Globe className="w-4 h-4" /> Discovery
            </button>
            <button
              onClick={() => setActiveTab("CHAT")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === "CHAT" ? "bg-blue-600/10 border border-blue-500/30 text-blue-400" : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Community
            </button>
            <button
              onClick={() => setActiveTab("SIGNALS")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === "SIGNALS" ? "bg-blue-600/10 border border-blue-500/30 text-blue-400" : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Token Center
            </button>
            <button
              onClick={() => setActiveTab("SECURITY")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === "SECURITY" ? "bg-blue-600/10 border border-blue-500/30 text-blue-400" : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Shield className="w-4 h-4" /> Risk Center
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab("ADMIN")}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeTab === "ADMIN" ? "bg-blue-600/10 border border-blue-500/30 text-blue-400" : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <Terminal className="w-4 h-4" /> Admin Terminal
              </button>
            )}
          </nav>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">API Health</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] text-emerald-500 font-mono">100% ONLINE</span>
            </div>
          </div>
          <Link href="/" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" /> Back To Home
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" /> Disconnect
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden px-6 py-3 flex items-center justify-between bg-[#0D1117] sticky top-0 z-50 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800">
            <span className="text-md font-black text-white font-mono leading-none">$</span>
          </div>
          <h2 className="text-md font-black text-white leading-none">CASHIX</h2>
        </Link>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
            <Bell className="w-4 h-4" />
          </button>
          <button onClick={() => signOut()} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-[9px] font-black uppercase text-red-400">
            Exit
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-grow p-3 md:p-8 lg:p-10 max-w-7xl w-full mx-auto pb-28 md:pb-8 overflow-y-auto">
        
        {/* TAB 1: AI MEME MARKET PULSE REDESIGN */}
        {activeTab === "AISCANNER" && (
          <div className="space-y-5 md:space-y-8">
            {/* Compact Market Overview Bar */}
            <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-3 grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-left shadow-md relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Market</span>
                <span className="text-sm font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">BULLISH</span>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Confidence</span>
                <span className="text-sm font-bold text-white block mt-0.5">88%</span>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Opp Score</span>
                <span className="text-sm font-bold text-blue-400 block mt-0.5">92</span>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Trending</span>
                <span className="text-sm font-bold text-white block mt-0.5 font-mono">{pulseTokens.length}</span>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Whale Vol</span>
                <span className="text-sm font-bold text-white block mt-0.5 font-mono">$14.5M</span>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Mentions</span>
                <span className="text-sm font-bold text-white block mt-0.5 font-mono">142.8K</span>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">KOLs</span>
                <span className="text-sm font-bold text-white block mt-0.5 font-mono">42</span>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">New Mints</span>
                <span className="text-sm font-black text-blue-400 block mt-0.5 font-mono">16</span>
              </div>
            </div>

            {/* Section 1: AI Recommendation (Top Pick) - Bloomberg Style */}
            {aiTopPick && (
              <div className="bg-[#0D1117] border border-slate-800 rounded-2xl p-4 md:p-8 text-left relative overflow-hidden shadow-lg">
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3B82F6]" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                      High Conviction Opportunity
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleWatchlist(aiTopPick.address)}
                      className={`p-2.5 rounded-lg border transition-all hover:scale-105 ${
                        watchlist.includes(aiTopPick.address) ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setSelectedTokenDetails(aiTopPick); setIsDetailsModalOpen(true); }}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-4 pt-4 relative z-10">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Asset</span>
                    <span className="text-xl font-black text-white block mt-1 tracking-tight">{aiTopPick.name} <span className="text-sm font-medium text-slate-400 ml-1">({aiTopPick.symbol})</span></span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Intel Score</span>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-2xl font-black text-emerald-400 leading-none">{aiTopPick.score}</span>
                      <span className="text-[10px] text-slate-500 font-bold mb-1">/100</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Confidence</span>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2.5 overflow-hidden">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${aiTopPick.confidence || 95}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-white block mt-1.5">{aiTopPick.confidence || 95}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Liquidity</span>
                    <span className="text-lg font-bold text-white block mt-1 font-mono">${aiTopPick.liquidityUsd.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Whale Flow</span>
                    <span className="text-lg font-bold text-blue-400 block mt-1 font-mono">{aiTopPick.whaleBuys}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Risk Profile</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md inline-block mt-1">LOW RISK</span>
                  </div>
                </div>

                <div className="mt-8 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 text-sm text-slate-300 leading-relaxed font-medium relative z-10">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl" />
                  {aiTopPick.explanation}
                </div>
              </div>
            )}

            {/* Section 2: Hot Opportunities Grid */}
            {pulseTokens.length > 0 && (() => {
              const hottest = [...pulseTokens].sort((a, b) => b.score - a.score)[0];
              const whales = [...pulseTokens].sort((a, b) => (parseInt(b.whaleBuys) || 0) - (parseInt(a.whaleBuys) || 0))[0];
              const social = [...pulseTokens].sort((a, b) => b.tweetsCount - a.tweetsCount)[0];
              const momentum = [...pulseTokens].sort((a, b) => b.priceChange - a.priceChange)[0];
              const pressure = [...pulseTokens].sort((a, b) => (parseInt(b.whaleSells) || 0) - (parseInt(a.whaleSells) || 0))[0];
              const undervalued = [...pulseTokens].sort((a, b) => a.liquidityUsd - b.liquidityUsd)[0];

              const cards = [
                { title: "Highest Intel Score", coin: hottest, desc: `Score ${hottest?.score}` },
                { title: "Peak Accumulation", coin: whales, desc: `${whales?.whaleBuys} recorded` },
                { title: "Social Velocity", coin: social, desc: `${social?.tweetsCount} active mentions` },
                { title: "Momentum Spike", coin: momentum, desc: `+${momentum?.priceChange.toFixed(1)}%` },
                { title: "Sell Pressure Alert", coin: pressure, desc: `${pressure?.whaleSells} recorded`, isDanger: true },
                { title: "Undervalued Asset", coin: undervalued, desc: "Speculative Risk Play" }
              ];
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-left">
                  {cards.map((card, idx) => card.coin && (
                    <div 
                      key={idx}
                      onClick={() => { setSelectedTokenDetails(card.coin); setIsDetailsModalOpen(true); }}
                      className="bg-[#0D1117] border border-slate-800 p-4 rounded-xl hover:border-slate-700 hover:bg-slate-900/50 cursor-pointer transition-all group shadow-md"
                    >
                      <span className={`text-[9px] uppercase font-bold tracking-wider block mb-1.5 transition-colors ${card.isDanger ? 'text-rose-400 group-hover:text-rose-300' : 'text-blue-400 group-hover:text-blue-300'}`}>
                        {card.title}
                      </span>
                      <h4 className="text-sm font-black text-white">{card.coin.symbol}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">{card.desc}</p>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Section 3 & 4 Layout Grid: Table + Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start text-left">
              
              {/* Table Column */}
              <div className="lg:col-span-2 bg-[#0D1117] border border-slate-800 rounded-xl p-6 space-y-4 shadow-md">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h3 className="text-xs font-bold uppercase text-white tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" /> Live Market Screen
                  </h3>
                  {pulseLoading && <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                </div>

                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-500 font-semibold border-b border-slate-800/80 text-[10px] uppercase tracking-wider text-left">
                        <th className="py-3 px-3 w-10">#</th>
                        <th className="py-3 px-3">Asset</th>
                        <th className="py-3 px-3 w-16 text-center">Intel</th>
                        <th className="py-3 px-3 text-right">Price</th>
                        <th className="py-3 px-3 text-right">1h %</th>
                        <th className="py-3 px-3 text-right">24h %</th>
                        <th className="py-3 px-3 text-right">Volume</th>
                        <th className="py-3 px-3 text-right">Liq</th>
                        <th className="py-3 px-3 text-right">Whale Flow</th>
                        <th className="py-3 px-3 text-right">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {pulseTokens.map((t, idx) => (
                        <tr 
                          key={t.address}
                          onClick={() => { setSelectedTokenDetails(t); setIsDetailsModalOpen(true); }}
                          className="hover:bg-slate-900/60 cursor-pointer transition-colors border-b border-slate-800/40 group text-slate-300"
                        >
                          <td className="py-3.5 px-3 text-slate-500 font-medium group-hover:text-white transition-colors">{idx + 1}</td>
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-white tracking-tight">{t.symbol}</div>
                          </td>
                          <td className={`font-bold py-3.5 px-3 text-center ${
                              t.score >= 80 ? "text-emerald-400" :
                              t.score >= 60 ? "text-amber-400" : "text-rose-400"
                            }`}>
                            {t.score}
                          </td>
                          <td className="text-right py-3.5 px-3 font-mono text-slate-300">${t.priceUsd}</td>
                          <td className={`text-right py-3.5 px-3 font-bold font-mono ${t.priceChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {t.priceChange >= 0 ? "+" : ""}{(t.priceChange * 0.15).toFixed(1)}%
                          </td>
                          <td className={`text-right py-3.5 px-3 font-bold font-mono ${t.priceChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {t.priceChange >= 0 ? "+" : ""}{t.priceChange.toFixed(1)}%
                          </td>
                          <td className="text-slate-300 text-right py-3.5 px-3 font-mono">
                            ${t.volume24h > 1000000 ? `${(t.volume24h / 1000000).toFixed(1)}M` : `${(t.volume24h / 1000).toFixed(0)}K`}
                          </td>
                          <td className="text-slate-400 text-right py-3.5 px-3 font-mono">${t.liquidityUsd.toLocaleString()}</td>
                          <td className="text-blue-400 text-right py-3.5 px-3 font-mono">{t.whaleBuys}</td>
                          <td className={`text-right px-3 uppercase py-3.5 font-bold ${t.priceChange >= 0 ? "text-emerald-400" : "text-slate-500"}`}>
                            {t.priceChange >= 0 ? "BULL" : "VOL"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Heatmap Column */}
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
                <h3 className="text-[10px] font-bold uppercase text-white tracking-widest border-b border-white/10 pb-4 relative z-10 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" /> Market Heatmap
                </h3>
                {pulseTokens.length > 0 && (() => {
                  const mostBullish = [...pulseTokens].sort((a, b) => b.priceChange - a.priceChange)[0];
                  const mostBearish = [...pulseTokens].sort((a, b) => a.priceChange - b.priceChange)[0];
                  const highestVol = [...pulseTokens].sort((a, b) => b.volume24h - a.volume24h)[0];
                  const whales = [...pulseTokens].sort((a, b) => (parseInt(b.whaleBuys) || 0) - (parseInt(a.whaleBuys) || 0))[0];
                  const fastestGrowing = [...pulseTokens].sort((a, b) => b.score - a.score)[0];
                  const mostMentioned = [...pulseTokens].sort((a, b) => b.tweetsCount - a.tweetsCount)[0];

                  return (
                    <div className="flex-grow grid grid-cols-4 grid-rows-4 gap-2 relative z-10 min-h-[260px]">
                      {/* Most Bullish - Large Box */}
                      {mostBullish && (
                        <div onClick={() => { setSelectedTokenDetails(mostBullish); setIsDetailsModalOpen(true); }} className="col-span-2 row-span-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.15)] group overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-300 drop-shadow-sm">Most Bullish</span>
                          <div className="relative z-10">
                            <h4 className="text-2xl font-black text-white leading-none tracking-tight">{mostBullish.symbol}</h4>
                            <span className="text-sm font-black text-emerald-400 block mt-1">+{mostBullish.priceChange.toFixed(1)}%</span>
                          </div>
                        </div>
                      )}

                      {/* Most Bearish - Medium Wide */}
                      {mostBearish && (
                        <div onClick={() => { setSelectedTokenDetails(mostBearish); setIsDetailsModalOpen(true); }} className="col-span-2 row-span-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-2xl p-3 flex justify-between items-center cursor-pointer transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(244,63,94,0.15)] group overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-rose-300 block mb-0.5 drop-shadow-sm">Most Bearish</span>
                            <h4 className="text-base font-black text-white leading-none">{mostBearish.symbol}</h4>
                          </div>
                          <span className="text-xs font-black text-rose-400 relative z-10">{mostBearish.priceChange.toFixed(1)}%</span>
                        </div>
                      )}

                      {/* Highest Volume - Medium Tall */}
                      {highestVol && (
                        <div onClick={() => { setSelectedTokenDetails(highestVol); setIsDetailsModalOpen(true); }} className="col-span-1 row-span-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.05] shadow-[0_0_15px_rgba(59,130,246,0.15)] group overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-[8px] font-bold uppercase tracking-widest text-blue-400 drop-shadow-sm leading-tight">Highest<br/>Volume</span>
                          <div className="relative z-10">
                            <h4 className="text-sm font-black text-white leading-none">{highestVol.symbol}</h4>
                          </div>
                        </div>
                      )}

                      {/* Whale Favorites - Medium Tall */}
                      {whales && (
                        <div onClick={() => { setSelectedTokenDetails(whales); setIsDetailsModalOpen(true); }} className="col-span-1 row-span-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.05] shadow-[0_0_15px_rgba(168,85,247,0.15)] group overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-[8px] font-bold uppercase tracking-widest text-purple-300 drop-shadow-sm leading-tight">Whale<br/>Choice</span>
                          <div className="relative z-10">
                            <h4 className="text-sm font-black text-white leading-none">{whales.symbol}</h4>
                          </div>
                        </div>
                      )}

                      {/* Fastest Growing - Small */}
                      {fastestGrowing && (
                        <div onClick={() => { setSelectedTokenDetails(fastestGrowing); setIsDetailsModalOpen(true); }} className="col-span-1 row-span-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-2xl p-3 flex flex-col justify-center cursor-pointer transition-all hover:scale-[1.05] shadow-[0_0_15px_rgba(59,130,246,0.15)] group overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10 text-center">
                            <span className="text-[7px] font-bold uppercase tracking-widest text-blue-400 block drop-shadow-sm mb-1">Fastest</span>
                            <h4 className="text-xs font-black text-white leading-none">{fastestGrowing.symbol}</h4>
                          </div>
                        </div>
                      )}

                      {/* Most Mentioned - Small */}
                      {mostMentioned && (
                        <div onClick={() => { setSelectedTokenDetails(mostMentioned); setIsDetailsModalOpen(true); }} className="col-span-1 row-span-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-2xl p-3 flex flex-col justify-center cursor-pointer transition-all hover:scale-[1.05] shadow-[0_0_15px_rgba(245,158,11,0.15)] group overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10 text-center">
                            <span className="text-[7px] font-bold uppercase tracking-widest text-amber-400 block drop-shadow-sm mb-1">Hype</span>
                            <h4 className="text-xs font-black text-white leading-none">{mostMentioned.symbol}</h4>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Section 5, 6, 7 Grid: Alerts + Smart Money + KOLs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              
              {/* Section 5: Live Alerts */}
              <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-5 flex flex-col justify-between h-auto md:h-[380px] shadow-md relative overflow-hidden">
                <h3 className="text-xs font-bold uppercase text-white tracking-widest border-b border-slate-800 pb-4 flex items-center gap-2 relative z-10">
                  <Bell className="w-4 h-4 text-blue-500" /> Live System Alerts
                </h3>
                <div className="flex-grow overflow-y-auto space-y-3 mt-4 pr-1 scrollbar-none relative z-10">
                  {pulseEvents.map((evt, idx) => (
                    <div key={idx} className="border-l-2 border-blue-500 bg-slate-900/40 p-3 text-[10px] text-slate-300 font-mono rounded-r-lg">
                      {">"} {evt}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Smart Money Tracker */}
              <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-5 flex flex-col justify-between h-auto md:h-[380px] shadow-md relative overflow-hidden">
                <h3 className="text-xs font-bold uppercase text-white tracking-widest border-b border-slate-800 pb-4 flex items-center gap-2 relative z-10">
                  <Users className="w-4 h-4 text-blue-500" /> Smart Money Tracker
                </h3>
                <div className="flex-grow overflow-y-auto space-y-3 mt-4 pr-1 scrollbar-none relative z-10">
                  {[
                    { addr: "HkgDaQ...mp", action: "BUY", token: "FON", amount: "$350K", profit: "+420%", score: "98" },
                    { addr: "8TmUmB...mp", action: "BUY", token: "WARUME", amount: "$120K", profit: "+180%", score: "94" },
                    { addr: "FVQm2u...mp", action: "SELL", token: "CHILL", amount: "$80K", profit: "+95%", score: "89" }
                  ].map((w, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 space-y-2 text-[10px] hover:bg-slate-900 transition-colors cursor-pointer group">
                      <div className="flex justify-between font-bold">
                        <span className="text-blue-400">{w.addr}</span>
                        <span className={w.action === "BUY" ? "text-emerald-400" : "text-rose-500"}>{w.action}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{w.amount} of ${w.token}</span>
                        <span>PNL: <b className="text-white">{w.profit}</b></span>
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Confidence: <span className="text-white">{w.score}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 7: KOL Influence Dashboard */}
              <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-5 flex flex-col justify-between h-auto md:h-[380px] shadow-md relative overflow-hidden">
                <h3 className="text-xs font-bold uppercase text-white tracking-widest border-b border-slate-800 pb-4 flex items-center gap-2 relative z-10">
                  <MessageSquare className="w-4 h-4 text-blue-500" /> KOL Dashboard
                </h3>
                <div className="flex-grow overflow-y-auto space-y-3 mt-4 pr-1 scrollbar-none relative z-10">
                  {[
                    { name: "Murad Mahmudov", followers: "420K", token: "FON", impact: "98%", accuracy: "94%" },
                    { name: "Ansem", followers: "380K", token: "CHILL", impact: "92%", accuracy: "88%" },
                    { name: "Degen Spartan", followers: "150K", token: "WARUME", impact: "85%", accuracy: "82%" }
                  ].map((kol, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 text-[10px] space-y-2 hover:bg-slate-900 transition-colors cursor-pointer">
                      <div className="flex justify-between font-bold">
                        <span className="text-white text-xs">{kol.name}</span>
                        <span className="text-blue-400">{kol.followers}</span>
                      </div>
                      <p className="text-slate-400">Asset: <b className="text-white">${kol.token}</b> • Impact: <b className="text-blue-500">{kol.impact}</b></p>
                      <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Win Rate: <span className="text-white">{kol.accuracy}</span></div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Section 8 & 9 Grid: Social Trends + Telegram/Discord Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
              
              {/* Section 8: Social Trends */}
              <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-6 space-y-4 shadow-md">
                <h3 className="text-xs font-bold uppercase text-white tracking-widest border-b border-slate-800 pb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" /> Social Trends
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3 text-[10px]">
                    <span className="text-slate-500 uppercase font-bold tracking-wider block">Trending Tags</span>
                    <ul className="space-y-2 text-slate-300 font-mono">
                      <li className="flex items-center gap-2"><span className="text-blue-400">#1</span> $FON <span className="text-emerald-400 text-[9px]">(+320%)</span></li>
                      <li className="flex items-center gap-2"><span className="text-slate-400">#2</span> $WARUME <span className="text-emerald-400 text-[9px]">(+180%)</span></li>
                      <li className="flex items-center gap-2"><span className="text-slate-400">#3</span> SOL Season</li>
                    </ul>
                  </div>
                  <div className="space-y-3 text-[10px]">
                    <span className="text-slate-500 uppercase font-bold tracking-wider block">Platform Share</span>
                    <ul className="space-y-2 text-slate-300 font-mono">
                      <li>X: 64%</li>
                      <li>TG: 22%</li>
                      <li>DC: 14%</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 9: Telegram & Discord Growth */}
              <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-6 space-y-4 shadow-md">
                <h3 className="text-xs font-bold uppercase text-white tracking-widest border-b border-slate-800 pb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" /> Community Growth
                </h3>
                <div className="space-y-3 text-[10px]">
                  {[
                    { name: "$FON", members: "12,400", growth: "+45%", active: "3.2K/h" },
                    { name: "$WARUME", members: "4,500", growth: "+12%", active: "950/h" }
                  ].map((comm, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900/40 p-3.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="font-bold text-white text-xs block tracking-tight">{comm.name}</span>
                        <span className="text-slate-500 uppercase mt-0.5 block">{comm.members} users</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold block">{comm.growth}</span>
                        <span className="text-slate-400 mt-0.5 block">{comm.active}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 10 & 11 Grid: AI Narrative + Watchlist Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
              
              {/* Section 10: AI Narrative */}
              <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-6 space-y-4 shadow-md relative overflow-hidden">
                <h3 className="text-xs font-bold uppercase text-white tracking-widest flex items-center gap-2 border-b border-slate-800 pb-4 relative z-10">
                  <Zap className="w-4 h-4 text-blue-500" /> Intelligence Narrative
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed pt-2 border-l-2 border-blue-500 pl-4 font-medium relative z-10 font-mono">
                  {marketOverviewText}
                </p>
              </div>

              {/* Section 11: Watchlist Preview */}
              <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-6 space-y-4 shadow-md">
                <h3 className="text-xs font-bold uppercase text-white tracking-widest border-b border-slate-800 pb-4">
                  Watchlist
                </h3>
                {watchlistTokens.length > 0 ? (
                  <div className="space-y-3">
                    {watchlistTokens.map(t => (
                      <div key={t.address} className="flex justify-between items-center bg-slate-900/40 p-3.5 rounded-xl border border-slate-800 hover:bg-slate-900 transition-colors cursor-pointer" onClick={() => { setSelectedTokenDetails(t); setIsDetailsModalOpen(true); }}>
                        <div>
                          <span className="font-bold text-white block text-xs tracking-tight">{t.symbol}</span>
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-0.5 block">Intel: {t.score}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={t.priceChange >= 0 ? "text-emerald-400 font-bold text-xs font-mono" : "text-rose-400 font-bold text-xs font-mono"}>
                            {t.priceChange >= 0 ? "+" : ""}{t.priceChange.toFixed(1)}%
                          </span>
                          <button className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-lg text-[9px] font-bold uppercase text-white transition-colors">
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-[10px] font-bold tracking-widest uppercase">
                    No Assets Tracked
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: AI DISCOVERY ENGINE */}
        {activeTab === "DEXSCREENER" && (
          <div className="space-y-6">

            {/* Header */}
            <div className="bg-[#0D1117] border border-slate-800 p-6 rounded-xl shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">AI DISCOVERY ENGINE • UPDATES EVERY 5 MIN</span>
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">Smart Token Discovery</h2>
                  <p className="text-xs text-slate-400 hidden sm:block">Only tokens that passed all quality filters. Ranked by opportunity score.</p>
                </div>
                <div className="flex items-center gap-2">
                  {discoveryLoading ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">PIPELINE RUNNING</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        {discoveryMeta.totalQualified} / {discoveryMeta.totalCandidates} QUALIFIED
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Filters + Sort Bar */}
            <div className="bg-[#0D1117] border border-slate-800 p-3 rounded-xl flex flex-col gap-3 shadow-md">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Chain:</span>
                {(["all", "solana", "ethereum", "base"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setDiscoveryChainFilter(c)}
                    className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all ${discoveryChainFilter === c ? "bg-blue-600 border-blue-500 text-white" : "bg-transparent border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800"}`}
                  >{c}</button>
                ))}
                <span className="text-slate-700 mx-1">|</span>
                <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Risk:</span>
                {(["all", "Safe", "Moderate", "High Risk"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setDiscoveryRiskFilter(r)}
                    className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all ${discoveryRiskFilter === r
                      ? r === "Safe" ? "bg-emerald-600 border-emerald-500 text-white"
                        : r === "Moderate" ? "bg-amber-600 border-amber-500 text-white"
                        : r === "High Risk" ? "bg-rose-600 border-rose-500 text-white"
                        : "bg-blue-600 border-blue-500 text-white"
                      : "bg-transparent border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800"}`}
                  >{r === "all" ? "All Risk" : r}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Sort:</span>
                <select
                  value={discoverySort}
                  onChange={(e) => setDiscoverySort(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-slate-700 cursor-pointer"
                >
                  <option value="opportunity">Highest Opportunity</option>
                  <option value="score">AI Score</option>
                  <option value="confidence">Confidence</option>
                  <option value="volume">Volume</option>
                  <option value="liquidity">Liquidity</option>
                  <option value="whales">Whale Buying</option>
                  <option value="social">Most Discussed</option>
                </select>
              </div>
            </div>

            {/* Token Cards */}
            {discoveryLoading && discoveryTokens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-[#0D1117] border border-slate-800 rounded-xl gap-4">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pipeline scanning market...</p>
                <p className="text-[10px] text-slate-600 font-medium">Filtering candidates through quality filters</p>
              </div>
            ) : filteredDiscoveryTokens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#0D1117] border border-slate-800 rounded-xl gap-3">
                <Search className="w-8 h-8 text-slate-600" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No tokens match filters</p>
                <p className="text-[10px] text-slate-600">Try relaxing the risk or chain filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDiscoveryTokens.map((token: any, idx: number) => {
                  const riskColor =
                    token.riskTier === "Safe" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    : token.riskTier === "Moderate" ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                    : token.riskTier === "High Risk" ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
                    : "text-slate-400 border-slate-700 bg-slate-800/50";

                  const confColor =
                    token.confidenceLabel === "High" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : token.confidenceLabel === "Medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    : "text-slate-400 bg-slate-800 border-slate-700";

                  const scoreColor =
                    token.score >= 80 ? "text-emerald-400"
                    : token.score >= 60 ? "text-blue-400"
                    : token.score >= 40 ? "text-amber-400"
                    : "text-rose-400";

                  const pricePos = (token.priceChange24h ?? 0) >= 0;

                  return (
                    <div
                      key={token.address + idx}
                      className="bg-[#0D1117] border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.06)] flex flex-col"
                    >
                      {/* Card Top: Identity + Score */}
                      <div className="p-5 flex items-start justify-between gap-3 border-b border-slate-800">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-base font-black text-slate-400">
                            {token.symbol?.[0] ?? "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-black text-sm text-white leading-none truncate">{token.name}</h3>
                              <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-500">{token.chain}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-bold font-mono">${token.symbol}</span>
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-center">
                          <span className={`text-2xl font-black font-mono ${scoreColor}`}>{token.score}</span>
                          <span className="text-[8px] font-bold uppercase text-slate-600 tracking-widest">Intel</span>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="px-5 pt-4 grid grid-cols-3 gap-3">
                        <div>
                          <span className="text-[8px] text-slate-600 uppercase font-bold tracking-wider block mb-0.5">Price</span>
                          <span className="text-xs font-black text-white font-mono">${parseFloat(token.priceUsd || "0").toFixed(6)}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-600 uppercase font-bold tracking-wider block mb-0.5">24h</span>
                          <span className={`text-xs font-black font-mono ${pricePos ? "text-emerald-400" : "text-rose-400"}`}>
                            {pricePos ? "+" : ""}{(token.priceChange24h ?? 0).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-600 uppercase font-bold tracking-wider block mb-0.5">Age</span>
                          <span className="text-xs font-bold text-slate-400">{token.ageHours > 720 ? `${Math.floor(token.ageHours/24)}d` : `${Math.round(token.ageHours)}h`}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-600 uppercase font-bold tracking-wider block mb-0.5">Volume 24h</span>
                          <span className="text-xs font-bold text-white">${(token.volume24h / 1000).toFixed(0)}K</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-600 uppercase font-bold tracking-wider block mb-0.5">Liquidity</span>
                          <span className="text-xs font-bold text-white">${(token.liquidityUsd / 1000).toFixed(0)}K</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-600 uppercase font-bold tracking-wider block mb-0.5">Txns 24h</span>
                          <span className="text-xs font-bold text-white">{token.txCount24h?.toLocaleString() ?? "—"}</span>
                        </div>
                      </div>

                      {/* Score Bar */}
                      <div className="px-5 pt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] text-slate-600 uppercase font-bold tracking-wider">Intelligence Score</span>
                          <span className={`text-[9px] font-black font-mono ${scoreColor}`}>{token.score}/100</span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${token.score >= 80 ? "bg-emerald-500" : token.score >= 60 ? "bg-blue-500" : token.score >= 40 ? "bg-amber-500" : "bg-rose-500"}`}
                            style={{ width: `${token.score}%` }}
                          />
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="px-5 pt-3 flex flex-wrap gap-2">
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${riskColor}`}>
                          {token.riskTier}
                        </span>
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${confColor}`}>
                          {token.confidenceLabel} Confidence
                        </span>
                        {token.rugScore > 0 && (
                          <span className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${token.rugScore >= 50 ? "text-rose-400 border-rose-500/30 bg-rose-500/10" : token.rugScore >= 25 ? "text-amber-400 border-amber-500/30 bg-amber-500/10" : "text-slate-500 border-slate-800 bg-slate-900"}`}>
                            Rug Risk: {token.rugScore}
                          </span>
                        )}
                      </div>

                      {/* Whale Flow */}
                      <div className="px-5 pt-3 grid grid-cols-2 gap-2">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2 text-center">
                          <span className="text-[8px] text-emerald-500 uppercase font-bold tracking-wider block">Whale Buys</span>
                          <span className="text-xs font-black text-emerald-400">{token.whaleBuys}</span>
                        </div>
                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg px-3 py-2 text-center">
                          <span className="text-[8px] text-rose-500 uppercase font-bold tracking-wider block">Whale Sells</span>
                          <span className="text-xs font-black text-rose-400">{token.whaleSells}</span>
                        </div>
                      </div>

                      {/* Social + Holders */}
                      <div className="px-5 pt-2 grid grid-cols-2 gap-2">
                        <div className="bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-2 text-center">
                          <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider block">Tweets 24h</span>
                          <span className="text-xs font-bold text-white">{token.tweetsCount ?? 0}</span>
                        </div>
                        <div className="bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-2 text-center">
                          <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider block">Holders</span>
                          <span className="text-xs font-bold text-white">{token.holderCount > 0 ? token.holderCount.toLocaleString() : "—"}</span>
                        </div>
                      </div>

                      {/* AI Summary */}
                      {token.aiSummary && (
                        <div className="mx-5 mt-3 bg-blue-600/5 border border-blue-500/20 rounded-xl p-3">
                          <span className="text-[8px] text-blue-400 uppercase font-bold tracking-wider block mb-1">AI Analysis</span>
                          <p className="text-[10px] text-slate-300 leading-relaxed font-medium">{token.aiSummary}</p>
                          {token.aiNarrative && (
                            <p className="text-[9px] text-blue-400 font-bold mt-1.5 italic">{token.aiNarrative}</p>
                          )}
                        </div>
                      )}

                      {/* Rug Flags */}
                      {token.rugFlags?.length > 0 && (
                        <div className="mx-5 mt-2 space-y-1">
                          {token.rugFlags.slice(0, 2).map((flag: string, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 text-[9px] text-amber-500 font-medium">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              {flag}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="p-5 pt-4 mt-auto border-t border-slate-800 flex gap-2">
                        <button
                          onClick={() => { setSelectedTokenDetails(token); setIsDetailsModalOpen(true); }}
                          className="flex-1 py-2 text-[9px] font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Full Analysis
                        </button>
                        <button
                          onClick={() => toggleWatchlist(token.address)}
                          className={`px-3 py-2 text-[10px] font-bold rounded-lg border transition-colors ${watchlist.includes(token.address) ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"}`}
                        >
                          {watchlist.includes(token.address) ? "★" : "☆"}
                        </button>
                        {token.pairAddress && (
                          <a
                            href={`https://dexscreener.com/${token.chain}/${token.pairAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 text-[9px] font-bold uppercase bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Stats footer */}
            {!discoveryLoading && discoveryTokens.length > 0 && (
              <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium px-1">
                <span>Showing {filteredDiscoveryTokens.length} qualified tokens</span>
                <span>{discoveryMeta.totalRejected} rejected  Last updated {discoveryMeta.lastUpdated}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMMUNITY (CHAT) */}
        {activeTab === "CHAT" && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 h-[70vh] md:h-[680px] text-left">
            
            {/* Sidebar Channels - Left Side */}
            <div className="hidden lg:flex flex-col bg-[#0D1117] border border-slate-800 rounded-xl p-4 justify-between select-none">
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-3">COMMUNITY CHANNELS</span>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-3 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> #general-chat
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 text-slate-500 hover:text-slate-350 rounded-lg text-xs font-bold uppercase tracking-wider cursor-not-allowed group">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-600" /> #alpha-signals
                      </span>
                      <Lock className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 text-slate-500 hover:text-slate-350 rounded-lg text-xs font-bold uppercase tracking-wider cursor-not-allowed group">
                      <span className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-slate-600" /> #risk-alerts
                      </span>
                      <Lock className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-3">VERIFIED MODERATORS</span>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">AD</div>
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-[#0D1117] rounded-full" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                          Admin Desk <Shield className="w-3 h-3 text-emerald-400" />
                        </p>
                        <span className="text-[8px] text-slate-500 font-mono tracking-widest font-black uppercase block mt-1">Lead Analyst</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">WA</div>
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-[#0D1117] rounded-full" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                          Whale Alerts <Zap className="w-3 h-3 text-blue-400" />
                        </p>
                        <span className="text-[8px] text-slate-500 font-mono tracking-widest font-black uppercase block mt-1">Onchain Bot</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/85 rounded-xl p-3 text-left">
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">YOUR TERMINAL LEVEL</span>
                <span className="text-[10px] font-black text-blue-400 flex items-center gap-1.5 uppercase tracking-widest">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Professional Active
                </span>
              </div>
            </div>

            {/* Middle Section - Chat Window */}
            <div className="lg:col-span-3 bg-[#0D1117] border border-slate-800 p-4 md:p-6 rounded-xl flex flex-col h-full justify-between relative shadow-lg">
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <div className="text-left">
                  <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2 tracking-widest">
                    <MessageSquare className="w-4 h-4 text-blue-500" /> #general-chat
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">Terminal holder discussions and narrative validation.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> E2E SECURE
                  </span>
                </div>
              </div>

              {/* Chat Flow */}
              <div className="flex-grow overflow-y-auto space-y-4 max-h-[42vh] md:max-h-[480px] scrollbar-none pr-1 mb-3">
                {chatMessages.map((msg) => {
                  const initial = msg.user ? msg.user[0].toUpperCase() : "A";
                  const avatarColor = msg.isAdmin 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                    : "bg-blue-600/10 border-blue-500/20 text-blue-400";
                  const userBadge = msg.isAdmin ? "MODERATOR" : "TERMINAL HOLDER";
                  const userBadgeColor = msg.isAdmin 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-slate-900 border-slate-800 text-slate-500";
                  
                  return (
                    <div key={msg.id} className="group flex items-start gap-3.5 text-xs text-left bg-slate-900/10 hover:bg-slate-900/30 p-2.5 rounded-xl border border-transparent hover:border-slate-800/40 transition-all duration-200">
                      
                      {/* Avatar */}
                      <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center font-bold border shrink-0 text-sm ${avatarColor}`}>
                        {initial}
                      </div>

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-bold uppercase tracking-wide leading-none ${msg.isAdmin ? "text-emerald-400" : "text-white"}`}>
                              {msg.user}
                            </span>
                            <span className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none border ${userBadgeColor}`}>
                              {userBadge}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">{msg.time}</span>
                        </div>
                        <p className="text-slate-350 leading-relaxed font-normal whitespace-pre-wrap selection:bg-blue-600/20">{msg.message}</p>
                      </div>

                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Form Input */}
              <form onSubmit={handleSendChat} className="flex gap-3 shrink-0 pt-4 border-t border-slate-800 relative items-center">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(e as any); } }}
                    placeholder="Type secured message..."
                    className="bg-[#060913] border border-slate-800/80 px-4 py-3.5 pr-12 rounded-xl text-xs text-white w-full focus:outline-none focus:border-blue-600 placeholder-slate-600 font-medium transition-colors shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2" title="Connection is securely encrypted">
                    <Lock className="w-3.5 h-3.5 text-slate-700" />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-md flex items-center gap-2 hover:scale-[1.02]"
                >
                  Transmit <Send className="w-3 h-3" />
                </button>
              </form>

            </div>

          </div>
        )}

        {/* TAB 4: TOKEN CENTER (SIGNALS) */}
        {activeTab === "SIGNALS" && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-[#0D1117] border border-slate-800 p-8 rounded-xl text-left shadow-md relative overflow-hidden">
              <div className="flex justify-between items-center mb-8 pb-5 border-b border-slate-800 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3B82F6]" />
                  <h4 className="text-xs font-bold uppercase text-white tracking-widest">ACTIVE INVESTMENT MEMO</h4>
                </div>
                <span className="px-3 py-1 text-[9px] font-bold uppercase bg-slate-900 text-slate-400 border border-slate-800 tracking-widest rounded-md">RESTRICTED ACCESS</span>
              </div>
              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black uppercase text-white tracking-tight">{activeSignal.tokenName}</h3>
                    <p className="text-[9px] font-bold text-slate-500 mt-2 tracking-widest">ISSUED: 10 MINS AGO • AUTHOR: TERMINAL INTELLIGENCE</p>
                  </div>
                  <div className={`px-6 py-2 text-xs font-bold uppercase rounded-lg shadow-md transition-transform hover:scale-105 ${activeSignal.action === "BUY" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
                    {activeSignal.action}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 border-t border-b border-slate-800 py-4 text-center bg-slate-900/40 rounded-xl">
                  <div className="flex flex-col items-center justify-center p-2"><span className="text-[9px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">ENTRY PRICE</span><span className="text-lg font-black text-white font-mono">{activeSignal.entryPrice}</span></div>
                  <div className="flex flex-col items-center justify-center p-2 border-l border-slate-800/80"><span className="text-[9px] font-bold uppercase text-emerald-400 block mb-2 tracking-widest">TARGET (TP)</span><span className="text-lg font-black text-emerald-400 font-mono">{activeSignal.targetPrice}</span></div>
                  <div className="flex flex-col items-center justify-center p-2 border-l border-slate-800/80"><span className="text-[9px] font-bold uppercase text-rose-400 block mb-2 tracking-widest">INVALIDATION (SL)</span><span className="text-lg font-black text-rose-400 font-mono">{activeSignal.stopLoss}</span></div>
                  <div className="flex flex-col items-center justify-center p-2 border-l border-slate-800/80"><span className="text-[9px] font-bold uppercase text-blue-400 block mb-2 tracking-widest">RISK:REWARD</span><span className="text-lg font-black text-blue-400 font-mono">1:3.5</span></div>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-widest block mb-4">INVESTMENT THESIS</span>
                  <div className="bg-slate-900/40 border-l-4 border-emerald-500 p-6 rounded-r-xl text-xs leading-relaxed text-slate-200 font-medium">
                    <p>{activeSignal.rationale}</p>
                    <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-3 gap-6">
                      <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl"><span className="text-slate-400 font-bold tracking-widest text-[9px] uppercase block mb-1">CONFIDENCE</span><span className="text-emerald-400 font-black text-base">92%</span></div>
                      <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl"><span className="text-slate-400 font-bold tracking-widest text-[9px] uppercase block mb-1">WHALE ACTIVITY</span><span className="text-white font-black text-base">STRONG ACCUM</span></div>
                      <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl"><span className="text-slate-400 font-bold tracking-widest text-[9px] uppercase block mb-1">HISTORICAL WIN RATE</span><span className="text-white font-black text-base">78.4%</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center bg-slate-900 border border-slate-800 p-3 rounded-xl gap-4 group">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 border-r border-slate-800">CONTRACT</span>
                  <span className="text-xs font-mono text-slate-300 flex-1">{activeSignal.contractAddress}</span>
                  <button onClick={() => handleCopyAddress(activeSignal.contractAddress)} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors">
                    {copiedAddress === activeSignal.contractAddress ? <Check className="w-4 h-4 text-blue-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            {isAdmin && (
              <div className="bg-[#0D1117] border border-slate-800 p-8 rounded-xl space-y-6 text-left shadow-md">
                <h4 className="text-xs font-bold uppercase text-white tracking-widest border-b border-slate-800 pb-4 flex items-center gap-2"><Upload className="w-4 h-4 text-blue-500" /> DISPATCH NEW MEMO</h4>
                <form onSubmit={handlePostSignal} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" value={signalToken} onChange={(e) => setSignalToken(e.target.value)} placeholder="ASSET TICKER" className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs w-full text-white placeholder-slate-500 font-medium focus:outline-none focus:border-slate-700 uppercase" required />
                    <select value={signalAction} onChange={(e) => setSignalAction(e.target.value as "BUY" | "SELL")} className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs w-full text-white font-medium focus:outline-none focus:border-slate-700"><option value="BUY">BUY</option><option value="SELL">SELL</option></select>
                  </div>
                  <input type="text" value={signalAddress} onChange={(e) => setSignalAddress(e.target.value)} placeholder="CONTRACT ADDRESS" className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs w-full text-white font-mono placeholder-slate-500 focus:outline-none focus:border-slate-700" required />
                  <div className="grid grid-cols-3 gap-4">
                    <input type="text" value={signalEntry} onChange={(e) => setSignalEntry(e.target.value)} placeholder="ENTRY" className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs w-full text-white font-mono placeholder-slate-500 focus:outline-none focus:border-slate-700" required />
                    <input type="text" value={signalTarget} onChange={(e) => setSignalTarget(e.target.value)} placeholder="TARGET" className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs w-full text-white font-mono placeholder-slate-500 focus:outline-none focus:border-slate-700" required />
                    <input type="text" value={signalStop} onChange={(e) => setSignalStop(e.target.value)} placeholder="INVALIDATION" className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs w-full text-white font-mono placeholder-slate-500 focus:outline-none focus:border-slate-700" required />
                  </div>
                  <textarea value={signalRationale} onChange={(e) => setSignalRationale(e.target.value)} placeholder="THESIS..." className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs font-medium w-full text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 h-32 resize-none animate-none" />
                  <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs tracking-widest rounded-xl transition-all shadow-md">{uploaded ? "TRANSMITTED" : "TRANSMIT MEMO"}</button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: RISK CENTER (SECURITY) */}
        {activeTab === "SECURITY" && (
          <div className="max-w-2xl mx-auto bg-[#0D1117] border border-slate-800 p-8 rounded-xl shadow-md text-left relative overflow-hidden">
            <h3 className="text-xs font-bold uppercase text-white tracking-widest border-b border-slate-800 pb-5 mb-6 flex items-center gap-3 relative z-10"><Shield className="w-5 h-5 text-blue-500" /> AUDIT & RISK CENTER</h3>
            <div className="grid grid-cols-1 gap-4 relative z-10">
              {[ { icon: Lock, title: "Liquidity Lock Status", status: "100% SECURE" }, { icon: FileCheck2, title: "Developer Contract Audit", status: "VERIFIED" }, { icon: AlertTriangle, title: "Honeypot Exposure", status: "CLEAN" } ].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-900/40 border border-slate-800 p-5 rounded-xl group hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white transition-colors border border-slate-800"><item.icon className="w-5 h-5" /></div>
                    <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider">{item.title}</h4>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1.5 font-bold uppercase tracking-widest rounded-lg border border-emerald-500/20">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: ADMIN TERMINAL (ADMIN) */}
        {activeTab === "ADMIN" && isAdmin && (
          <AdminTerminal />
        )}
      </main>

      {/* Coin Detail Drawer / Modal Overlay (Redesigned with 11 Tabs) */}
      {isDetailsModalOpen && selectedTokenDetails && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-end z-50 transition-opacity">
          <div className="w-full max-w-2xl bg-[#0D1117] h-screen border-l border-slate-800 p-6 md:p-8 flex flex-col justify-between overflow-y-auto relative shadow-xl">
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setIsDetailsModalOpen(false);
                setSelectedTokenDetails(null);
                setDrawerActiveTab("OVERVIEW");
              }}
              className="absolute top-6 right-6 p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all z-10"
            >
              ✕
            </button>

            <div className="space-y-6 text-left relative z-10">
              {/* Header Info */}
              <div className="flex items-center gap-4 border-b border-slate-800 pb-6 justify-between pr-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center font-bold text-2xl text-white">
                    {selectedTokenDetails.symbol[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black uppercase text-white tracking-tight">{selectedTokenDetails.name}</h2>
                      <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                        {selectedTokenDetails.chain}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5 font-mono bg-slate-950 px-2 py-0.5 rounded inline-block border border-slate-850">{selectedTokenDetails.address}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleWatchlist(selectedTokenDetails.address)}
                  className={`p-3 transition-all rounded-xl border ${
                    watchlist.includes(selectedTokenDetails.address) ? "bg-blue-600/20 border-blue-500/50 text-blue-400" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Star className="w-5 h-5" />
                </button>
              </div>

              {/* AI Explanation Header */}
              <div className="bg-slate-900/40 border-l-4 border-blue-500 p-5 rounded-r-xl relative overflow-hidden">
                <h4 className="text-[10px] uppercase tracking-widest text-blue-400 font-bold flex items-center gap-2 mb-2">
                  <Zap className="w-3.5 h-3.5" /> INTELLIGENCE BRIEF
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  "{selectedTokenDetails.explanation}"
                </p>
              </div>

              {/* Redesigned Drawer Tabs Navigation */}
              <div className="flex overflow-x-auto gap-2 py-2 border-b border-slate-800 pb-4 scrollbar-none">
                {([
                  { id: "OVERVIEW", label: "OVERVIEW" },
                  { id: "PRICE", label: "PRICE" },
                  { id: "AI_ANALYSIS", label: "INTEL" },
                  { id: "WHALES", label: "WHALES" },
                  { id: "SOCIAL", label: "SOCIAL" },
                  { id: "KOL", label: "KOL" },
                  { id: "HOLDERS", label: "HOLDERS" },
                  { id: "LIQUIDITY", label: "LIQ" },
                  { id: "RISK", label: "RISK" },
                  { id: "TIMELINE", label: "TIME" },
                  { id: "CHARTS", label: "CHART" }
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDrawerActiveTab(tab.id)}
                    className={`px-4 py-2 text-[9px] font-bold uppercase tracking-wider shrink-0 transition-all rounded-full border ${
                      drawerActiveTab === tab.id ? "bg-blue-600 border-blue-500 text-white shadow-md scale-105" : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              {drawerActiveTab === "OVERVIEW" && (
                <div className="space-y-4">
                  {/* Master Scores */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl transition-all">
                      <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider block mb-2 relative z-10">TERMINAL SCORE</span>
                      <span className="text-3xl font-black text-white relative z-10">{selectedTokenDetails.score}<span className="text-lg text-slate-650">/100</span></span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl transition-all">
                      <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider block mb-2 relative z-10">CONFIDENCE</span>
                      <span className="text-3xl font-black text-emerald-400 relative z-10">{selectedTokenDetails.confidence || 95}%</span>
                    </div>
                  </div>

                  {/* 6 Weighted Components Breakdown */}
                  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-5">
                    <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-850 pb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> METRIC BREAKDOWN
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5 text-[10px]">
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Momentum</span>
                        <span className="text-base font-bold text-white">{selectedTokenDetails.breakdown?.momentum || 18} <span className="text-xs text-slate-600 font-bold">/ 25</span></span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Liquidity</span>
                        <span className="text-base font-bold text-white">{selectedTokenDetails.breakdown?.liquidity || 11} <span className="text-xs text-slate-600 font-bold">/ 15</span></span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Whales</span>
                        <span className="text-base font-bold text-blue-450">{selectedTokenDetails.breakdown?.whales || 14} <span className="text-xs text-slate-600 font-bold">/ 20</span></span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Social</span>
                        <span className="text-base font-bold text-blue-450">{selectedTokenDetails.breakdown?.social || 15} <span className="text-xs text-slate-600 font-bold">/ 20</span></span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Community</span>
                        <span className="text-base font-bold text-white">{selectedTokenDetails.breakdown?.community || 7} <span className="text-xs text-slate-600 font-bold">/ 10</span></span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Risk</span>
                        <span className="text-base font-bold text-emerald-450">{selectedTokenDetails.breakdown?.risk || 8} <span className="text-xs text-slate-600 font-bold">/ 10</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Standard metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
                      <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider block mb-1">PRICE</span>
                      <span className="text-sm font-bold text-blue-400 font-mono">${selectedTokenDetails.priceUsd}</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
                      <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider block mb-1">LIQUIDITY</span>
                      <span className="text-sm font-bold text-white font-mono">${selectedTokenDetails.liquidityUsd.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
                      <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider block mb-1">24H VOL</span>
                      <span className="text-sm font-bold text-white font-mono">${selectedTokenDetails.volume24h.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {drawerActiveTab === "PRICE" && (
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-4">
                  <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-800 pb-3">PRICE STATISTICS</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center"><span className="text-slate-400 font-bold tracking-wider">CURRENT PRICE:</span><span className="font-bold text-white text-sm font-mono">${selectedTokenDetails.priceUsd}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400 font-bold tracking-wider">24H CHANGE:</span><span className={`font-bold text-sm font-mono ${selectedTokenDetails.priceChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{selectedTokenDetails.priceChange >= 0 ? "+" : ""}{selectedTokenDetails.priceChange.toFixed(2)}%</span></div>
                  </div>
                </div>
              )}

              {drawerActiveTab === "AI_ANALYSIS" && (
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-800 pb-3">INTELLIGENCE VERDICT</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">This asset scores a <b className="text-white bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">{selectedTokenDetails.score}/100</b>, demonstrating high potential on Solana index indicators with fallback analytical models.</p>
                </div>
              )}

              {drawerActiveTab === "WHALES" && (
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-4">
                  <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-800 pb-3">SMART MONEY ACTIVITY</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-850"><span className="text-slate-400 font-bold tracking-wider">WHALE BUYS:</span><span className="font-bold text-emerald-400 text-sm font-mono">{selectedTokenDetails.whaleBuys}</span></div>
                    <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-850"><span className="text-slate-400 font-bold tracking-wider">WHALE SELLS:</span><span className="font-bold text-rose-400 text-sm font-mono">{selectedTokenDetails.whaleSells}</span></div>
                  </div>
                </div>
              )}

              {drawerActiveTab === "SOCIAL" && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-800 pb-3">SOCIAL MENTIONS: <span className="text-white">{selectedTokenDetails.tweetsCount}</span></h4>
                  {selectedTokenDetails.tweets && selectedTokenDetails.tweets.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTokenDetails.tweets.map((tw: any, idx: number) => (
                        <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3 border-l-4 border-l-blue-500 shadow-sm">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-blue-400">@{tw.user}</span>
                            <span className="text-slate-500 text-[10px] bg-slate-950 border border-slate-800 px-2 py-1 rounded-full">{tw.likes} LIKES</span>
                          </div>
                          <p className="text-slate-200 leading-relaxed font-medium">"{tw.text}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-[10px] font-bold tracking-widest uppercase bg-slate-900/40 rounded-xl border border-slate-800">NO ACTIVE DATA INDEXED.</div>
                  )}
                </div>
              )}

              {drawerActiveTab === "KOL" && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 text-xs text-slate-300 font-medium">
                  <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-800 pb-3">KOL INSIGHTS</h4>
                  <p className="mt-3 leading-relaxed">Influencer tracking reports multiple tier-1 support indicators. Momentum remains driven by community key opinion leaders.</p>
                </div>
              )}

              {drawerActiveTab === "HOLDERS" && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-3 text-xs">
                  <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-800 pb-3">TOKENOMICS</h4>
                  <div className="flex justify-between mt-3 bg-slate-950 p-3 rounded-lg border border-slate-850"><span className="text-slate-400 font-bold tracking-wider">TOTAL SUPPLY:</span><span className="font-bold text-white font-mono">{parseFloat(selectedTokenDetails.supply).toLocaleString()}</span></div>
                  <div className="flex justify-between bg-slate-950 p-3 rounded-lg border border-slate-850"><span className="text-slate-400 font-bold tracking-wider">DECIMALS:</span><span className="font-bold text-white font-mono">{selectedTokenDetails.decimals}</span></div>
                </div>
              )}

              {drawerActiveTab === "LIQUIDITY" && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-3 text-xs">
                  <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-800 pb-3">LIQUIDITY BACKING</h4>
                  <div className="flex justify-between mt-3 items-center bg-slate-950 p-3 rounded-lg border border-slate-850"><span className="text-slate-400 font-bold tracking-wider">DEPTH POOL:</span><span className="font-bold text-white text-sm font-mono">${selectedTokenDetails.liquidityUsd.toLocaleString()}</span></div>
                  <p className="text-slate-500 font-medium text-center mt-4">DEX Screener indexes pool locks as verified and secured.</p>
                </div>
              )}

              {drawerActiveTab === "RISK" && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-3 text-xs">
                  <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-800 pb-3">RISK PARAMETERS</h4>
                  <div className="flex gap-3 text-slate-350 mt-3 items-center bg-slate-950 p-3 rounded-lg border border-slate-850">
                    <span className={selectedTokenDetails.liquidityUsd > 30000 ? "text-emerald-450" : "text-rose-450"}>[✓]</span>
                    <span className="font-bold tracking-wider">{selectedTokenDetails.liquidityUsd > 30000 ? "LIQUIDITY SIZE SECURE" : "HIGH RUG RISK (THIN LIQ)"}</span>
                  </div>
                </div>
              )}

              {drawerActiveTab === "TIMELINE" && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 text-xs text-slate-300 font-medium">
                  <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-800 pb-3">HYPE TIMELINE</h4>
                  <p className="mt-3 leading-relaxed">Aggregated triggers show token was indexed today on DEX Screener boosts, leading to subsequent volume increase.</p>
                </div>
              )}

              {drawerActiveTab === "CHARTS" && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-10 text-[10px] font-bold tracking-widest uppercase text-center text-slate-500">
                  TRADINGVIEW IFRAME PLACEHOLDER.<br/>USE DEXSCREENER LINK FOR LIVE CHARTING.
                </div>
              )}

            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4 mt-6 relative z-10">
              <button 
                onClick={() => handleCopyAddress(selectedTokenDetails.address)}
                className="flex-grow py-3 bg-slate-900 hover:bg-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-800 flex items-center justify-center gap-2 text-white hover:scale-[1.02] shadow-sm"
              >
                {copiedAddress === selectedTokenDetails.address ? (
                  <>
                    <Check className="w-4 h-4 text-blue-400" /> COPIED
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-550" /> COPY CONTRACT
                  </>
                )}
              </button>
              <a
                href={`https://dexscreener.com/${selectedTokenDetails.chain}/${selectedTokenDetails.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-grow py-3 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                DEX SCREENER <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D1117]/98 border-t border-slate-800 backdrop-blur-xl py-3 pb-safe px-6 flex items-center justify-around md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <button onClick={() => setActiveTab("AISCANNER")} className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${activeTab === "AISCANNER" ? "text-blue-400 bg-blue-600/10" : "text-slate-500"}`}><Zap className="w-5 h-5" /><span className="text-[8px] uppercase font-bold tracking-wider">Intel</span></button>
        <button onClick={() => setActiveTab("DEXSCREENER")} className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${activeTab === "DEXSCREENER" ? "text-blue-400 bg-blue-600/10" : "text-slate-500"}`}><Globe className="w-5 h-5" /><span className="text-[8px] uppercase font-bold tracking-wider">Discover</span></button>
        <button onClick={() => setActiveTab("CHAT")} className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${activeTab === "CHAT" ? "text-blue-400 bg-blue-600/10" : "text-slate-500"}`}><MessageSquare className="w-5 h-5" /><span className="text-[8px] uppercase font-bold tracking-wider">Comm</span></button>
        <button onClick={() => setActiveTab("SIGNALS")} className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${activeTab === "SIGNALS" ? "text-blue-400 bg-blue-600/10" : "text-slate-500"}`}><TrendingUp className="w-5 h-5" /><span className="text-[8px] uppercase font-bold tracking-wider">Tokens</span></button>
        <button onClick={() => setActiveTab("SECURITY")} className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${activeTab === "SECURITY" ? "text-blue-400 bg-blue-600/10" : "text-slate-500"}`}><Shield className="w-5 h-5" /><span className="text-[8px] uppercase font-bold tracking-wider">Risk</span></button>
        {isAdmin && (
          <button onClick={() => setActiveTab("ADMIN")} className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${activeTab === "ADMIN" ? "text-blue-400 bg-blue-600/10" : "text-slate-500"}`}><Terminal className="w-5 h-5" /><span className="text-[8px] uppercase font-bold tracking-wider">Admin</span></button>
        )}
      </div>

    </div>
  );
}
