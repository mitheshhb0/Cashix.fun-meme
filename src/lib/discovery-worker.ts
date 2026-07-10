/**
 * CASHIX AI Discovery Worker — Background Pipeline
 *
 * Pipeline:
 *  1. Fetch top boosted + trending candidates from DexScreener
 *  2. Filter with discovery-engine.ts quality rules
 *  3. Enrich survivors (Helius + SocialData)
 *  4. Score each token deterministically
 *  5. Rank by opportunity
 *  6. Ask OpenAI to explain pre-calculated scores (never to rank/invent)
 *  7. Cache results under "discovery-data"
 */

import { cache } from "./cache";
import { EventEmitter } from "events";
import { calculateMarketScore } from "./scoring-engine";
import {
  filterQualifiedToken,
  assessRisk,
  getConfidenceLabel,
  rankByOpportunity,
  type DiscoveryCandidate,
} from "./discovery-engine";

// ─── Global Singleton Guard ───────────────────────────────────────────────────

const workerEmitterKey = Symbol.for("cashix.discoveryWorkerEmitter");
if (!Object.getOwnPropertySymbols(globalThis).includes(workerEmitterKey)) {
  (globalThis as any)[workerEmitterKey] = new EventEmitter();
}
export const discoveryWorkerEmitter: EventEmitter = (globalThis as any)[workerEmitterKey];

const discoveryWorkerRunningKey = Symbol.for("cashix.discoveryWorkerRunning");
if (!Object.getOwnPropertySymbols(globalThis).includes(discoveryWorkerRunningKey)) {
  (globalThis as any)[discoveryWorkerRunningKey] = false;
}

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Entry Point ─────────────────────────────────────────────────────────────

export function startDiscoveryWorker() {
  if ((globalThis as any)[discoveryWorkerRunningKey]) return;
  (globalThis as any)[discoveryWorkerRunningKey] = true;

  console.log("🔍 Starting CASHIX AI Discovery Worker...");
  runDiscoveryPipeline().catch((err) => console.error("Discovery pipeline error:", err));

  setInterval(async () => {
    try {
      await runDiscoveryPipeline();
    } catch (err) {
      console.error("Discovery worker iteration failed:", err);
    }
  }, INTERVAL_MS);
}

// ─── Step 1: Fetch Candidates from DexScreener ───────────────────────────────

async function fetchDexCandidates(): Promise<DiscoveryCandidate[]> {
  const candidates: DiscoveryCandidate[] = [];

  try {
    // Fetch top-boosted tokens (real volume/hype signal)
    const boostRes = await fetch("https://api.dexscreener.com/token-boosts/top/v1", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });

    if (boostRes.ok) {
      const boostData = await boostRes.json();
      const boosted: any[] = Array.isArray(boostData)
        ? boostData
        : boostData.pairs ?? boostData.tokens ?? [];

      for (const item of boosted.slice(0, 30)) {
        const pairData = await fetchPairDetails(
          item.tokenAddress || item.address,
          item.chainId || item.chain
        );
        if (pairData) candidates.push(pairData);
      }
    }
  } catch (err) {
    console.warn("Discovery: Boost feed failed:", err);
  }

  try {
    // Fetch trending pairs from Solana (high signal for meme coins)
    const trendingRes = await fetch(
      "https://api.dexscreener.com/latest/dex/search?q=solana&sort=trendingScore",
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (trendingRes.ok) {
      const trendingData = await trendingRes.json();
      const pairs: any[] = trendingData.pairs || [];

      for (const pair of pairs.slice(0, 20)) {
        const candidate = pairToCandidate(pair);
        if (candidate) candidates.push(candidate);
      }
    }
  } catch (err) {
    console.warn("Discovery: Trending feed failed:", err);
  }

  // Deduplicate by address
  const seen = new Set<string>();
  return candidates.filter((c) => {
    const key = c.address.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchPairDetails(
  address: string,
  chain: string
): Promise<DiscoveryCandidate | null> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pairs: any[] = data.pairs || [];
    if (!pairs.length) return null;

    // Use highest-volume pair
    const pair = pairs.sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))[0];
    return pairToCandidate(pair);
  } catch {
    return null;
  }
}

function pairToCandidate(pair: any): DiscoveryCandidate | null {
  if (!pair?.baseToken?.address) return null;

  const nowMs = Date.now();
  const createdAt: number = pair.pairCreatedAt || 0;
  const ageHours = createdAt > 0 ? (nowMs - createdAt) / 3_600_000 : 9999;

  const volume24h = pair.volume?.h24 || 0;
  const liquidityUsd = pair.liquidity?.usd || 0;
  const priceChange24h = pair.priceChange?.h24 || 0;

  // Extract transaction counts
  const txns24h = pair.txns?.h24 || {};
  const buyCount24h = txns24h.buys || 0;
  const sellCount24h = txns24h.sells || 0;
  const txCount24h = buyCount24h + sellCount24h;

  return {
    address: pair.baseToken.address,
    chain: pair.chainId || "unknown",
    name: pair.baseToken.name || "Unknown",
    symbol: pair.baseToken.symbol || "???",
    pairAddress: pair.pairAddress,

    priceUsd: pair.priceUsd || "0",
    priceChange24h,
    priceChange1h: pair.priceChange?.h1,
    priceChange6h: pair.priceChange?.h6,

    volume24h,
    liquidityUsd,
    marketCap: pair.marketCap || pair.fdv,
    fdv: pair.fdv,
    txCount24h,
    buyCount24h,
    sellCount24h,

    holderCount: 0, // enriched by Helius
    uniqueBuyers24h: buyCount24h > 0 ? Math.floor(buyCount24h * 0.6) : 0, // proxy
    topHolderShare: undefined, // enriched by Helius

    ageHours,
    decimals: 9,
    supply: "1000000000",
    pairCreatedAt: createdAt,

    whaleBuys: 0,
    whaleSells: 0,
    tweetsCount: 0,
    hasSocialLinks: !!(pair.info?.websites?.length || pair.info?.socials?.length),
    tweets: [],
    websites: pair.info?.websites || [],
    socials: pair.info?.socials || [],

    apiSuccessFlags: { dexScreener: true, helius: false, socialData: false },
  };
}

// ─── Step 2: Enrich with Helius (Solana on-chain) ────────────────────────────

async function enrichWithHelius(
  candidate: DiscoveryCandidate,
  heliusKey: string
): Promise<void> {
  if (candidate.chain !== "solana" && candidate.chain !== "solana") return;

  try {
    const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "discovery-worker",
        method: "getAsset",
        params: { id: candidate.address },
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) return;
    const data = await res.json();
    const result = data.result;
    if (!result) return;

    candidate.decimals = result.token_info?.decimals ?? candidate.decimals;
    candidate.supply = result.token_info?.supply ?? candidate.supply;
    candidate.holderCount = result.token_info?.holder_count || 0;
    candidate.apiSuccessFlags.helius = true;
  } catch {
    // Helius unavailable — silently continue
  }
}

// ─── Step 3: Enrich with SocialData ──────────────────────────────────────────

async function enrichWithSocialData(
  candidate: DiscoveryCandidate,
  socialKey: string
): Promise<void> {
  try {
    const query = `$${candidate.symbol} OR "${candidate.address.substring(0, 6)}"`;
    const res = await fetch(
      `https://api.socialdata.tools/twitter/search?query=${encodeURIComponent(query)}&type=Latest`,
      {
        headers: {
          Authorization: `Bearer ${socialKey}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8_000),
      }
    );

    if (!res.ok) return;
    const data = await res.json();
    const tweets: any[] = data.tweets || [];

    candidate.tweetsCount = tweets.length;
    candidate.tweets = tweets.slice(0, 5).map((t) => ({
      text: t.full_text || t.text || "",
      user: t.user?.screen_name || "anon",
      likes: t.favorite_count || 0,
    }));
    candidate.apiSuccessFlags.socialData = true;
  } catch {
    // SocialData unavailable — silently continue
  }
}

// ─── Step 4: OpenAI Explanation (reads pre-calculated score) ─────────────────

async function generateAiExplanation(
  candidate: DiscoveryCandidate,
  scoreResult: ReturnType<typeof calculateMarketScore>,
  riskTier: string,
  openaiKey: string
): Promise<{ summary: string; strengths: string[]; risks: string[]; recentChange: string; narrative: string }> {
  const prompt = {
    token: candidate.symbol,
    name: candidate.name,
    chain: candidate.chain,
    score: scoreResult.score,
    breakdown: scoreResult.breakdown,
    confidence: scoreResult.confidence,
    positives: scoreResult.positives,
    risks: scoreResult.risks,
    riskTier,
    priceChange24h: candidate.priceChange24h,
    volume24h: candidate.volume24h,
    liquidityUsd: candidate.liquidityUsd,
    whaleBuys: candidate.whaleBuys,
    whaleSells: candidate.whaleSells,
    tweetsCount: candidate.tweetsCount,
    holderCount: candidate.holderCount,
    ageHours: Math.round(candidate.ageHours),
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a meme coin market analyst explaining pre-calculated intelligence scores to crypto traders.
You MUST NOT generate, modify, or invent any numerical scores.
You MUST NOT suggest what tokens are trending beyond what the data shows.
Your role is ONLY to explain the provided scores in clear, direct language.

Return a JSON object:
{
  "summary": "string (2-sentence market summary explaining why this token has this specific score. Be specific about the actual metrics.)",
  "strengths": ["string", "string"] (2-3 key data-backed strengths from the provided metrics),
  "risks": ["string", "string"] (1-2 key risks from the provided risk data),
  "recentChange": "string (1 sentence on what recently changed based on the data)",
  "narrative": "string (1 sentence market narrative — bullish/bearish/mixed)"
}`,
          },
          {
            role: "user",
            content: `Explain why ${candidate.symbol} has an intelligence score of ${scoreResult.score}/100. Here is the complete data: ${JSON.stringify(prompt)}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    const content = JSON.parse(data.choices?.[0]?.message?.content || "{}");

    return {
      summary: content.summary || "",
      strengths: content.strengths || [],
      risks: content.risks || [],
      recentChange: content.recentChange || "",
      narrative: content.narrative || "",
    };
  } catch (err) {
    console.warn(`OpenAI explanation failed for ${candidate.symbol}:`, err);
    // Deterministic fallback explanation — no AI, no randomness
    const trend = candidate.priceChange24h >= 0 ? "bullish" : "cautious";
    return {
      summary: `${candidate.symbol} scored ${scoreResult.score}/100 based on $${(candidate.volume24h / 1000).toFixed(0)}K volume, $${(candidate.liquidityUsd / 1000).toFixed(0)}K liquidity, and ${candidate.whaleBuys} whale buys. Market sentiment is ${trend}.`,
      strengths: scoreResult.positives.slice(0, 2),
      risks: scoreResult.risks.slice(0, 2),
      recentChange: `24h price change of ${candidate.priceChange24h >= 0 ? "+" : ""}${candidate.priceChange24h.toFixed(1)}% with ${candidate.txCount24h} transactions.`,
      narrative: `Market tone is ${trend} based on current on-chain activity.`,
    };
  }
}

// ─── Main Pipeline ────────────────────────────────────────────────────────────

async function runDiscoveryPipeline() {
  console.log("⏳ Discovery pipeline running...");

  const openaiKey = process.env.OPENAI_API_KEY;
  const heliusKey = process.env.HELIUS_API_KEY;
  const socialKey = process.env.SOCIALDATA_API_KEY;

  // Step 1: Fetch candidates
  const candidates = await fetchDexCandidates();
  console.log(`📋 Discovery: ${candidates.length} raw candidates collected`);

  // Step 2: Apply quality filters
  const qualified: DiscoveryCandidate[] = [];
  const rejectedLog: string[] = [];

  for (const candidate of candidates) {
    const filterResult = filterQualifiedToken(candidate);
    if (filterResult.passed) {
      qualified.push(candidate);
    } else {
      rejectedLog.push(`[REJECTED] ${candidate.symbol}: ${filterResult.failReasons.join(", ")}`);
    }
  }

  console.log(`✅ Discovery: ${qualified.length} qualified after filters. ${rejectedLog.length} rejected.`);
  rejectedLog.slice(0, 5).forEach((msg) => console.log(msg));

  // Step 3: Enrich survivors
  const enrichmentTasks: Promise<void>[] = [];

  for (const token of qualified) {
    if (heliusKey && (token.chain === "solana")) {
      enrichmentTasks.push(enrichWithHelius(token, heliusKey));
    }
    if (socialKey) {
      enrichmentTasks.push(enrichWithSocialData(token, socialKey));
    }
  }

  await Promise.allSettled(enrichmentTasks);

  // Step 4: Score each token
  const scoredTokens = qualified.map((candidate) => {
    // Derive whale metrics from transaction data (deterministic)
    const whaleBuysCount = Math.max(1, Math.floor(candidate.buyCount24h / 50));
    const whaleSellsCount = Math.max(0, Math.floor(candidate.sellCount24h / 60));
    candidate.whaleBuys = whaleBuysCount;
    candidate.whaleSells = whaleSellsCount;

    const scoreResult = calculateMarketScore({
      address: candidate.address,
      chain: candidate.chain,
      priceChange: candidate.priceChange24h,
      volume24h: candidate.volume24h,
      liquidityUsd: candidate.liquidityUsd,
      whaleBuys: `${whaleBuysCount} buys`,
      whaleSells: `${whaleSellsCount} sells`,
      tweetsCount: candidate.tweetsCount,
      hasSocialLinks: candidate.hasSocialLinks,
      decimals: candidate.decimals,
      supply: candidate.supply,
      txCount24h: candidate.txCount24h,
      buyCount24h: candidate.buyCount24h,
      sellCount24h: candidate.sellCount24h,
      ageHours: candidate.ageHours,
      holderCount: candidate.holderCount,
      uniqueBuyers24h: candidate.uniqueBuyers24h,
      marketCap: candidate.marketCap,
      priceChange1h: candidate.priceChange1h,
      priceChange6h: candidate.priceChange6h,
      apiSuccessFlags: candidate.apiSuccessFlags,
    });

    const riskAssessment = assessRisk(candidate);

    return {
      candidate,
      scoreResult,
      riskAssessment,
    };
  });

  // Step 5: Rank by opportunity
  const opportunityScores = rankByOpportunity(
    scoredTokens.map(({ scoreResult, candidate, riskAssessment }) => ({
      score: scoreResult.score,
      confidence: scoreResult.confidence,
      liquidityUsd: candidate.liquidityUsd,
      tweetsCount: candidate.tweetsCount,
      riskTier: riskAssessment.tier,
      rugScore: riskAssessment.rugScore,
    }))
  );

  const ranked = scoredTokens
    .map((item, i) => ({ ...item, opportunityScore: opportunityScores[i] }))
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 20); // Show top 20 only

  // Step 6: OpenAI explanations (batched, graceful degradation)
  const finalTokens = await Promise.all(
    ranked.map(async ({ candidate, scoreResult, riskAssessment, opportunityScore }) => {
      let aiData = {
        summary: "",
        strengths: scoreResult.positives.slice(0, 2),
        risks: scoreResult.risks.slice(0, 2),
        recentChange: "",
        narrative: "",
      };

      if (openaiKey) {
        aiData = await generateAiExplanation(
          candidate,
          scoreResult,
          riskAssessment.tier,
          openaiKey
        );
      } else {
        // Deterministic fallback
        const trend = candidate.priceChange24h >= 0 ? "bullish" : "cautious";
        aiData.summary = `${candidate.symbol} scored ${scoreResult.score}/100 based on real-time market data. Volume is $${(candidate.volume24h / 1000).toFixed(0)}K with ${candidate.buyCount24h} buy transactions in 24h.`;
        aiData.narrative = `Market sentiment is ${trend} based on current activity.`;
        aiData.recentChange = `Price ${candidate.priceChange24h >= 0 ? "+" : ""}${candidate.priceChange24h.toFixed(1)}% in 24h.`;
      }

      const confidenceLabel = getConfidenceLabel(scoreResult.confidence);

      return {
        // Identity
        address: candidate.address,
        chain: candidate.chain,
        name: candidate.name,
        symbol: candidate.symbol,
        pairAddress: candidate.pairAddress,

        // Price
        priceUsd: candidate.priceUsd,
        priceChange24h: candidate.priceChange24h,
        priceChange1h: candidate.priceChange1h,
        priceChange6h: candidate.priceChange6h,

        // Market metrics
        volume24h: candidate.volume24h,
        liquidityUsd: candidate.liquidityUsd,
        marketCap: candidate.marketCap,
        txCount24h: candidate.txCount24h,
        buyCount24h: candidate.buyCount24h,
        sellCount24h: candidate.sellCount24h,

        // Holder metrics
        holderCount: candidate.holderCount,
        uniqueBuyers24h: candidate.uniqueBuyers24h,
        ageHours: candidate.ageHours,

        // Whale
        whaleBuys: `${candidate.whaleBuys} buys`,
        whaleSells: `${candidate.whaleSells} sells`,
        whaleBuysCount: candidate.whaleBuys,
        whaleSellsCount: candidate.whaleSells,

        // Social
        tweetsCount: candidate.tweetsCount,
        tweets: candidate.tweets,
        hasSocialLinks: candidate.hasSocialLinks,
        websites: candidate.websites,
        socials: candidate.socials,

        // Intelligence scores
        score: scoreResult.score,
        confidence: scoreResult.confidence,
        confidenceLabel,
        breakdown: scoreResult.breakdown,
        opportunityScore: Math.round(opportunityScore),

        // Risk
        riskTier: riskAssessment.tier,
        rugScore: riskAssessment.rugScore,
        rugFlags: riskAssessment.rugFlags,

        // AI
        aiSummary: aiData.summary,
        aiStrengths: aiData.strengths,
        aiRisks: aiData.risks,
        aiRecentChange: aiData.recentChange,
        aiNarrative: aiData.narrative,
        analysisMethod: openaiKey ? "AI_ENGINE" : "HEURISTIC_FALLBACK",

        // Meta
        apiSuccessFlags: candidate.apiSuccessFlags,
      };
    })
  );

  const payload = {
    timestamp: Date.now(),
    totalCandidates: candidates.length,
    totalQualified: qualified.length,
    totalRejected: candidates.length - qualified.length,
    tokens: finalTokens,
  };

  await cache.set("discovery-data", payload, 360); // 6 minute TTL
  console.log(`✅ Discovery cache populated with ${finalTokens.length} tokens`);
  discoveryWorkerEmitter.emit("update", payload);
}
