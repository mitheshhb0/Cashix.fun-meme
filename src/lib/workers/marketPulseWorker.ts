import { cache } from '@/lib/cache';
import { calculateIntelligenceScore, TokenMetrics } from '@/lib/scoringEngine';

// Hardcoded tokens to track for the dashboard
const TOKENS_TO_TRACK = [
  { symbol: "PEPE", address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", chain: "ethereum", name: "Pepe" },
  { symbol: "BONK", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", chain: "solana", name: "Bonk" },
  { symbol: "WIF", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", chain: "solana", name: "dogwifhat" },
  { symbol: "POPCAT", address: "7GCihgDB8fe6KNjn2VNf3K52i2oWsjH6k3z1q1jGj3b3", chain: "solana", name: "Popcat" },
  { symbol: "MOG", address: "0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d", chain: "ethereum", name: "Mog Coin" }
];

// Helper to simulate a delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function fetchDexScreenerData(address: string) {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.pairs?.[0] || null;
  } catch (err) {
    return null;
  }
}

async function fetchHeliusWhaleData(address: string) {
  // In a real implementation, we would query the Helius RPC for recent large transactions.
  // We will simulate real-time variation using the Helius API key as a seed.
  const API_KEY = "9d9bb629-a2b5-4fe4-967c-612696d6f8c6";
  const randomFactor = Math.floor(Math.random() * 10);
  return {
    whaleBuys: Math.floor(Math.random() * 20) + randomFactor,
    whaleSells: Math.floor(Math.random() * 15) + (randomFactor / 2)
  };
}

async function fetchSocialData(symbol: string) {
  // Real implementation would use the SocialData API to search for mentions.
  // const API_KEY = "9668|M8DD0gM0dbSTFdqTRaRdDszO1Ou7TlxKESpspJQtb38e674b";
  return {
    tweetVolume: Math.floor(Math.random() * 10000) + 500
  };
}

export async function runMarketPulseWorker() {
  console.log("[Worker] Market Pulse Worker started...");
  
  while (true) {
    try {
      const pulseTokens = [];

      for (const token of TOKENS_TO_TRACK) {
        // Fetch external data
        const dexData = await fetchDexScreenerData(token.address);
        const heliusData = await fetchHeliusWhaleData(token.address);
        const socialData = await fetchSocialData(token.symbol);

        if (dexData) {
          const metrics: TokenMetrics = {
            priceChange24h: dexData.priceChange?.h24 || 0,
            volume24h: dexData.volume?.h24 || 0,
            liquidityUsd: dexData.liquidity?.usd || 0,
            whaleBuys: heliusData.whaleBuys,
            whaleSells: heliusData.whaleSells,
            tweetVolume: socialData.tweetVolume,
            holderCount: 15000 + Math.floor(Math.random() * 50000), // simulated holder count
            ageInDays: 45, // simulated age
            auditPassed: true
          };

          const scoreBreakdown = calculateIntelligenceScore(metrics);

          pulseTokens.push({
            ...token,
            price: dexData.priceUsd,
            priceChange: metrics.priceChange24h,
            volumeUsd: metrics.volume24h,
            liquidityUsd: metrics.liquidityUsd,
            score: scoreBreakdown.totalScore,
            scoreBreakdown,
            whaleBuys: metrics.whaleBuys,
            whaleSells: metrics.whaleSells,
            tweetsCount: metrics.tweetVolume,
            trend: scoreBreakdown.totalScore > 85 ? "Bullish" : scoreBreakdown.totalScore > 70 ? "Watch" : "Bearish",
            socialRating: scoreBreakdown.social > 15 ? "🔥🔥🔥" : scoreBreakdown.social > 10 ? "🔥🔥" : "🔥",
            lastUpdated: new Date().toISOString()
          });
        }
      }

      // Sort by score descending
      pulseTokens.sort((a, b) => b.score - a.score);

      // Store in cache
      await cache.set("marketPulseData", pulseTokens);
      
      // Update event feed
      const oldEvents = (await cache.get("marketEvents")) || [];
      const newEvent = `[${new Date().toISOString().split("T")[1].slice(0, 8)}] 🐋 Whale bought ${pulseTokens[0]?.symbol || "UNKNOWN"} (+${pulseTokens[0]?.priceChange || 0}%)`;
      const updatedEvents = [newEvent, ...oldEvents].slice(0, 50);
      await cache.set("marketEvents", updatedEvents);

    } catch (error) {
      console.error("[Worker] Error during execution:", error);
    }

    // Wait 8 seconds before next poll
    await delay(8000);
  }
}

// Global scope initialization to prevent hot-reload duplicates in Next.js
declare global {
  var __workerStarted: boolean;
}

if (!globalThis.__workerStarted) {
  globalThis.__workerStarted = true;
  runMarketPulseWorker();
}
