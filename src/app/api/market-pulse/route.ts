import { NextResponse } from "next/server";
import { cache } from "@/lib/cache";
import { startMarketWorker } from "@/lib/market-worker";

// Default placeholder fallback values to serve if the background cache is empty on startup
const defaultFallback = {
  timestamp: Date.now(),
  marketOverview: "Initializing background analysis workers... Initial metrics will load shortly.",
  tokens: [
    {
      address: "HxgDaQUbkEVE8j7SNq9U67ffYBhtbMSL19T3ZVGUpump",
      chain: "solana",
      name: "Fear of Nothing",
      symbol: "FON",
      priceUsd: "0.000124",
      priceChange: 4.2,
      volume24h: 342000,
      liquidityUsd: 45000,
      websites: [],
      socials: [],
      decimals: 9,
      supply: "1000000000",
      whaleBuys: "12 buys",
      whaleSells: "2 sells",
      tweetsCount: 4,
      tweets: [],
      score: 82,
      explanation: "FON is currently building momentum on Solana DEX index triggers. Liquidity backing is stable.",
      analysisMethod: "HEURISTIC_FALLBACK"
    },
    {
      address: "FVQm2u4LGa8n3cdbk1uobqe6K8YgeKKVzsd6vuSqpump",
      chain: "solana",
      name: "Chill Findoor",
      symbol: "CHILL",
      priceUsd: "0.0034",
      priceChange: -2.1,
      volume24h: 120000,
      liquidityUsd: 15000,
      websites: [],
      socials: [],
      decimals: 9,
      supply: "1000000000",
      whaleBuys: "5 buys",
      whaleSells: "3 sells",
      tweetsCount: 2,
      tweets: [],
      score: 65,
      explanation: "CHILL is currently consolidating after a recent high volume pump. Onchain indicators remain neutral.",
      analysisMethod: "HEURISTIC_FALLBACK"
    }
  ]
};

export async function POST(request: Request) {
  // Ensure the background worker daemon is started
  startMarketWorker();

  // Load compiled market pulse data directly from Redis / Memory cache
  const cachedData = await cache.get("market-pulse-data");

  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  // Serve fast fallback if background worker is still running its first run
  return NextResponse.json(defaultFallback);
}

export async function GET(request: Request) {
  // Support GET requests as well for simplicity
  startMarketWorker();
  const cachedData = await cache.get("market-pulse-data");
  if (cachedData) {
    return NextResponse.json(cachedData);
  }
  return NextResponse.json(defaultFallback);
}
