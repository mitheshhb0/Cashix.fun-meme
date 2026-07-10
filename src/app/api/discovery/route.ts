import { NextResponse } from "next/server";
import { cache } from "@/lib/cache";
import { startDiscoveryWorker } from "@/lib/discovery-worker";

const emptyPayload = {
  timestamp: Date.now(),
  totalCandidates: 0,
  totalQualified: 0,
  totalRejected: 0,
  tokens: [],
};

export async function GET() {
  startDiscoveryWorker();
  const data = await cache.get("discovery-data");
  return NextResponse.json(data ?? { ...emptyPayload, loading: true });
}

export async function POST() {
  startDiscoveryWorker();
  const data = await cache.get("discovery-data");
  return NextResponse.json(data ?? { ...emptyPayload, loading: true });
}
