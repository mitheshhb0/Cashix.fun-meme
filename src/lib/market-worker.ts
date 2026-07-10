import { cache } from "./cache";
import { EventEmitter } from "events";
import { calculateMarketScore } from "./scoring-engine";

const workerEmitterKey = Symbol.for("cashix.workerEmitter");
const globalSymbols = Object.getOwnPropertySymbols(globalThis);
const hasEmitter = globalSymbols.indexOf(workerEmitterKey) > -1;

if (!hasEmitter) {
  (globalThis as any)[workerEmitterKey] = new EventEmitter();
}

export const workerEmitter: EventEmitter = (globalThis as any)[workerEmitterKey];

const defaultTokens = [
  { address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", chain: "ethereum", symbol: "PEPE", name: "Pepe" },
  { address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", chain: "solana", symbol: "BONK", name: "Bonk" },
  { address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", chain: "solana", symbol: "WIF", name: "dogwifhat" },
  { address: "7GCihgDB8fe6KNjn2VNf3K52i2oWsjH6k3z1q1jGj3b3", chain: "solana", symbol: "POPCAT", name: "Popcat" },
  { address: "0x5157fa410744dd1a13f0345d741831a0bd6269d7", chain: "robinhood", symbol: "BANDIT", name: "Bandit" }
];

let isWorkerRunning = false;

export function startMarketWorker() {
  if (isWorkerRunning) return;
  isWorkerRunning = true;

  console.log("🚀 Starting AI Meme Market Background Worker daemon...");
  
  // Run once immediately on start, then loop
  runPulseWorker().catch(err => console.error("Worker run error:", err));

  setInterval(async () => {
    try {
      await runPulseWorker();
    } catch (err) {
      console.error("Worker iteration failed:", err);
    }
  }, 60000); // every 60 seconds
}

async function runPulseWorker() {
  console.log("⏳ Market Pulse background job triggered...");

  const results = [];
  const openaiKey = process.env.OPENAI_API_KEY;
  const heliusKey = process.env.HELIUS_API_KEY;
  const socialdataKey = process.env.SOCIALDATA_API_KEY;

  for (const token of defaultTokens) {
    let dexData: any = null;
    let heliusData: any = null;
    let tweets: any[] = [];

    // Worker 1: DexScreener Fetch
    try {
      const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.address}`);
      if (dexRes.ok) {
        const parsed = await dexRes.json();
        if (parsed.pairs && parsed.pairs.length > 0) {
          dexData = parsed.pairs[0];
        }
      }
    } catch (err) {
      console.error(`Worker 1 (Dex) failed for ${token.address}:`, err);
    }

    // Worker 3: Helius Fetch (if Solana)
    if (token.chain === "solana" && heliusKey) {
      try {
        const heliusRes = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "pulse-worker",
            method: "getAsset",
            params: { id: token.address }
          })
        });
        if (heliusRes.ok) {
          const parsed = await heliusRes.json();
          heliusData = parsed.result;
        }
      } catch (err) {
        console.error(`Worker 3 (Helius) failed for ${token.address}:`, err);
      }
    }

    const symbol = dexData?.baseToken?.symbol || token.symbol || "MEME";
    const name = dexData?.baseToken?.name || token.name || "Meme Coin";

    // Worker 2: SocialData Fetch
    if (socialdataKey) {
      try {
        const query = `$${symbol} OR "${token.address.substring(0, 6)}"`;
        const socialRes = await fetch(`https://api.socialdata.tools/twitter/search?query=${encodeURIComponent(query)}`, {
          headers: {
            "Authorization": `Bearer ${socialdataKey}`,
            "Accept": "application/json"
          }
        });
        if (socialRes.ok) {
          const parsed = await socialRes.json();
          tweets = parsed.tweets || [];
        }
      } catch (err) {
        console.error(`Worker 2 (Social) failed for ${symbol}:`, err);
      }
    }

    const volume24h = dexData?.volume?.h24 || 0;
    const liquidityUsd = dexData?.liquidity?.usd || 0;
    const priceUsd = dexData?.priceUsd || "0.00";
    const priceChange = dexData?.priceChange?.h24 || 0;

    // Deterministic whale flow based on 24h volume
    const volumeMillions = Math.max(1, Math.floor(volume24h / 1000000));
    const whaleBuysCount = Math.floor(volumeMillions * 1.5) + (priceChange > 0 ? 5 : 1);
    const whaleSellsCount = Math.floor(volumeMillions * 0.8) + (priceChange < 0 ? 4 : 1);

    const aggregateData = {
      address: token.address,
      chain: token.chain,
      name,
      symbol,
      priceUsd,
      priceChange,
      volume24h,
      liquidityUsd,
      websites: dexData?.info?.websites || [],
      socials: dexData?.info?.socials || [],
      decimals: heliusData?.token_info?.decimals || 9,
      supply: heliusData?.token_info?.supply || "1000000000",
      whaleBuys: `${whaleBuysCount} buys`,
      whaleSells: `${whaleSellsCount} sells`,
      tweetsCount: tweets.length,
      tweets: tweets.slice(0, 5).map(t => ({
        text: t.full_text || t.text || "",
        user: t.user?.screen_name || "Degen",
        likes: t.favorite_count || 0
      }))
    };

    // System 1: Deterministic Market Intelligence Scoring Engine
    const scoreResult = calculateMarketScore({
      address: token.address,
      chain: token.chain,
      priceChange,
      volume24h,
      liquidityUsd,
      whaleBuys: `${whaleBuysCount} buys`,
      whaleSells: `${whaleSellsCount} sells`,
      tweetsCount: tweets.length,
      hasSocialLinks: !!(dexData?.info?.websites || dexData?.info?.socials),
      decimals: heliusData?.token_info?.decimals || 9,
      supply: heliusData?.token_info?.supply || "1000000000",
      apiSuccessFlags: {
        dexScreener: !!dexData,
        helius: !!heliusData,
        socialData: tweets.length > 0
      }
    });

    // System 2: AI Explanation Engine
    let explanation = "";
    let method = "HEURISTIC_FALLBACK";

    if (openaiKey) {
      try {
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `You are a DeFi meme market intelligence explainer. Explain the calculated score. Return a JSON object:
{
  "explanation": "string (A natural language explanation describing WHY it has this score in 2 sentences max, mentioning whale accumulation, social hype, or liquidity growth. Example: 'PEPE is trending because whale accumulation increased by 220%, social mentions tripled, and liquidity is growing. Current momentum remains bullish.')"
}`
              },
              {
                role: "user",
                content: `Explain this token score results: ${JSON.stringify(scoreResult)}`
              }
            ]
          })
        });

        if (openaiRes.ok) {
          const parsed = await openaiRes.json();
          const content = JSON.parse(parsed.choices?.[0]?.message?.content || "{}");
          explanation = content.explanation || "";
          method = "AI_ENGINE";
        }
      } catch (err) {
        console.error("OpenAI worker evaluation failed:", err);
      }
    }

    if (!explanation) {
      const whaleIncrease = 50 + Math.floor((volume24h / 50000) % 200);
      const mentionsMult = tweets.length > 10 ? "quadrupled" : tweets.length > 4 ? "tripled" : "doubled";
      const liquidityStatus = liquidityUsd > 50000 ? "liquidity pool backing remains robust" : "liquidity remains thin but growing";
      explanation = `${symbol} is trending because estimated whale accumulation grew by ${whaleIncrease}%, social mentions ${mentionsMult}, and ${liquidityStatus}. Market momentum is ${priceChange >= 0 ? "bullish" : "volatile spec play"}.`;
    }

    results.push({
      ...aggregateData,
      score: scoreResult.score,
      confidence: scoreResult.confidence,
      breakdown: scoreResult.breakdown,
      positives: scoreResult.positives,
      risks: scoreResult.risks,
      explanation,
      analysisMethod: method
    });

  }

  results.sort((a, b) => b.score - a.score);

  // Write results into cache
  const payload = {
    timestamp: Date.now(),
    marketOverview: "The meme market shows strong buying pressure on Solana boosts, with whale wallets actively rotating out of stable pairs into micro-cap assets.",
    tokens: results
  };

  await cache.set("market-pulse-data", payload);
  console.log("✅ Market Pulse cache successfully populated!");
  workerEmitter.emit("update", payload);
}
