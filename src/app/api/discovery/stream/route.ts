import { cache } from "@/lib/cache";
import { startDiscoveryWorker } from "@/lib/discovery-worker";
import { discoveryWorkerEmitter } from "@/lib/discovery-worker";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  startDiscoveryWorker();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send current cached data immediately if available
      const sendCurrent = async () => {
        const current = await cache.get("discovery-data");
        if (current) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(current)}\n\n`));
        } else {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ loading: true, tokens: [], timestamp: Date.now() })}\n\n`
            )
          );
        }
      };

      sendCurrent();

      // Listen for live updates from the discovery worker
      const onUpdate = (payload: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          discoveryWorkerEmitter.off("update", onUpdate);
        }
      };

      discoveryWorkerEmitter.on("update", onUpdate);

      // Heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
          discoveryWorkerEmitter.off("update", onUpdate);
        }
      }, 30_000);

      // Cleanup on close
      return () => {
        clearInterval(heartbeat);
        discoveryWorkerEmitter.off("update", onUpdate);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
