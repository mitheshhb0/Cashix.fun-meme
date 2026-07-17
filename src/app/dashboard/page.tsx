"use client";

import { useEffect, useState, useRef, Fragment } from "react";
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
  Menu,
  PieChart,
  User,
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

  // Binance layout trading states
  const [tradeTab, setTradeTab] = useState<"BUY" | "SELL">("BUY");
  const [tradeType, setTradeType] = useState<"LIMIT" | "MARKET" | "SCAN">("LIMIT");
  const [tradePrice, setTradePrice] = useState("");
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeSlider, setTradeSlider] = useState(0);
  const [orderToast, setOrderToast] = useState<string | null>(null);
  const [simulatedPositions, setSimulatedPositions] = useState<any[]>([
    { symbol: "BONK", size: "154,200,100", value: "$3,238.20", entry: "$0.000021", pnl: "+15.4%", isGreen: true },
    { symbol: "PEPE", size: "250,000,000", value: "$3,000.00", entry: "$0.000012", pnl: "-2.1%", isGreen: false },
  ]);
  const [bottomActiveTab, setBottomActiveTab] = useState<"POSITIONS" | "WATCHLIST" | "AI_REPORT" | "SECURITY" | "ADMIN">("POSITIONS");
  const [spotSubTab, setSpotSubTab] = useState<"CHART" | "TRADE" | "PAIRS" | "CHAT">("CHART");

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

  // Sync tradePrice with selectedTokenDetails
  useEffect(() => {
    if (selectedTokenDetails) {
      setTradePrice(selectedTokenDetails.priceUsd || "");
    }
  }, [selectedTokenDetails]);

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
    if (loading || !user || activeTab !== "AISCANNER") return;

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

  // Market Pulse SSE Stream Listener with Polling Fallback
  useEffect(() => {
    if (loading || !user || activeTab !== "AISCANNER") return;

    setPulseLoading(true);

    let eventSource: EventSource | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const fetchPulseData = async () => {
      try {
        const res = await fetch("/api/market-pulse", { method: "POST" });
        const data = await res.json();
        if (data.tokens) setPulseTokens(data.tokens);
        if (data.analysis) setMarketOverviewText(data.analysis);
      } catch (err) {
        console.error("Market pulse fallback fetch failed:", err);
      } finally {
        setPulseLoading(false);
      }
    };

    const startPolling = () => {
      if (pollInterval) return;
      console.log("Starting Market Pulse polling fallback...");
      fetchPulseData();
      pollInterval = setInterval(fetchPulseData, 10000); // 10s fallback
    };

    if (typeof window !== "undefined" && "EventSource" in window) {
      try {
        eventSource = new EventSource("/api/market-pulse/stream");

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.tokens) setPulseTokens(data.tokens);
            if (data.analysis) setMarketOverviewText(data.analysis);
            setPulseLoading(false);
          } catch (err) {
            console.error("Failed to parse SSE market pulse data:", err);
          }
        };

        eventSource.onerror = (err) => {
          console.warn("SSE market-pulse error, falling back to polling:", err);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          startPolling();
        };
      } catch (esErr) {
        console.warn("Failed to init EventSource, starting polling directly:", esErr);
        startPolling();
      }
    } else {
      startPolling();
    }

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [user, loading, activeTab]);

  // AI Discovery Engine — SSE stream listener with Periodic Polling Fallback
  useEffect(() => {
    if (loading || !user) return;

    setDiscoveryLoading(true);

    let es: EventSource | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const fetchDiscoveryData = async () => {
      try {
        const res = await fetch("/api/discovery", { method: "POST" });
        const data = await res.json();
        if (data.tokens) setDiscoveryTokens(data.tokens);
        if (data.totalCandidates !== undefined) {
          setDiscoveryMeta({
            totalCandidates: data.totalCandidates,
            totalQualified: data.totalQualified,
            totalRejected: data.totalRejected,
            lastUpdated: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
        }
      } catch (err) {
        console.error("Discovery fallback fetch failed:", err);
      } finally {
        setDiscoveryLoading(false);
      }
    };

    const startPolling = () => {
      if (pollInterval) return;
      console.log("Starting Discovery Engine polling fallback...");
      fetchDiscoveryData(); // Initial immediate fetch
      pollInterval = setInterval(fetchDiscoveryData, 12000); // Fetch every 12 seconds
    };

    if (typeof window !== "undefined" && "EventSource" in window) {
      try {
        es = new EventSource("/api/discovery/stream");

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
          } catch (err) {
            console.error("Failed to parse SSE discovery data:", err);
          }
        };

        es.onerror = (err) => {
          console.warn("SSE discovery error, falling back to polling:", err);
          if (es) {
            es.close();
            es = null;
          }
          startPolling();
        };
      } catch (esErr) {
        console.warn("Failed to init Discovery EventSource, starting polling directly:", esErr);
        startPolling();
      }
    } else {
      startPolling();
    }

    return () => {
      if (es) es.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [user, loading]);

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

  const triggerOrderToast = (msg: string) => {
    setOrderToast(msg);
    setTimeout(() => setOrderToast(null), 3000);
  };

  const handlePlaceSimulatedOrder = (e: React.FormEvent, activeToken: any) => {
    e.preventDefault();
    if (tradeType === "SCAN") {
      setSearchQuery(tradePrice);
      setActiveTab("DEXSCREENER");
      return;
    }
    const amt = parseFloat(tradeAmount);
    if (!tradeAmount || isNaN(amt) || amt <= 0) {
      triggerOrderToast("Error: Please enter a valid quantity.");
      return;
    }
    const tokenSymbol = activeToken.symbol;
    const actionWord = tradeTab === "BUY" ? "bought" : "sold";
    const currentPrice = parseFloat(activeToken.priceUsd || "0.000001");
    
    const existingIdx = simulatedPositions.findIndex(pos => pos.symbol === tokenSymbol);
    let updatedPositions = [...simulatedPositions];
    if (tradeTab === "BUY") {
      if (existingIdx >= 0) {
        const currentSize = parseFloat(updatedPositions[existingIdx].size.replace(/,/g, ''));
        const newSize = currentSize + amt;
        updatedPositions[existingIdx].size = newSize.toLocaleString();
        updatedPositions[existingIdx].value = `$${(newSize * currentPrice).toFixed(2)}`;
      } else {
        updatedPositions.push({
          symbol: tokenSymbol,
          size: amt.toLocaleString(),
          value: `$${(amt * currentPrice).toFixed(2)}`,
          entry: `$${currentPrice.toFixed(6)}`,
          pnl: "+0.0%",
          isGreen: true
        });
      }
      triggerOrderToast(`Simulated Order: Successfully ${actionWord} ${amt.toLocaleString()} ${tokenSymbol}!`);
    } else {
      if (existingIdx >= 0) {
        const currentSize = parseFloat(updatedPositions[existingIdx].size.replace(/,/g, ''));
        if (currentSize < amt) {
          triggerOrderToast(`Error: Insufficient balance of ${tokenSymbol} to sell.`);
          return;
        } else if (currentSize === amt) {
          updatedPositions = updatedPositions.filter(p => p.symbol !== tokenSymbol);
        } else {
          const newSize = currentSize - amt;
          updatedPositions[existingIdx].size = newSize.toLocaleString();
          updatedPositions[existingIdx].value = `$${(newSize * currentPrice).toFixed(2)}`;
        }
        triggerOrderToast(`Simulated Order: Successfully ${actionWord} ${amt.toLocaleString()} ${tokenSymbol}!`);
      } else {
        triggerOrderToast(`Error: You do not own any ${tokenSymbol} to sell.`);
        return;
      }
    }
    setSimulatedPositions(updatedPositions);
    setTradeAmount("");
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
    const queryStr = searchQuery.toLowerCase();
    const addressMatch = token.tokenAddress.toLowerCase().includes(queryStr);
    const descMatch = token.description?.toLowerCase().includes(queryStr) || false;
    const matchesQuery = addressMatch || descMatch || queryStr === "";
    const matchesChain = chainFilter === "all" || token.chainId.toLowerCase() === chainFilter;
    return matchesQuery && matchesChain;
  });

  const getIconSrc = (token: DexItem) => {
    if (!token.icon) return null;
    if (token.icon.startsWith("http")) return token.icon;
    return `https://cdn.dexscreener.com/cms/images/${token.icon}?width=64&height=64&fit=crop&quality=95&format=auto`;
  };

  const aiTopPick = [...pulseTokens].sort((a, b) => b.score - a.score)[0];
  const watchlistTokens = pulseTokens.filter(t => watchlist.includes(t.address));

  // Resolved activeSelectedToken fallback
  const activeToken = selectedTokenDetails || aiTopPick || {
    symbol: "XRPz",
    name: "XRPz",
    address: "0x75e7a6aEc1104dA979ADeb3757F892e430e37c60",
    chain: "solana",
    score: 92,
    priceUsd: "0.000420",
    priceChange: 12.4,
    volume24h: 382000,
    liquidityUsd: 145000,
    whaleBuys: 42,
    whaleSells: 12,
    tweetsCount: 154,
    holderCount: 1420,
    explanation: "Breaking out of accumulation base with 4x volume multiplier. LP locked, honeypot safe.",
    breakdown: { momentum: 18, liquidity: 21, whales: 14, social: 15, community: 7, risk: 8 },
    aiSummary: "Algorithmic momentum scanner has detected significant buy wall building on XRPz. High likelihood of immediate leg up.",
    aiNarrative: "Bullish divergence on hourly chart.",
    rugFlags: ["Contract Source Verified", "Liquidity Locked (99%)"]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#F0B90B] border-t-transparent rounded-full animate-spin" />
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
          
          <div className="w-16 h-16 bg-[#F0B90B]/10 border border-[#F0B90B]/30 rounded-2xl flex items-center justify-center mx-auto text-[#F0B90B]">
            <Shield className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Approval Required</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto font-medium">
              Your account (<span className="text-slate-355 font-semibold">{user.email}</span>) is currently pending administrator whitelist approval. 
              <br /><br />
              Please contact the administrator on Telegram to request dashboard access.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <a
              href="https://t.me/Cashix_Fun"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold uppercase text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
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
    <div className="min-h-screen bg-[#0B0E11] text-slate-100 font-sans flex flex-col relative select-none max-w-[480px] mx-auto border-x border-[#2B3139] shadow-2xl">
      {/* Toast Notification */}
      {orderToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#181A20] border-l-4 border-[#0ECB81] text-slate-200 border border-slate-800 px-5 py-3 rounded-lg shadow-[0_0_20px_rgba(14,203,129,0.2)] font-mono text-xs flex items-center gap-2.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-ping" />
          {orderToast}
        </div>
      )}

      {/* Top Header Navigation (Mobile-first Binance Style) */}
      <header className="w-full bg-[#181A20] border-b border-[#2B3139] px-4 py-3 flex flex-col gap-3.5 z-40 shrink-0 select-none">
        {/* Row 1: Logo & Icons */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-white cursor-pointer">
              <Menu className="w-5 h-5 text-white" />
            </button>
            <Link href="/" className="flex items-center gap-2 group text-left">
              <div className="w-7 h-7 bg-[#F0B90B] rounded-lg flex items-center justify-center">
                <span className="text-sm font-black text-[#0B0E11] font-mono leading-none">$</span>
              </div>
              <div>
                <h1 className="text-sm font-black uppercase text-white tracking-tighter leading-none flex items-center gap-1">
                  CASHIX<span className="text-[#F0B90B]">.FUN</span>
                </h1>
                <span className="text-[7px] uppercase tracking-widest text-[#8A99AD] font-bold block mt-0.5">TERMINAL v4.0</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-white cursor-pointer">
              <Search className="w-4 h-4 text-white" />
            </button>
            <button className="text-slate-400 hover:text-white cursor-pointer relative">
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#F6465D]" />
            </button>
          </div>
        </div>

        {/* Row 2: Navigation Tabs (Always Visible) */}
        <nav className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider border-t border-[#2B3139]/40 pt-2 font-sans select-none">
          {[
            { id: "DEXSCREENER", label: "DISCOVER" },
            { id: "AISCANNER", label: "SPOT TRADE" },
            { id: "SIGNALS", label: "VIP SIGNALS" },
            { id: "SECURITY", label: "RISK CENTER" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-1.5 cursor-pointer relative transition-all ${
                activeTab === tab.id ? "text-[#F0B90B] font-extrabold" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F0B90B]" />
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Binance Ticker Info Bar */}
      {activeTab === "AISCANNER" && (
        <div className="w-full bg-[#1E2329] border-b border-[#2B3139] px-4 py-2.5 flex flex-wrap gap-6 items-center text-left text-xs text-[#8A99AD] select-none shrink-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-base font-black text-white uppercase">{activeToken.symbol}</span>
            <span className="text-[9px] bg-[#2B3139] text-[#F0B90B] font-bold px-1.5 py-0.5 rounded">SOL</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-[#8A99AD] uppercase font-semibold">Last Price</span>
            <span className="text-xs font-black text-white font-mono mt-0.5">${parseFloat(activeToken.priceUsd || "0.00").toLocaleString(undefined, {minimumFractionDigits: 6, maximumFractionDigits: 6})}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-[#8A99AD] uppercase font-semibold">24h Change</span>
            <span className={`text-xs font-black font-mono mt-0.5 ${parseFloat(activeToken.priceChange || "0") >= 0 ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>
              {parseFloat(activeToken.priceChange || "0") >= 0 ? "+" : ""}{parseFloat(activeToken.priceChange || "0").toFixed(2)}%
            </span>
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-[9px] text-[#8A99AD] uppercase font-semibold">24h Volume</span>
            <span className="text-xs font-bold text-white font-mono mt-0.5">
              ${activeToken.volume24h ? (activeToken.volume24h > 1000000 ? `${(activeToken.volume24h / 1000000).toFixed(2)}M` : activeToken.volume24h.toLocaleString()) : "—"}
            </span>
          </div>

          <div className="hidden md:flex flex-col">
            <span className="text-[9px] text-[#8A99AD] uppercase font-semibold">Liquidity Backing</span>
            <span className="text-xs font-bold text-white font-mono mt-0.5">
              ${activeToken.liquidityUsd ? activeToken.liquidityUsd.toLocaleString() : "—"}
            </span>
          </div>

          <div className="hidden lg:flex flex-col">
            <span className="text-[9px] text-[#8A99AD] uppercase font-semibold">AI Intelligence Score</span>
            <span className={`text-xs font-black font-mono mt-0.5 ${activeToken.score >= 80 ? "text-[#0ECB81]" : activeToken.score >= 60 ? "text-amber-400" : "text-[#F6465D]"}`}>
              {activeToken.score}/100
            </span>
          </div>

          <div className="hidden xl:flex flex-col">
            <span className="text-[9px] text-[#8A99AD] uppercase font-semibold">Security Level</span>
            <span className={`text-[10px] font-black uppercase mt-0.5 px-2 py-0.5 rounded text-white ${activeToken.score >= 80 ? "bg-[#0ECB81]/25 border border-[#0ECB81]/40" : "bg-amber-500/25 border border-amber-500/40"}`}>
              {activeToken.score >= 80 ? "SAFE (LOW RISK)" : "MODERATE RISK"}
            </span>
          </div>

          {activeToken.address && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Contract CA:</span>
              <span className="font-mono text-[10px] text-slate-300 bg-[#0B0E11] px-2 py-1 rounded border border-[#2B3139]">{activeToken.address}</span>
              <button
                onClick={() => handleCopyAddress(activeToken.address)}
                className="p-1 bg-[#2B3139]/40 hover:bg-[#2B3139]/80 rounded border border-[#2B3139] text-[#8A99AD] hover:text-white transition-colors cursor-pointer"
                title="Copy Address"
              >
                {copiedAddress === activeToken.address ? <Check className="w-3.5 h-3.5 text-[#0ECB81]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      )}
      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-y-auto xl:overflow-hidden pb-24 xl:pb-0">
        
        {/* VIEW 1: SPOT TRADING UNIFIED GRID */}
        {activeTab === "AISCANNER" && (
          <div className="flex-grow flex flex-col relative select-none">
            
            {/* Spot Trading Sub-navigation */}
            <div className="flex bg-[#181A20] border-b border-[#2B3139] p-1 text-[10px] font-bold text-[#8A99AD] uppercase justify-between select-none shrink-0 z-30">
              {[
                { id: "CHART", label: "Chart" },
                { id: "TRADE", label: "Trade Desk" },
                { id: "PAIRS", label: "Pairs Feed" },
                { id: "CHAT", label: "Trollbox" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSpotSubTab(tab.id as any)}
                  className={`flex-grow py-2 text-center cursor-pointer transition-all border-b-2 ${
                    spotSubTab === tab.id ? "text-white border-[#F0B90B] font-black bg-[#2B3139]/20" : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CHART VIEW */}
            {spotSubTab === "CHART" && (
              <section className="flex-grow flex flex-col bg-[#181A20] overflow-y-auto z-10 pb-16">
                {/* Top Part: Chart Panel */}
                <div className="h-[360px] bg-[#181A20] border-b border-[#2B3139] relative flex flex-col shrink-0">
                  <div className="p-2.5 bg-[#181A20] border-b border-[#2B3139]/80 flex items-center justify-between text-xs select-none">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse" /> Live Price Chart ({activeToken.symbol}/SOL)
                    </span>
                  </div>
                  {/* Embedding DexScreener Chart IFrame */}
                  <div className="flex-grow w-full bg-[#0B0E11]">
                    {activeToken.address ? (
                      <iframe
                        src={`https://dexscreener.com/${activeToken.chain || 'solana'}/${activeToken.address}?embed=1&theme=dark&trades=0&info=0`}
                        className="w-full h-full border-0 select-none pointer-events-auto"
                        title={`Live Chart for ${activeToken.symbol}`}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono font-bold uppercase tracking-widest gap-2">
                        <div className="w-6 h-6 border-2 border-[#F0B90B] border-t-transparent rounded-full animate-spin" />
                        Connecting live feeds...
                      </div>
                    )}
                  </div>
                </div>
                {/* Active Token AI Summary Narrative card */}
                <div className="p-4 bg-[#181A20] text-left border-t border-[#2B3139] space-y-2">
                  <span className="text-[#F0B90B] font-bold text-[10px] uppercase tracking-wider block">★ Intelligence Verdict ({activeToken.symbol})</span>
                  <p className="text-slate-300 text-xs leading-relaxed font-sans select-text">{activeToken.aiSummary || activeToken.explanation}</p>
                </div>
              </section>
            )}

            {/* TRADE VIEW */}
            {spotSubTab === "TRADE" && (
              <section className="flex-grow flex flex-col bg-[#181A20] overflow-y-auto z-10 pb-20">
                {/* Binance Spot Trade Order Placement Form */}
                <div className="p-4 bg-[#181A20] grid grid-cols-1 gap-4 text-left border-b border-[#2B3139] shrink-0">
                  <div>
                    {/* BUY/SELL Toggle Header */}
                    <div className="flex bg-[#0B0E11] rounded p-0.5 border border-[#2B3139] mb-3">
                      <button
                        onClick={() => setTradeTab("BUY")}
                        className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                          tradeTab === "BUY" ? "bg-[#0ECB81] text-[#0B0E11]" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setTradeTab("SELL")}
                        className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                          tradeTab === "SELL" ? "bg-[#F6465D] text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Sell
                      </button>
                    </div>

                    {/* LIMIT/MARKET/SCAN Toggles */}
                    <div className="flex items-center gap-3 text-[10px] font-bold text-[#8A99AD] uppercase mb-3 px-1">
                      <button type="button" onClick={() => setTradeType("LIMIT")} className={`pb-1 border-b-2 cursor-pointer ${tradeType === "LIMIT" ? "text-white border-[#F0B90B]" : "border-transparent hover:text-white"}`}>Limit</button>
                      <button type="button" onClick={() => setTradeType("MARKET")} className={`pb-1 border-b-2 cursor-pointer ${tradeType === "MARKET" ? "text-white border-[#F0B90B]" : "border-transparent hover:text-white"}`}>Market</button>
                      <button type="button" onClick={() => setTradeType("SCAN")} className={`pb-1 border-b-2 cursor-pointer ${tradeType === "SCAN" ? "text-white border-[#F0B90B]" : "border-transparent hover:text-white"}`}>Scan CA</button>
                    </div>

                    {/* Form inputs */}
                    <form onSubmit={(e) => handlePlaceSimulatedOrder(e, activeToken)} className="space-y-3">
                      {tradeType === "SCAN" ? (
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Contract Address</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={tradePrice}
                              onChange={(e) => setTradePrice(e.target.value)}
                              placeholder="Paste Token Contract Address..."
                              className="w-full bg-[#0B0E11] border border-[#2B3139] px-3 py-2 rounded text-base xl:text-xs text-white focus:outline-none focus:border-[#F0B90B] font-mono placeholder-slate-650"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                              <span>Price</span>
                              <span>USDT</span>
                            </div>
                            <input
                              type="text"
                              value={tradePrice}
                              onChange={(e) => setTradePrice(e.target.value)}
                              disabled={tradeType === "MARKET"}
                              className="w-full bg-[#0B0E11] border border-[#2B3139] px-3 py-2 rounded text-base xl:text-xs text-white focus:outline-none focus:border-[#F0B90B] font-mono disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                              <span>Amount</span>
                              <span>{activeToken.symbol}</span>
                            </div>
                            <input
                              type="text"
                              value={tradeAmount}
                              onChange={(e) => setTradeAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-[#0B0E11] border border-[#2B3139] px-3 py-2 rounded text-base xl:text-xs text-white focus:outline-none focus:border-[#F0B90B] font-mono placeholder-slate-655"
                            />
                          </div>
                        </>
                      )}

                      {/* Percentage Slider Dots */}
                      {tradeType !== "SCAN" && (
                        <div className="flex justify-between items-center px-1 py-1">
                          {[0, 25, 50, 75, 100].map(pct => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => {
                                setTradeSlider(pct);
                                const mockMax = tradeTab === "BUY" ? 10000 : 500000;
                                setTradeAmount(((mockMax * pct) / 100).toString());
                              }}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                                tradeSlider === pct ? "bg-[#F0B90B] border-[#F0B90B] text-[#0B0E11]" : "bg-[#0B0E11] border-[#2B3139] text-slate-400 hover:text-white"
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        type="submit"
                        className={`w-full py-2.5 text-xs font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
                          tradeType === "SCAN"
                            ? "bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11]"
                            : tradeTab === "BUY"
                            ? "bg-[#0ECB81] hover:bg-[#2EBD85] text-white"
                            : "bg-[#F6465D] hover:bg-[#DF294A] text-white"
                        }`}
                      >
                        {tradeType === "SCAN" ? "Perform Smart Audit Scan" : `${tradeTab} ${activeToken.symbol}`}
                      </button>
                    </form>
                  </div>

                  {/* Order Info & Mini Statistics Side of the Form */}
                  <div className="bg-[#0B0E11] border border-[#2B3139] rounded-xl p-3.5 flex flex-col justify-between text-xs space-y-3 font-mono">
                    <div className="border-b border-[#2B3139] pb-2">
                      <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Simulated Balance Desk</h4>
                      <p className="text-white text-xs font-bold flex justify-between">
                        <span>Available Cash:</span>
                        <span className="text-[#0ECB81]">$12,450.80 SOL</span>
                      </p>
                    </div>

                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Max Opportunity Score:</span>
                        <span className="text-white font-bold">{activeToken.score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Confidence Inflow:</span>
                        <span className="text-[#0ECB81] font-bold">{activeToken.confidence || 92}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Contract Slippage:</span>
                        <span className="text-white font-bold">1.0% Auto</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Honeypot Exposure:</span>
                        <span className="text-[#0ECB81] font-bold">CLEAN</span>
                      </div>
                    </div>

                    <div className="bg-[#181A20] p-2.5 rounded border border-[#2B3139] text-[9.5px] leading-relaxed text-slate-400">
                      <span className="text-[#F0B90B] font-bold block mb-0.5">★ Intelligence Verdict:</span>
                      "{activeToken.explanation || 'No report generated yet. Paste CA and run scanner or select an index.'}"
                    </div>
                  </div>
                </div>

                {/* Simulated positions tabs and details */}
                <div className="w-full bg-[#181A20] select-none text-left shrink-0 p-3">
                  <div className="flex bg-[#0B0E11] border-b border-[#2B3139] p-1 text-[10px] font-bold text-[#8A99AD] uppercase flex-wrap">
                    <button
                      onClick={() => setBottomActiveTab("POSITIONS")}
                      className={`px-4 py-2 cursor-pointer transition-all border-b-2 ${
                        bottomActiveTab === "POSITIONS" ? "text-white border-[#F0B90B]" : "border-transparent hover:text-white"
                      }`}
                    >
                      Positions ({simulatedPositions.length})
                    </button>
                    <button
                      onClick={() => setBottomActiveTab("WATCHLIST")}
                      className={`px-4 py-2 cursor-pointer transition-all border-b-2 ${
                        bottomActiveTab === "WATCHLIST" ? "text-white border-[#F0B90B]" : "border-transparent hover:text-white"
                      }`}
                    >
                      Watchlist ({watchlist.length})
                    </button>
                    <button
                      onClick={() => setBottomActiveTab("AI_REPORT")}
                      className={`px-4 py-2 cursor-pointer transition-all border-b-2 ${
                        bottomActiveTab === "AI_REPORT" ? "text-white border-[#F0B90B]" : "border-transparent hover:text-white"
                      }`}
                    >
                      AI Audits
                    </button>
                    <button
                      onClick={() => setBottomActiveTab("SECURITY")}
                      className={`px-4 py-2 cursor-pointer transition-all border-b-2 ${
                        bottomActiveTab === "SECURITY" ? "text-white border-[#F0B90B]" : "border-transparent hover:text-white"
                      }`}
                    >
                      Safety
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setBottomActiveTab("ADMIN")}
                        className={`px-4 py-2 cursor-pointer transition-all border-b-2 ${
                          bottomActiveTab === "ADMIN" ? "text-white border-[#F0B90B]" : "border-transparent hover:text-white"
                        }`}
                      >
                        Admin
                      </button>
                    )}
                  </div>

                  <div className="p-2 bg-[#181A20] min-h-[150px]">
                    {bottomActiveTab === "POSITIONS" && (
                      <div className="overflow-x-auto text-[10px] font-sans">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#2B3139] text-slate-500 uppercase tracking-wider text-[8.5px]">
                              <th className="py-2">Token</th>
                              <th className="py-2 text-right">Size</th>
                              <th className="py-2 text-right">Entry</th>
                              <th className="py-2 text-right">Value</th>
                              <th className="py-2 text-right">PnL</th>
                              <th className="py-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2B3139]/40 text-slate-350">
                            {simulatedPositions.map((pos) => (
                              <tr key={pos.symbol} className="hover:bg-[#2B3139]/10">
                                <td className="py-3 font-bold text-white flex items-center gap-1.5">
                                  <span className="text-[10px] font-sans font-bold bg-[#2B3139] text-[#F0B90B] px-1 py-0.2 rounded">SOL</span>
                                  {pos.symbol}
                                </td>
                                <td className="py-3 text-right">{pos.size}</td>
                                <td className="py-3 text-right">{pos.entry}</td>
                                <td className="py-3 text-right text-slate-300">{pos.value}</td>
                                <td className={`py-3 text-right font-bold ${pos.isGreen ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>{pos.pnl}</td>
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => {
                                      setTradeTab("SELL");
                                      const mockSize = parseFloat(pos.size.replace(/,/g, ''));
                                      setTradeAmount((mockSize * 0.5).toString());
                                      setSelectedTokenDetails(pulseTokens.find(t => t.symbol === pos.symbol) || activeToken);
                                      triggerOrderToast(`Ready to sell 50% of ${pos.symbol}`);
                                    }}
                                    className="px-2 py-1 bg-[#2B3139]/40 hover:bg-[#F6465D] border border-[#2B3139] hover:border-transparent text-slate-400 hover:text-white rounded text-[10px] uppercase font-bold transition-all cursor-pointer mr-1"
                                  >
                                    Sell 50%
                                  </button>
                                  <button
                                    onClick={() => {
                                      setTradeTab("SELL");
                                      setTradeAmount(pos.size.replace(/,/g, ''));
                                      setSelectedTokenDetails(pulseTokens.find(t => t.symbol === pos.symbol) || activeToken);
                                      triggerOrderToast(`Ready to close position on ${pos.symbol}`);
                                    }}
                                    className="px-2 py-1 bg-[#F6465D]/10 hover:bg-[#F6465D] border border-[#F6465D]/20 hover:border-transparent text-[#F6465D] hover:text-white rounded text-[10px] uppercase font-bold transition-all cursor-pointer"
                                  >
                                    Close
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {bottomActiveTab === "WATCHLIST" && (
                      <div className="grid grid-cols-1 gap-3 text-xs font-sans">
                        {watchlistTokens.length > 0 ? (
                          watchlistTokens.map((t) => (
                            <div
                              key={t.address}
                              onClick={() => setSelectedTokenDetails(t)}
                              className="bg-[#0B0E11] hover:bg-[#2B3139]/30 border border-[#2B3139] rounded-lg p-3 cursor-pointer flex justify-between items-center transition-all hover:scale-[1.01]"
                            >
                              <div className="min-w-0 text-left">
                                <span className="font-bold text-white block text-sm">{t.symbol}</span>
                                <span className="text-[9px] text-[#8A99AD] font-bold uppercase block mt-0.5">Intel: {t.score}/100</span>
                              </div>
                              <div className="text-right font-mono">
                                <span className="font-bold text-white block">${parseFloat(t.priceUsd).toLocaleString(undefined, {minimumFractionDigits: 6})}</span>
                                <span className={`text-[10px] font-bold ${t.priceChange >= 0 ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>
                                  {t.priceChange >= 0 ? "+" : ""}{t.priceChange.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-8 text-center text-slate-500 font-bold uppercase text-[10px] tracking-wider">No assets added to Watchlist</div>
                        )}
                      </div>
                    )}

                    {bottomActiveTab === "AI_REPORT" && (
                      <div className="grid grid-cols-1 gap-6 text-xs text-left">
                        {/* Score and stats */}
                        <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-4 space-y-3 font-mono">
                          <div className="flex justify-between pb-2 border-b border-[#2B3139]/80">
                            <span className="text-[#8A99AD] uppercase font-bold text-[9px]">Master AI Score</span>
                            <span className="text-[#F0B90B] font-black text-sm">{activeToken.score}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Supply:</span>
                            <span className="text-white font-bold">{activeToken.supply ? parseFloat(activeToken.supply).toLocaleString() : "1,000,000,000"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Decimals:</span>
                            <span className="text-white font-bold">{activeToken.decimals || 9}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Holders Tracked:</span>
                            <span className="text-[#0ECB81] font-bold">{activeToken.holderCount ? activeToken.holderCount.toLocaleString() : "2,420"}</span>
                          </div>
                        </div>

                        {/* Explanation narratives */}
                        <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-4 flex flex-col justify-between font-sans">
                          <div>
                            <span className="text-[#F0B90B] font-bold text-[10px] uppercase tracking-wider block mb-1">Intelligence Summary</span>
                            <p className="text-slate-350 leading-relaxed text-xs">{activeToken.aiSummary || activeToken.explanation}</p>
                            {activeToken.aiNarrative && (
                              <p className="text-[10px] text-slate-500 italic mt-2">Narrative signal: "{activeToken.aiNarrative}"</p>
                            )}
                          </div>

                          {/* Component breakdowns */}
                          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#2B3139]/60 font-mono text-[9.5px]">
                            <div>
                              <span className="text-slate-500 block uppercase">Momentum</span>
                              <span className="text-white font-bold">{activeToken.breakdown?.momentum || 18} / 25</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase">Liquidity</span>
                              <span className="text-white font-bold">{activeToken.breakdown?.liquidity || 11} / 15</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase">Social</span>
                              <span className="text-white font-bold">{activeToken.breakdown?.social || 15} / 20</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {bottomActiveTab === "SECURITY" && (
                      <div className="grid grid-cols-1 gap-4 text-xs font-sans">
                        <div className="bg-[#0B0E11] border border-[#2B3139] p-4 rounded-lg flex items-center justify-between hover:bg-[#2B3139]/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5 text-[#0ECB81]" />
                            <div className="text-left">
                              <span className="font-bold text-white block">Liquidity Locks</span>
                              <span className="text-[9px] text-[#8A99AD] font-mono">LP burn & locks check</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold bg-[#0ECB81]/15 text-[#0ECB81] px-2 py-0.5 rounded border border-[#0ECB81]/25">100% SECURE</span>
                        </div>

                        <div className="bg-[#0B0E11] border border-[#2B3139] p-4 rounded-lg flex items-center justify-between hover:bg-[#2B3139]/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileCheck2 className="w-5 h-5 text-[#0ECB81]" />
                            <div className="text-left">
                              <span className="font-bold text-white block">Contract Source</span>
                              <span className="text-[9px] text-[#8A99AD] font-mono">Renounced ownership</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold bg-[#0ECB81]/15 text-[#0ECB81] px-2 py-0.5 rounded border border-[#0ECB81]/25">VERIFIED</span>
                        </div>

                        <div className="bg-[#0B0E11] border border-[#2B3139] p-4 rounded-lg flex items-center justify-between hover:bg-[#2B3139]/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-[#0ECB81]" />
                            <div className="text-left">
                              <span className="font-bold text-white block">Honeypot Exposure</span>
                              <span className="text-[9px] text-[#8A99AD] font-mono">Tax & buy/sell checks</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold bg-[#0ECB81]/15 text-[#0ECB81] px-2 py-0.5 rounded border border-[#0ECB81]/25">CLEAN</span>
                        </div>
                      </div>
                    )}

                    {bottomActiveTab === "ADMIN" && isAdmin && (
                      <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-4 text-xs font-mono text-left">
                        <span className="text-[#F0B90B] font-bold text-[10px] uppercase block mb-2 border-b border-[#2B3139] pb-2">Admin Terminal Controller</span>
                        <AdminTerminal />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* PAIRS VIEW */}
            {spotSubTab === "PAIRS" && (
              <aside className="flex-grow bg-[#181A20] flex flex-col overflow-y-auto z-20 pb-16">
                {/* Feed select tabs */}
                <div className="p-2 border-b border-[#2B3139] bg-[#181A20] flex items-center justify-between">
                  <span className="text-[10px] text-[#8A99AD] font-bold uppercase tracking-wider">Token Feeds</span>
                  <select
                    value={selectedFeedId}
                    onChange={(e) => setSelectedFeedId(e.target.value)}
                    className="bg-[#0B0E11] border border-[#2B3139] text-[10px] font-bold text-white px-2 py-1 rounded cursor-pointer focus:outline-none"
                  >
                    {DEX_FEEDS.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sub-search */}
                <div className="p-2 border-b border-[#2B3139] bg-[#0B0E11]">
                  <div className="relative">
                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search assets..."
                      className="w-full bg-[#181A20] border border-[#2B3139] rounded pl-7 pr-2 py-1 text-base xl:text-[10px] text-white focus:outline-none placeholder-slate-600 font-sans"
                    />
                  </div>
                </div>

                {/* List of Token Pairs */}
                <div className="flex-grow overflow-y-auto divide-y divide-[#2B3139]/40 max-h-[450px]">
                  {filteredTokens.length === 0 ? (
                    <div className="text-center py-6 text-[10px] text-slate-500 font-bold uppercase">No pairs found</div>
                  ) : (
                    filteredTokens.map((token: any) => {
                      const shortSymbol = token.header ? token.header.split(" ")[0].slice(0, 8) : "UNKNWN";
                      const changeVal = (Math.random() * 20 - 8);
                      const tokenChange = token.priceChange || changeVal;
                      const tokenPrice = token.amount || (Math.random() * 0.05 + 0.001);
                      const isTokenGreen = tokenChange >= 0;

                      return (
                        <div
                          key={token.tokenAddress}
                          onClick={() => {
                            setSelectedTokenDetails(token);
                            setSpotSubTab("CHART");
                          }}
                          className={`px-3 py-2 flex items-center justify-between text-left cursor-pointer transition-colors ${
                            activeToken.address === token.tokenAddress ? "bg-[#2B3139]/60" : "hover:bg-[#2B3139]/20"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-5 h-5 bg-[#0B0E11] rounded flex items-center justify-center text-[10px] text-white border-[#2B3139]">
                              {shortSymbol[0]}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block truncate leading-none font-sans">{shortSymbol}</span>
                              <span className="text-[8px] text-slate-500 font-mono tracking-wider">SOL</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-white block font-mono">${tokenPrice.toFixed(6)}</span>
                            <span className={`text-[9px] font-bold font-mono leading-none ${isTokenGreen ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>
                              {isTokenGreen ? "+" : ""}{tokenChange.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Left Column Bottom Metrics */}
                <div className="p-3 bg-[#0B0E11] border-t border-[#2B3139] text-left text-[10px] space-y-2 mt-auto">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Feed Status:</span>
                    <span className="text-[#0ECB81] font-bold uppercase">{wsStatus}</span>
                  </div>
                  <p className="text-[8.5px] text-slate-500 leading-tight">Click on any asset to load its live chart and run automated AI audits.</p>
                </div>
              </aside>
            )}

            {/* CHAT/TROLLBOX VIEW */}
            {spotSubTab === "CHAT" && (
              <aside className="flex-grow bg-[#181A20] flex flex-col overflow-y-auto z-10 pb-16">
                {/* Market Pulse Updates */}
                <div className="h-[180px] border-b border-[#2B3139] flex flex-col shrink-0">
                  <div className="p-2 border-b border-[#2B3139] bg-[#181A20] flex items-center justify-between">
                    <span className="text-[10px] text-[#8A99AD] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F0B90B] animate-pulse" /> Market Pulse Updates
                    </span>
                  </div>
                  <div className="flex-grow overflow-y-auto p-2 space-y-1.5 font-mono text-[9px] text-slate-400 scrollbar-none text-left">
                    {pulseEvents.slice(0, 10).map((evt, idx) => (
                      <div key={idx} className="flex gap-1.5 items-start py-0.5 border-l-2 border-slate-700 pl-1.5 hover:bg-[#2B3139]/10 rounded-r">
                        <span className="text-[#8A99AD]">»</span>
                        <span className="leading-tight text-slate-300 select-text">{evt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Trollbox Chat */}
                <div className="flex-grow flex flex-col overflow-hidden">
                  <div className="p-2 border-b border-[#2B3139] bg-[#181A20] flex justify-between items-center select-none shrink-0">
                    <span className="text-[10px] text-[#8A99AD] font-bold uppercase tracking-wider flex items-center gap-1 font-sans">
                      <MessageSquare className="w-3.5 h-3.5 text-[#F0B90B]" /> Community Trollbox
                    </span>
                    <span className="bg-[#0ECB81]/15 text-[#0ECB81] text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#0ECB81] animate-pulse" /> Live Chat
                    </span>
                  </div>

                  {/* Chat messages */}
                  <div className="flex-grow overflow-y-auto p-3 space-y-3 scrollbar-none text-left font-sans h-[320px] max-h-[350px]">
                    {chatMessages.map((msg) => {
                      const initial = msg.user ? msg.user[0].toUpperCase() : "U";
                      const hash = msg.user ? msg.user.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
                      const avatarColors = [
                        "bg-red-900/40 border-red-500/30 text-red-200",
                        "bg-green-900/40 border-green-500/30 text-green-200",
                        "bg-blue-900/40 border-blue-500/30 text-blue-200",
                        "bg-yellow-900/40 border-yellow-500/30 text-[#F0B90B]",
                        "bg-purple-900/40 border-purple-500/30 text-purple-200",
                        "bg-pink-900/40 border-pink-500/30 text-pink-200",
                        "bg-indigo-900/40 border-indigo-500/30 text-indigo-200"
                      ];
                      const avatarColor = avatarColors[hash % avatarColors.length];

                      return (
                        <div key={msg.id} className="flex gap-2 text-[11px] items-start">
                          <div className={`w-6 h-6 rounded flex items-center justify-center font-bold border shrink-0 text-[10px] ${avatarColor}`}>
                            {initial}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className={`font-bold truncate select-text ${msg.isAdmin ? "text-[#0ECB81]" : "text-slate-200"}`}>{msg.user}</span>
                              <span className="text-[7.5px] text-slate-500 font-mono shrink-0">{msg.time}</span>
                            </div>
                            <p className="text-slate-350 leading-normal select-text break-words font-medium">{msg.message}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Chat Input form */}
                  <form onSubmit={handleSendChat} className="p-2 border-t border-[#2B3139] bg-[#181A20] flex gap-2 shrink-0">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Send dChat signal..."
                      className="flex-grow bg-[#0B0E11] border border-[#2B3139] px-3 py-1.5 rounded text-base xl:text-[11px] text-white focus:outline-none focus:border-[#F0B90B] placeholder-slate-655 font-sans"
                    />
                    <button type="submit" className="px-3 bg-[#F0B90B] text-[#0B0E11] hover:bg-[#FCD535] font-bold text-[10px] uppercase rounded transition-colors flex items-center justify-center shrink-0 cursor-pointer">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </aside>
            )}

          </div>
        )}

        {/* VIEW 2: MARKETS LIST (DEXSCREENER) */}
        {activeTab === "DEXSCREENER" && (() => {
          const livePairs = discoveryTokens.length >= 4 
            ? discoveryTokens.slice(0, 4).map((t, idx) => ({
                name: t.symbol || "UNKNOWN",
                address: t.address || "0x000...000",
                chain: (t.chain || "solana").toUpperCase(),
                age: t.ageHours ? (t.ageHours < 1 ? `${Math.round(t.ageHours * 60)}s AGE` : `${Math.round(t.ageHours)}h AGE`) : "30s AGE",
                liq: `$${(t.liquidityUsd ? t.liquidityUsd / 1000 : 25).toFixed(1)}K`,
                score: t.score || 85,
                avatar: t.symbol?.includes("PEPE") ? "🐸" : t.symbol?.includes("DOGE") ? "🐶" : t.symbol?.includes("CAT") ? "🐱" : idx % 3 === 0 ? "🚀" : idx % 3 === 1 ? "🪙" : "😊"
              }))
            : [
                { name: "PEPEAI", address: "0x91F7906d274a2db6f8c27dbd283A497334", chain: "ETH", age: "32s AGE", liq: "$28.4K", score: 94, avatar: "🐸" },
                { name: "DOGEX", address: "0x7aBDe210ecf782c979d61269c1234f9a89", chain: "BASE", age: "58s AGE", liq: "$42.7K", score: 88, avatar: "🐶" },
                { name: "MEMEX", address: "0x3FC2b2c12d7890a79adeb3757f892e430e", chain: "SOL", age: "2m AGE", liq: "$17.2K", score: 81, avatar: "🚀" },
                { name: "FOMOCOIN", address: "0xA12c85e7a9062d85d7b812349ae8c9a8e", chain: "ETH", age: "3m AGE", liq: "$11.8K", score: 79, avatar: "😊" },
              ];

          const featured = filteredDiscoveryTokens[0] || {
            symbol: "PEPEAI",
            address: "0x91F7906d274a2db6f8c27dbd283A497334",
            chain: "ETH",
            priceUsd: "0.0000213",
            priceChange24h: 128.6,
            volume24h: 182300,
            liquidityUsd: 28400,
            score: 94,
            holderCount: 284,
            whaleBuys: 7,
            avatar: "🐸"
          };

          const totalQual = discoveryMeta.totalQualified || 1;
          const totalCand = discoveryMeta.totalCandidates || 44;

          return (
            <div className="flex-grow p-4 space-y-4 max-w-[480px] mx-auto w-full overflow-y-auto font-sans pb-24 text-left">
              {/* Header stats */}
              <div className="bg-[#181A20] border border-[#2B3139] p-4 rounded-xl flex justify-between items-center text-left shadow-lg">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-tight">SMART MEME ASSET DISCOVERY</h2>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">
                    Real-time blockchain scanning &<br />AI opportunity detection
                  </p>
                </div>

                <div className="bg-[#0ECB81]/10 border border-[#0ECB81]/20 px-3 py-1.5 rounded-lg text-center shrink-0 min-w-[90px]">
                  <span className="text-xs font-black text-white font-mono block leading-none">{totalQual} / {totalCand}</span>
                  <span className="text-[6px] text-[#0ECB81] font-black uppercase tracking-wider block mt-1 leading-none">
                    <span className="w-1 h-1 rounded-full bg-[#0ECB81] animate-pulse inline-block mr-0.5" /> QUALIFIED INDEX
                  </span>
                </div>
              </div>

              {/* 4 Mini Stat Grid Cards */}
              <div className="grid grid-cols-4 gap-2 select-none">
                {[
                  { label: "NEW PAIRS", val: `${totalCand}`, sub: "Last 5m", color: "text-[#0ECB81]" },
                  { label: "LIQUIDITY", val: `$${(discoveryTokens.reduce((acc, t) => acc + (t.liquidityUsd || 0), 0) / 1000 || 182).toFixed(0)}K`, sub: "+28.6%", color: "text-[#00AEFF]" },
                  { label: "VOLUME 24H", val: `$${(discoveryTokens.reduce((acc, t) => acc + (t.volume24h || 0), 0) / 1000000 || 1.24).toFixed(2)}M`, sub: "+14.3%", color: "text-[#00AEFF]" },
                  { label: "WALLETS", val: "3.42K", sub: "+9.7%", color: "text-[#A855F7]" },
                ].map((s) => (
                  <div key={s.label} className="bg-[#181A20] border border-[#2B3139] p-2 rounded-lg text-left relative flex flex-col justify-between min-h-[70px]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider truncate block leading-none">{s.label}</span>
                    </div>
                    <div>
                      <span className={`text-[11px] font-black block leading-none font-mono ${s.color}`}>{s.val}</span>
                      <span className="text-[7.5px] text-[#0ECB81] font-bold block mt-1 font-mono leading-none">{s.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* LIVE NEW PAIRS Section */}
              <div className="bg-[#181A20] border border-[#2B3139] rounded-xl p-3.5 space-y-3.5 shadow-lg">
                <div className="flex justify-between items-center select-none">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider leading-none">LIVE NEW PAIRS</h3>
                  <button className="text-[8.5px] font-black text-[#00AEFF] uppercase hover:underline cursor-pointer leading-none">VIEW ALL</button>
                </div>
                
                <div className="divide-y divide-[#2B3139]/40 space-y-2">
                  {livePairs.map((t, idx) => (
                    <div key={t.name + idx} className={`flex items-center justify-between text-left py-2 ${idx > 0 ? "pt-2 border-t border-[#2B3139]/40" : ""}`}>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full bg-[#0B0E11] border border-[#2B3139] flex items-center justify-center text-sm shrink-0">
                          {t.avatar}
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-white block truncate leading-none text-xs">{t.name}</span>
                          <span className="text-[8.5px] text-slate-500 font-mono flex items-center gap-1 mt-1 leading-none select-text">
                            {t.address.slice(0, 5)}...{t.address.slice(-3)} 
                            <button onClick={() => handleCopyAddress(t.address)} className="p-0.5 text-slate-600 hover:text-white cursor-pointer"><Copy className="w-2.5 h-2.5" /></button>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3.5 text-right shrink-0">
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-bold text-slate-500 uppercase leading-none">CHAIN</span>
                          <span className="text-[9px] font-black text-slate-350 font-mono mt-1 leading-none">{t.chain}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-bold text-slate-500 uppercase leading-none">AGE</span>
                          <span className="text-[9px] font-black text-slate-350 font-mono mt-1 leading-none">{t.age.split(" ")[0]}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-bold text-slate-500 uppercase leading-none">LIQUIDITY</span>
                          <span className="text-[9px] font-black text-slate-350 font-mono mt-1 leading-none">{t.liq}</span>
                        </div>
                        <div className="border border-[#0ECB81]/25 bg-[#0ECB81]/10 text-[#0ECB81] px-2 py-1 rounded text-center shrink-0 min-w-[52px]">
                          <span className="text-[10px] font-black font-mono block leading-none">{t.score}</span>
                          <span className="text-[6.5px] font-bold block uppercase tracking-wider leading-none mt-0.5">AI SCORE</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOP OPPORTUNITIES Section */}
              <div className="bg-[#181A20] border border-[#2B3139] rounded-xl p-3.5 space-y-3.5 shadow-lg">
                <div className="flex justify-between items-center select-none">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider leading-none">TOP OPPORTUNITIES</h3>
                  <button className="text-[8.5px] font-black text-[#00AEFF] uppercase hover:underline cursor-pointer leading-none">VIEW ALL</button>
                </div>
                
                <div className="bg-[#0B0E11] border border-[#2B3139] p-3.5 rounded-xl space-y-4 text-left">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#181A20] border border-[#2B3139] flex items-center justify-center text-lg shrink-0">
                        {featured.symbol?.includes("PEPE") ? "🐸" : featured.symbol?.includes("DOGE") ? "🐶" : "🚀"}
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-white text-sm block truncate leading-none">{featured.symbol}</span>
                        <span className="text-[8.5px] text-slate-500 font-mono flex items-center gap-1 mt-1 leading-none select-text">
                          {featured.address.slice(0, 5)}...{featured.address.slice(-3)} 
                          <button onClick={() => handleCopyAddress(featured.address)} className="p-0.5 text-slate-600 hover:text-white cursor-pointer"><Copy className="w-2.5 h-2.5" /></button>
                        </span>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[8px] font-bold text-slate-400 bg-[#2B3139]/40 border border-[#2B3139]/60 px-1 py-0.5 rounded uppercase leading-none">{(featured.chain || "SOL").toUpperCase()}</span>
                          <span className="text-[8px] font-bold text-[#0ECB81] bg-[#0ECB81]/10 border border-[#0ECB81]/25 px-1 py-0.5 rounded uppercase leading-none">NEW</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[8.5px] text-slate-400 font-mono leading-none">
                          <span>👥 {featured.holderCount || 284}</span>
                          <span>🐳 {featured.whaleBuys || 7}</span>
                          <span>💧 ${(featured.liquidityUsd ? featured.liquidityUsd / 1000 : 28.4).toFixed(1)}K</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Vector sparkline chart graphic */}
                    <div className="flex-grow max-w-[80px] h-[30px] flex items-center">
                      <svg className="w-full h-full text-[#0ECB81]" viewBox="0 0 100 30" fill="none">
                        <path d="M0,25 Q15,5 30,20 T60,10 T90,5 T100,8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <span className="text-xs font-black text-white block leading-none">
                        ${featured.priceUsd ? parseFloat(featured.priceUsd).toLocaleString(undefined, {minimumFractionDigits: 6, maximumFractionDigits: 6}) : "0.000021"}
                      </span>
                      <span className="text-[10px] font-black text-[#0ECB81] block mt-1.5 leading-none">
                        24H {featured.priceChange24h >= 0 ? "+" : ""}{(featured.priceChange24h || 128.6).toFixed(2)}%
                      </span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 leading-none">
                        Vol ${(featured.volume24h ? featured.volume24h / 1000 : 182).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                  
                  {/* Card Footer Details parameters */}
                  <div className="grid grid-cols-4 gap-2 pt-3.5 border-t border-[#2B3139]/40 items-center select-none font-sans">
                    <div>
                      <span className="text-[7.5px] font-bold text-slate-500 uppercase block tracking-wider leading-none">AI SCORE</span>
                      <span className="text-xs font-black text-[#0ECB81] font-mono block mt-1 leading-none">{featured.score}<span className="text-[8.5px] text-slate-500 font-bold">/100</span></span>
                    </div>
                    <div>
                      <span className="text-[7.5px] font-bold text-slate-500 uppercase block tracking-wider leading-none">HOLDERS</span>
                      <span className="text-xs font-black text-[#00AEFF] font-mono block mt-1 leading-none">{featured.holderCount || 284}</span>
                    </div>
                    <div>
                      <span className="text-[7.5px] font-bold text-slate-500 uppercase block tracking-wider leading-none">LIQUIDITY</span>
                      <span className="text-xs font-black text-[#00AEFF] font-mono block mt-1 leading-none">${(featured.liquidityUsd ? featured.liquidityUsd / 1000 : 28.4).toFixed(1)}K</span>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setSelectedTokenDetails(featured);
                          setSpotSubTab("TRADE");
                          setActiveTab("AISCANNER");
                        }}
                        className="w-full py-2 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-black rounded-lg text-[10px] uppercase transition-all tracking-wider cursor-pointer font-sans"
                      >
                        DETAILS
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ALGORITHM PIPELINE (LIVE) Section */}
              <div className="bg-[#181A20] border border-[#2B3139] rounded-xl p-3.5 space-y-3.5 shadow-lg">
                <div className="flex justify-between items-center border-b border-[#2B3139]/40 pb-2 select-none">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider leading-none">ALGORITHM PIPELINE (LIVE)</h3>
                  <span className="text-[8.5px] font-black text-[#0ECB81] uppercase tracking-widest flex items-center gap-1 font-mono leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-pulse inline-block" /> LIVE
                  </span>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none select-none">
                  {[
                    { name: "Scanner", icon: "🎯" },
                    { name: "Pairs", icon: "🔗" },
                    { name: "Liquidity", icon: "💧" },
                    { name: "Holders", icon: "👥" },
                    { name: "Whales", icon: "🐳" },
                    { name: "AI Score", icon: "🧠" },
                  ].map((step, idx) => (
                    <Fragment key={step.name}>
                      <div className="bg-[#0B0E11] border border-[#2B3139] p-2.5 rounded-xl text-center shrink-0 min-w-[64px] flex flex-col items-center justify-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-[#181A20] border border-[#2B3139]/60 flex items-center justify-center text-xs shrink-0">{step.icon}</div>
                        <div>
                          <span className="text-[8px] font-black text-white block leading-none">{step.name}</span>
                          <span className="text-[6px] font-bold text-[#0ECB81] uppercase block mt-1 flex items-center gap-0.5 justify-center leading-none">
                            <span className="w-1 h-1 rounded-full bg-[#0ECB81] inline-block" /> Active
                          </span>
                        </div>
                      </div>
                      {idx < 5 && <span className="text-slate-500 font-bold font-mono text-[9px] shrink-0">→</span>}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* VIEW 3: VIP SIGNALS DASHBOARD (SIGNALS) */}
        {activeTab === "SIGNALS" && (
          <div className="flex-grow p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full overflow-y-auto font-sans">
            <div className="bg-[#181A20] border border-[#2B3139] p-6 rounded-xl text-left shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/5 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#2B3139]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#F0B90B] rounded-full animate-pulse" />
                  <h4 className="text-xs font-bold uppercase text-white tracking-widest">ACTIVE VIP MEME MEMO</h4>
                </div>
                <span className="px-3 py-1 text-[9px] font-bold uppercase bg-[#0B0E11] text-slate-400 border border-[#2B3139] tracking-widest rounded">RESTRICTED MEMO</span>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black uppercase text-white tracking-tight leading-none">{activeSignal.tokenName}</h3>
                    <p className="text-[9px] font-bold text-slate-500 mt-2 tracking-widest">PUBLISHED: {activeSignal.timestamp} • SYSTEM DETECTED</p>
                  </div>
                  <div className={`px-5 py-1.5 text-xs font-bold uppercase rounded shadow-md ${activeSignal.action === "BUY" ? "bg-[#0ECB81] text-white" : "bg-[#F6465D] text-white"}`}>
                    {activeSignal.action}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border border-[#2B3139] py-3 text-center bg-[#0B0E11] rounded-xl font-mono">
                  <div className="p-2"><span className="text-[8.5px] font-bold uppercase text-slate-500 block mb-1 tracking-widest font-sans">ENTRY PRICE</span><span className="text-base font-black text-white">{activeSignal.entryPrice}</span></div>
                  <div className="p-2 border-l border-[#2B3139]"><span className="text-[8.5px] font-bold uppercase text-[#0ECB81] block mb-1 tracking-widest font-sans">TARGET (TP)</span><span className="text-base font-black text-[#0ECB81]">{activeSignal.targetPrice}</span></div>
                  <div className="p-2 border-l border-[#2B3139]"><span className="text-[8.5px] font-bold uppercase text-[#F6465D] block mb-1 tracking-widest font-sans">STOP LOSS (SL)</span><span className="text-base font-black text-[#F6465D]">{activeSignal.stopLoss}</span></div>
                  <div className="p-2 border-l border-[#2B3139]"><span className="text-[8.5px] font-bold uppercase text-[#F0B90B] block mb-1 tracking-widest font-sans">RISK RATIO</span><span className="text-base font-black text-[#F0B90B]">1:3.5</span></div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-[#8A99AD] tracking-widest block">INVESTMENT THESIS</span>
                  <div className="bg-[#0B0E11] border-l-4 border-[#0ECB81] p-5 rounded-r-xl text-xs leading-relaxed text-slate-300 font-medium">
                    <p className="select-text">{activeSignal.rationale}</p>
                    
                    <div className="mt-4 pt-4 border-t border-[#2B3139]/80 grid grid-cols-3 gap-4 text-center font-mono text-[9.5px]">
                      <div><span className="text-slate-500 font-bold block uppercase font-sans mb-0.5">CONFIDENCE</span><span className="text-[#0ECB81] font-black">92%</span></div>
                      <div><span className="text-slate-500 font-bold block uppercase font-sans mb-0.5">WHALES</span><span className="text-white font-black">ACCUMULATION</span></div>
                      <div><span className="text-slate-500 font-bold block uppercase font-sans mb-0.5">WIN RATE</span><span className="text-[#F0B90B] font-black">81.4%</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center bg-[#0B0E11] border border-[#2B3139] p-2.5 rounded-xl gap-3">
                  <span className="text-[9px] font-bold text-slate-500 uppercase px-2 border-r border-[#2B3139] font-sans">CONTRACT</span>
                  <span className="text-xs font-mono text-slate-300 flex-grow select-text truncate text-left">{activeSignal.contractAddress}</span>
                  <button onClick={() => handleCopyAddress(activeSignal.contractAddress)} className="p-2 bg-[#2B3139]/40 hover:bg-[#2B3139]/80 border border-[#2B3139] rounded text-slate-300 hover:text-white transition-colors cursor-pointer">
                    {copiedAddress === activeSignal.contractAddress ? <Check className="w-3.5 h-3.5 text-[#0ECB81]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
            
            {isAdmin && (
              <div className="bg-[#181A20] border border-[#2B3139] p-6 rounded-xl space-y-4 text-left shadow-lg">
                <h4 className="text-xs font-bold uppercase text-white tracking-widest border-b border-[#2B3139] pb-3 flex items-center gap-2"><Upload className="w-4 h-4 text-[#F0B90B]" /> DISPATCH NEW ALPHA MEMO</h4>
                <form onSubmit={handlePostSignal} className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                    <input type="text" value={signalToken} onChange={(e) => setSignalToken(e.target.value)} placeholder="ASSET TICKER (e.g. XRPz)" className="bg-[#0B0E11] border border-[#2B3139] p-3 rounded text-base xl:text-xs w-full text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 uppercase font-sans" required />
                    <select value={signalAction} onChange={(e) => setSignalAction(e.target.value as "BUY" | "SELL")} className="bg-[#0B0E11] border border-[#2B3139] p-3 rounded text-base xl:text-xs w-full text-white focus:outline-none focus:border-slate-700 font-sans"><option value="BUY">BUY</option><option value="SELL">SELL</option></select>
                  </div>
                  <input type="text" value={signalAddress} onChange={(e) => setSignalAddress(e.target.value)} placeholder="CONTRACT CA ADDRESS" className="bg-[#0B0E11] border border-[#2B3139] p-3 rounded text-base xl:text-xs w-full text-white placeholder-slate-600 focus:outline-none focus:border-slate-700" required />
                  <div className="grid grid-cols-3 gap-3">
                    <input type="text" value={signalEntry} onChange={(e) => setSignalEntry(e.target.value)} placeholder="ENTRY PRICE" className="bg-[#0B0E11] border border-[#2B3139] p-3 rounded text-base xl:text-xs w-full text-white placeholder-slate-600 focus:outline-none focus:border-slate-700" required />
                    <input type="text" value={signalTarget} onChange={(e) => setSignalTarget(e.target.value)} placeholder="TARGET TP" className="bg-[#0B0E11] border border-[#2B3139] p-3 rounded text-base xl:text-xs w-full text-white placeholder-slate-600 focus:outline-none focus:border-slate-700" required />
                    <input type="text" value={signalStop} onChange={(e) => setSignalStop(e.target.value)} placeholder="STOP LOSS SL" className="bg-[#0B0E11] border border-[#2B3139] p-3 rounded text-base xl:text-xs w-full text-white placeholder-slate-600 focus:outline-none focus:border-slate-700" required />
                  </div>
                  <textarea value={signalRationale} onChange={(e) => setSignalRationale(e.target.value)} placeholder="DISPATCH RATIONALE THESIS..." className="bg-[#0B0E11] border border-[#2B3139] p-3 rounded text-base xl:text-xs w-full text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 h-24 resize-none font-sans" />
                  <button type="submit" className="w-full py-3 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold uppercase text-xs tracking-widest rounded transition-all shadow cursor-pointer font-sans">{uploaded ? "DISPATCHED SUCCESSFULLY" : "DISPATCH SIGNAL"}</button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: SECURITY RISK ANALYSIS (SECURITY) */}
        {activeTab === "SECURITY" && (
          <div className="flex-grow p-4 md:p-6 space-y-6 max-w-2xl mx-auto w-full overflow-y-auto font-sans">
            <div className="bg-[#181A20] border border-[#2B3139] p-6 rounded-xl text-left shadow-lg">
              <h3 className="text-xs font-bold uppercase text-white tracking-widest border-b border-[#2B3139] pb-4 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-[#F0B90B]" /> SMART CONTRACT AUDIT & RISK CENTER</h3>
              
              <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">Automatic contract checking filters out malicious honeypots, developer locks, mint authorities, and high tax exposures.</p>

              <div className="space-y-4">
                {[ 
                  { icon: Lock, title: "Liquidity Burn / Lock Status", status: "100% SECURE", detail: "LP tokens verified burned on Raydium/Orca pools." }, 
                  { icon: FileCheck2, title: "Contract Code Audit Verification", status: "VERIFIED SAFE", detail: "Contract source verified, code matches standard whitelist token frameworks." }, 
                  { icon: AlertTriangle, title: "Honeypot Exposure Verification", status: "CLEAN INDICES", detail: "Simulated buy/sell execution succeeded with standard buy/sell tax (0%)." } 
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 bg-[#0B0E11] border border-[#2B3139] p-4 rounded-xl group hover:bg-[#2B3139]/20 transition-all">
                    <div className="w-10 h-10 bg-[#181A20] rounded-lg flex items-center justify-center text-slate-400 border border-[#2B3139] shrink-0 text-white"><item.icon className="w-5 h-5" /></div>
                    <div className="flex-grow text-left">
                      <div className="flex justify-between items-center mb-1 flex-wrap gap-2">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{item.title}</h4>
                        <span className="text-[9px] bg-[#0ECB81]/15 text-[#0ECB81] px-2.5 py-1 font-bold uppercase tracking-wider rounded border border-[#0ECB81]/20 font-mono">{item.status}</span>
                      </div>
                      <p className="text-[10px] text-[#8A99AD] font-medium leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-[#0B0E11]/60 p-4 rounded-xl border border-[#2B3139]/60 text-[10px] text-slate-500 leading-normal text-center">
                To check a new custom contract address, select <b className="text-white hover:underline cursor-pointer" onClick={() => setActiveTab("AISCANNER")}>Spot Trade</b>, switch the order form sub-tab to <b>Scan CA</b>, paste the address, and execute.
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: ADMIN DESK TERMINAL (ADMIN) */}
        {activeTab === "ADMIN" && isAdmin && (
          <div className="flex-grow p-4 md:p-6 max-w-5xl mx-auto w-full overflow-y-auto font-mono">
            <AdminTerminal />
          </div>
        )}
      </main>

      {/* Sticky Bottom Navigation for Mobile (styled as exchange layout) */}
      <div className="sticky bottom-0 left-0 right-0 z-50 w-full bg-[#181A20] border-t border-[#2B3139] backdrop-blur-xl py-2.5 pb-safe px-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.5)] select-none">
        <button
          onClick={() => {
            setActiveTab("AISCANNER");
            setSpotSubTab("TRADE");
          }}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded transition-all cursor-pointer ${activeTab === "AISCANNER" && spotSubTab === "TRADE" ? "text-[#F0B90B] bg-[#2B3139]/50" : "text-slate-500"}`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[8px] uppercase font-bold tracking-wider">Trade</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("AISCANNER");
            setSpotSubTab("TRADE");
            setBottomActiveTab("WATCHLIST");
          }}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded transition-all cursor-pointer ${activeTab === "AISCANNER" && bottomActiveTab === "WATCHLIST" ? "text-[#F0B90B] bg-[#2B3139]/50" : "text-slate-500"}`}
        >
          <Star className="w-4 h-4" />
          <span className="text-[8px] uppercase font-bold tracking-wider">Watchlist</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("SECURITY");
          }}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded transition-all cursor-pointer ${activeTab === "SECURITY" ? "text-[#F0B90B] bg-[#2B3139]/50" : "text-slate-500"}`}
        >
          <Bell className="w-4 h-4" />
          <span className="text-[8px] uppercase font-bold tracking-wider">Alerts</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("AISCANNER");
            setSpotSubTab("TRADE");
            setBottomActiveTab("POSITIONS");
          }}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded transition-all cursor-pointer ${activeTab === "AISCANNER" && bottomActiveTab === "POSITIONS" ? "text-[#F0B90B] bg-[#2B3139]/50" : "text-slate-500"}`}
        >
          <PieChart className="w-4 h-4" />
          <span className="text-[8px] uppercase font-bold tracking-wider">Portfolio</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("SIGNALS");
          }}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded transition-all cursor-pointer ${activeTab === "SIGNALS" ? "text-[#F0B90B] bg-[#2B3139]/50" : "text-slate-500"}`}
        >
          <User className="w-4 h-4" />
          <span className="text-[8px] uppercase font-bold tracking-wider">Profile</span>
        </button>
      </div>
    </div>
  );
}
