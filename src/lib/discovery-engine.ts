/**
 * CASHIX AI Discovery Engine — Quality Filter + Risk Classification
 *
 * Deterministic pipeline:
 *  1. Filter candidates by mandatory quality thresholds
 *  2. Classify risk tier from measurable metrics
 *  3. Calculate rug-pull risk score
 *  4. Rank survivors by opportunity (score × confidence × liquidity weight)
 *
 * OpenAI is NEVER called from this file.
 */

// ─── Configurable Thresholds ────────────────────────────────────────────────

export const DISCOVERY_THRESHOLDS = {
  /** Minimum liquidity in USD */
  MIN_LIQUIDITY_USD: Number(process.env.DISCOVERY_MIN_LIQUIDITY ?? 100_000),
  /** Minimum 24-hour trading volume in USD */
  MIN_VOLUME_24H_USD: Number(process.env.DISCOVERY_MIN_VOLUME ?? 500_000),
  /** Minimum buy transactions in the last 24 hours */
  MIN_BUYS_24H: Number(process.env.DISCOVERY_MIN_BUYS ?? 500),
  /** Minimum unique buyer wallets (if derivable) */
  MIN_UNIQUE_BUYERS: Number(process.env.DISCOVERY_MIN_BUYERS ?? 300),
  /** Minimum token age in hours */
  MIN_AGE_HOURS: Number(process.env.DISCOVERY_MIN_AGE_HOURS ?? 0),
  /** Maximum token age in hours */
  MAX_AGE_HOURS: Number(process.env.DISCOVERY_MAX_AGE_HOURS ?? 24),
  /** Maximum single top-holder share (fraction, e.g. 0.25 = 25%) */
  MAX_TOP_HOLDER_SHARE: Number(process.env.DISCOVERY_MAX_TOP_HOLDER ?? 0.25),
  /** Minimum buy/sell ratio (1.0 = neutral) */
  MIN_BUY_SELL_RATIO: Number(process.env.DISCOVERY_MIN_BSR ?? 1.0),
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DiscoveryCandidate {
  // Identity
  address: string;
  chain: string;
  name: string;
  symbol: string;
  pairAddress?: string;

  // Price
  priceUsd: string;
  priceChange24h: number;
  priceChange1h?: number;
  priceChange6h?: number;

  // Market metrics
  volume24h: number;
  liquidityUsd: number;
  marketCap?: number;
  fdv?: number;
  txCount24h: number;
  buyCount24h: number;
  sellCount24h: number;

  // Holder metrics (may be 0 if not available from DexScreener)
  holderCount: number;
  uniqueBuyers24h: number;
  topHolderShare?: number;    // fraction 0–1

  // Token metadata
  ageHours: number;
  decimals?: number;
  supply?: string;
  pairCreatedAt?: number;     // unix ms

  // Social / whale
  whaleBuys: number;
  whaleSells: number;
  tweetsCount: number;
  hasSocialLinks: boolean;
  tweets: Array<{ text: string; user: string; likes: number }>;
  websites: Array<{ url: string }>;
  socials: Array<{ type: string; url: string }>;

  // API availability flags
  apiSuccessFlags: {
    dexScreener: boolean;
    helius: boolean;
    socialData: boolean;
  };
}

export type RiskTier = "Safe" | "Moderate" | "High Risk" | "Experimental";
export type ConfidenceLabel = "High" | "Medium" | "Low";

export interface FilterResult {
  passed: boolean;
  failReasons: string[];
}

export interface RiskAssessment {
  tier: RiskTier;
  rugScore: number;       // 0 (safe) – 100 (extreme rug risk)
  rugFlags: string[];     // human-readable warning list
}

// ─── Step 1: Quality Filter ───────────────────────────────────────────────────

/**
 * Apply mandatory quality filters to a candidate.
 * Returns { passed: true } if the token qualifies for the Discovery feed.
 */
export function filterQualifiedToken(token: DiscoveryCandidate): FilterResult {
  const failReasons: string[] = [];

  if (token.liquidityUsd < DISCOVERY_THRESHOLDS.MIN_LIQUIDITY_USD) {
    failReasons.push(
      `Liquidity $${token.liquidityUsd.toLocaleString()} < $${DISCOVERY_THRESHOLDS.MIN_LIQUIDITY_USD.toLocaleString()} minimum`
    );
  }

  if (token.volume24h < DISCOVERY_THRESHOLDS.MIN_VOLUME_24H_USD) {
    failReasons.push(
      `24h Volume $${token.volume24h.toLocaleString()} < $${DISCOVERY_THRESHOLDS.MIN_VOLUME_24H_USD.toLocaleString()} minimum`
    );
  }

  if (token.buyCount24h < DISCOVERY_THRESHOLDS.MIN_BUYS_24H) {
    failReasons.push(
      `Buy transactions ${token.buyCount24h} < ${DISCOVERY_THRESHOLDS.MIN_BUYS_24H} minimum`
    );
  }

  if (
    token.uniqueBuyers24h > 0 &&
    token.uniqueBuyers24h < DISCOVERY_THRESHOLDS.MIN_UNIQUE_BUYERS
  ) {
    failReasons.push(
      `Unique buyers ${token.uniqueBuyers24h} < ${DISCOVERY_THRESHOLDS.MIN_UNIQUE_BUYERS} minimum`
    );
  }

  if (token.ageHours < DISCOVERY_THRESHOLDS.MIN_AGE_HOURS) {
    failReasons.push(
      `Token age ${token.ageHours.toFixed(1)}h < ${DISCOVERY_THRESHOLDS.MIN_AGE_HOURS}h minimum`
    );
  }

  if (token.ageHours > DISCOVERY_THRESHOLDS.MAX_AGE_HOURS) {
    failReasons.push(
      `Token age ${token.ageHours.toFixed(1)}h > ${DISCOVERY_THRESHOLDS.MAX_AGE_HOURS}h maximum`
    );
  }

  // Buy/sell ratio check — skip if no transaction data
  if (token.buyCount24h > 0 && token.sellCount24h > 0) {
    const bsr = token.buyCount24h / token.sellCount24h;
    if (bsr < DISCOVERY_THRESHOLDS.MIN_BUY_SELL_RATIO) {
      failReasons.push(
        `Buy/sell ratio ${bsr.toFixed(2)} < ${DISCOVERY_THRESHOLDS.MIN_BUY_SELL_RATIO} minimum`
      );
    }
  }

  // Market data completeness check
  if (!token.liquidityUsd || !token.volume24h) {
    failReasons.push("Missing critical market data");
  }

  return { passed: failReasons.length === 0, failReasons };
}

// ─── Step 2: Rug-Pull Risk Assessment ────────────────────────────────────────

/**
 * Calculate a deterministic rug-pull risk score (0 = safe, 100 = extreme risk).
 * Based only on measurable on-chain and market metrics.
 */
export function assessRisk(token: DiscoveryCandidate): RiskAssessment {
  let rugScore = 0;
  const rugFlags: string[] = [];

  // 1. Liquidity concentration (single top holder)
  if (token.topHolderShare !== undefined) {
    if (token.topHolderShare > 0.5) {
      rugScore += 35;
      rugFlags.push(`Top holder controls ${(token.topHolderShare * 100).toFixed(0)}% of supply`);
    } else if (token.topHolderShare > 0.25) {
      rugScore += 20;
      rugFlags.push(`Elevated single-wallet concentration (${(token.topHolderShare * 100).toFixed(0)}%)`);
    } else if (token.topHolderShare > 0.15) {
      rugScore += 10;
      rugFlags.push(`Notable single-wallet concentration (${(token.topHolderShare * 100).toFixed(0)}%)`);
    }
  }

  // 2. Thin liquidity relative to volume (wash trading signal)
  if (token.volume24h > 0 && token.liquidityUsd > 0) {
    const volLiqRatio = token.volume24h / token.liquidityUsd;
    if (volLiqRatio > 30) {
      rugScore += 20;
      rugFlags.push("Extreme volume/liquidity ratio — possible wash trading");
    } else if (volLiqRatio > 15) {
      rugScore += 10;
      rugFlags.push("High volume/liquidity ratio — monitor for wash trading");
    }
  }

  // 3. Low liquidity absolute value (< $150K despite passing filter)
  if (token.liquidityUsd < 150_000) {
    rugScore += 15;
    rugFlags.push("Liquidity pool depth is near minimum threshold");
  }

  // 4. Sell pressure dominance
  if (token.whaleSells > token.whaleBuys && token.whaleSells > 5) {
    rugScore += 15;
    rugFlags.push("Active whale sell pressure detected");
  }

  // 5. Extreme price spike without volume support
  if (
    token.priceChange24h > 500 &&
    token.volume24h < token.liquidityUsd * 2
  ) {
    rugScore += 10;
    rugFlags.push("Extreme price spike relative to volume — pump risk");
  }

  // 6. Low holder count (despite passing filters)
  if (token.holderCount > 0 && token.holderCount < 200) {
    rugScore += 15;
    rugFlags.push("Very low holder count (<200)");
  } else if (token.holderCount > 0 && token.holderCount < 500) {
    rugScore += 8;
    rugFlags.push("Low holder count (<500)");
  }

  // 7. No social links or website
  if (!token.hasSocialLinks) {
    rugScore += 5;
    rugFlags.push("No verified developer website or social metadata");
  }

  // 8. Very new token (>24h but <48h)
  if (token.ageHours < 48) {
    rugScore += 5;
    rugFlags.push(`Very new token (${token.ageHours.toFixed(0)}h old) — limited track record`);
  }

  rugScore = Math.min(100, Math.max(0, rugScore));

  // Determine risk tier from rug score + key metrics
  let tier: RiskTier;
  const hasGoodLiquidity = token.liquidityUsd >= 500_000;
  const hasGoodVolume = token.volume24h >= 1_000_000;
  const hasGoodHolders = token.holderCount >= 1_000;

  if (rugScore <= 15 && hasGoodLiquidity && hasGoodVolume) {
    tier = "Safe";
  } else if (rugScore <= 35 && (hasGoodLiquidity || hasGoodVolume)) {
    tier = "Moderate";
  } else if (rugScore <= 60 && token.liquidityUsd >= DISCOVERY_THRESHOLDS.MIN_LIQUIDITY_USD) {
    tier = "High Risk";
  } else {
    tier = "Experimental";
  }

  // Override: well-established tokens with solid metrics → Safe
  if (hasGoodLiquidity && hasGoodVolume && hasGoodHolders && rugScore <= 20) {
    tier = "Safe";
  }

  return { tier, rugScore, rugFlags };
}

// ─── Step 3: Confidence Label ─────────────────────────────────────────────────

/**
 * Determine confidence label from API success + data completeness.
 */
export function getConfidenceLabel(confidenceScore: number): ConfidenceLabel {
  if (confidenceScore >= 75) return "High";
  if (confidenceScore >= 45) return "Medium";
  return "Low";
}

// ─── Step 4: Opportunity Ranking ─────────────────────────────────────────────

/**
 * Rank tokens by overall opportunity.
 * Weighting: Score (40%) + Confidence (25%) + Liquidity tier (20%) + Social (15%)
 * Lower risk tier gives a bonus multiplier.
 */
export function rankByOpportunity(
  tokens: Array<{
    score: number;
    confidence: number;
    liquidityUsd: number;
    tweetsCount: number;
    riskTier: RiskTier;
    rugScore: number;
  }>
): number[] {
  const riskMultiplier: Record<RiskTier, number> = {
    Safe: 1.15,
    Moderate: 1.0,
    "High Risk": 0.82,
    Experimental: 0.68,
  };

  const liquidityTierScore = (liq: number) => {
    if (liq >= 1_000_000) return 100;
    if (liq >= 500_000) return 85;
    if (liq >= 250_000) return 70;
    if (liq >= 150_000) return 55;
    return 40;
  };

  const socialTierScore = (tweets: number) => {
    if (tweets >= 20) return 100;
    if (tweets >= 10) return 75;
    if (tweets >= 5) return 50;
    if (tweets >= 1) return 25;
    return 10;
  };

  return tokens.map((t, idx) => {
    const opportunityScore =
      t.score * 0.4 +
      t.confidence * 0.25 +
      liquidityTierScore(t.liquidityUsd) * 0.2 +
      socialTierScore(t.tweetsCount) * 0.15;

    const weighted = opportunityScore * riskMultiplier[t.riskTier];
    return weighted;
  });
}
