// Deterministic Market Intelligence Scoring Engine (System 1)

export interface ScoringInput {
  address: string;
  chain: string;
  priceChange: number;
  volume24h: number;
  liquidityUsd: number;
  whaleBuys: string; // e.g. "12 buys"
  whaleSells: string; // e.g. "3 sells"
  tweetsCount: number;
  hasSocialLinks: boolean;
  decimals?: number;
  supply?: string;
  // Extended discovery engine fields
  txCount24h?: number;      // total transactions in 24h
  buyCount24h?: number;     // buy transactions in 24h
  sellCount24h?: number;    // sell transactions in 24h
  ageHours?: number;        // token age in hours
  holderCount?: number;     // total unique holders
  uniqueBuyers24h?: number; // unique buyer wallets in 24h
  marketCap?: number;       // market cap USD
  priceChange1h?: number;   // 1h price change %
  priceChange6h?: number;   // 6h price change %
  apiSuccessFlags: {
    dexScreener: boolean;
    helius: boolean;
    socialData: boolean;
  };
}

export interface ScoreResult {
  score: number;
  confidence: number;
  breakdown: {
    momentum: number;
    liquidity: number;
    whales: number;
    social: number;
    community: number;
    risk: number;
  };
  positives: string[];
  risks: string[];
  // Extended outputs
  riskTier?: string;
  rugScore?: number;
}

export function calculateMarketScore(input: ScoringInput): ScoreResult {
  // 1. Momentum Score (Max 25)
  let momentum = 12; // Base
  if (input.priceChange > 100) momentum = 25;
  else if (input.priceChange > 50) momentum = 22;
  else if (input.priceChange > 20) momentum = 19;
  else if (input.priceChange > 0) momentum = 16;
  else if (input.priceChange > -20) momentum = 10;
  else momentum = 5;

  // Boost from high buy transaction count (real demand signal)
  const buyTxns = input.buyCount24h || 0;
  if (buyTxns >= 2000) momentum = Math.min(25, momentum + 4);
  else if (buyTxns >= 1000) momentum = Math.min(25, momentum + 3);
  else if (buyTxns >= 500) momentum = Math.min(25, momentum + 2);

  if (input.volume24h > 1000000) momentum = Math.min(25, momentum + 3);
  else if (input.volume24h > 100000) momentum = Math.min(25, momentum + 1);

  // 2. Liquidity Score (Max 15)
  let liquidity = 8;
  const liq = input.liquidityUsd;
  if (liq > 250000) liquidity = 15;
  else if (liq > 100000) liquidity = 13;
  else if (liq > 50000) liquidity = 11;
  else if (liq > 20000) liquidity = 9;
  else if (liq > 5000) liquidity = 6;
  else liquidity = 3;

  // 3. Whale Activity Score (Max 20)
  let whales = 10;
  const buys = parseInt(input.whaleBuys) || 0;
  const sells = parseInt(input.whaleSells) || 0;
  const netBuys = buys - sells;
  if (netBuys > 10) whales = 20;
  else if (netBuys > 5) whales = 17;
  else if (netBuys > 2) whales = 14;
  else if (netBuys >= 0) whales = 11;
  else if (netBuys > -3) whales = 7;
  else whales = 4;

  // 4. Social Momentum Score (Max 20)
  let social = 10;
  if (input.tweetsCount > 20) social = 20;
  else if (input.tweetsCount > 10) social = 17;
  else if (input.tweetsCount > 5) social = 14;
  else if (input.tweetsCount > 0) social = 11;
  else social = 5;

  if (input.hasSocialLinks) social = Math.min(20, social + 3);

  // 5. Community Growth Score (Max 10)
  // Uses holder count + unique buyers if available, otherwise falls back to tweet/liquidity proxy
  let community = 5;
  const holders = input.holderCount || 0;
  const uniqueBuyers = input.uniqueBuyers24h || 0;

  if (holders >= 2000 || uniqueBuyers >= 500) community = 10;
  else if (holders >= 1000 || uniqueBuyers >= 300) community = 9;
  else if (holders >= 500 || uniqueBuyers >= 150) community = 8;
  else if (holders >= 200 || uniqueBuyers >= 50) community = 7;
  else if (input.tweetsCount > 8 && liq > 50000) community = 7;
  else if (input.tweetsCount > 3 || liq > 20000) community = 6;
  else community = 4;

  // 6. Risk Score (Max 10)
  let risk = 10;
  const positives: string[] = [];
  const risks: string[] = [];

  if (liq < 10000) {
    risk -= 4;
    risks.push("Extremely thin liquidity pool depth");
  } else {
    positives.push("Safe liquidity pool depth backing");
  }

  if (sells > buys) {
    risk -= 2;
    risks.push("High active whale sell pressure");
  }

  if (!input.hasSocialLinks) {
    risk -= 2;
    risks.push("Missing declared developer website/socials metadata");
  } else {
    positives.push("Verified developer social metadata declared");
  }

  if (input.decimals && input.decimals < 5) {
    risk -= 1;
    risks.push("Suspicious low-token decimal configuration");
  }

  risk = Math.max(1, risk);

  // Final Overall Score
  const score = Math.min(100, Math.max(0, momentum + liquidity + whales + social + community + risk));

  // Confidence Score Calculation (Max 100%)
  let confidence = 100;
  if (!input.apiSuccessFlags.dexScreener) confidence -= 30;
  if (!input.apiSuccessFlags.helius) confidence -= 20;
  if (!input.apiSuccessFlags.socialData) confidence -= 20;

  return {
    score,
    confidence,
    breakdown: {
      momentum,
      liquidity,
      whales,
      social,
      community,
      risk
    },
    positives,
    risks
  };
}
