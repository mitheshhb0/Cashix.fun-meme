export interface TokenMetrics {
  priceChange24h: number; // percentage (-100 to infinity)
  volume24h: number;      // USD
  liquidityUsd: number;   // USD
  whaleBuys: number;      // count in last 24h
  whaleSells: number;     // count in last 24h
  tweetVolume: number;    // count in last 24h
  holderCount: number;    // number of holders
  ageInDays: number;      // days since token creation
  auditPassed: boolean;   // boolean
}

export interface ScoreBreakdown {
  totalScore: number;
  momentum: number; // out of 25
  whales: number;   // out of 20
  social: number;   // out of 20
  liquidity: number;// out of 15
  community: number;// out of 10
  risk: number;     // out of 10
}

/**
 * Deterministic Market Intelligence Scoring Engine
 * Computes a score from 0-100 based strictly on raw data metrics.
 * The same input will ALWAYS yield the same score.
 */
export function calculateIntelligenceScore(metrics: TokenMetrics): ScoreBreakdown {
  // 1. Momentum (Max 25)
  // Factors: price change and volume
  let momentum = 0;
  if (metrics.priceChange24h > 100) momentum += 15;
  else if (metrics.priceChange24h > 20) momentum += 10;
  else if (metrics.priceChange24h > 0) momentum += 5;
  else if (metrics.priceChange24h < -20) momentum -= 5;
  
  if (metrics.volume24h > 5000000) momentum += 10;
  else if (metrics.volume24h > 1000000) momentum += 7;
  else if (metrics.volume24h > 100000) momentum += 3;

  momentum = Math.max(0, Math.min(25, momentum));

  // 2. Whales (Max 20)
  // Factors: Net whale buying pressure
  let whales = 0;
  const netWhaleBuys = metrics.whaleBuys - metrics.whaleSells;
  if (netWhaleBuys > 15) whales = 20;
  else if (netWhaleBuys > 5) whales = 15;
  else if (netWhaleBuys > 0) whales = 10;
  else if (netWhaleBuys === 0) whales = 5;
  else whales = 0; // Negative whale pressure yields 0

  // 3. Social (Max 20)
  // Factors: Tweet volume / mentions
  let social = 0;
  if (metrics.tweetVolume > 5000) social = 20;
  else if (metrics.tweetVolume > 1000) social = 15;
  else if (metrics.tweetVolume > 500) social = 10;
  else if (metrics.tweetVolume > 100) social = 5;
  
  // 4. Liquidity (Max 15)
  // Factors: Base liquidity backing the token
  let liquidity = 0;
  if (metrics.liquidityUsd > 1000000) liquidity = 15;
  else if (metrics.liquidityUsd > 500000) liquidity = 10;
  else if (metrics.liquidityUsd > 100000) liquidity = 5;

  // 5. Community (Max 10)
  // Factors: Holder count
  let community = 0;
  if (metrics.holderCount > 10000) community = 10;
  else if (metrics.holderCount > 5000) community = 7;
  else if (metrics.holderCount > 1000) community = 3;

  // 6. Risk / Security (Max 10)
  // Factors: Age of contract and audit
  let risk = 0;
  if (metrics.auditPassed) risk += 5;
  if (metrics.ageInDays > 30) risk += 5;
  else if (metrics.ageInDays > 7) risk += 2;

  const totalScore = Math.floor(momentum + whales + social + liquidity + community + risk);

  return {
    totalScore,
    momentum,
    whales,
    social,
    liquidity,
    community,
    risk
  };
}
