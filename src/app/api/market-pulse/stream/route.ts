import { NextResponse } from "next/server";
import { cache } from "@/lib/cache";
import { startMarketWorker, workerEmitter } from "@/lib/market-worker";

export async function GET(request: Request) {
  // Start background worker daemon
  startMarketWorker();

  const responseHeaders = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive"
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial cache payload immediately if available
      const initialCache = await cache.get("market-pulse-data");
      if (initialCache) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialCache)}\n\n`));
      }

      // Handler for live updates emitted by background workers
      const onUpdate = (payload: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch (err) {
          console.error("Error sending SSE update:", err);
        }
      };

      workerEmitter.on("update", onUpdate);

      // Clean up connection on cancel
      request.signal.addEventListener("abort", () => {
        workerEmitter.off("update", onUpdate);
        controller.close();
      });
    }
  });

  return new Response(stream, { headers: responseHeaders });
}
