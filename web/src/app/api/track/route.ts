import { after } from "next/server";
import { store } from "@/lib/store";
import { deviceFrom, isFunnelEvent, readJson, sanitizeAttribution, sanitizeId } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body || !isFunnelEvent(body.event)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const sessionId = sanitizeId(body.sid);
  if (!sessionId) return Response.json({ ok: false }, { status: 400 });

  const device = deviceFrom(req.headers.get("user-agent"));
  if (device === "bot") return Response.json({ ok: true });

  const row = {
    ts: new Date().toISOString(),
    session_id: sessionId,
    event: body.event,
    detail: typeof body.detail === "string" ? body.detail.slice(0, 120) : "",
    country: req.headers.get("x-vercel-ip-country") ?? "",
    device,
    ...sanitizeAttribution(body.attribution),
  };

  // Respond immediately; the Sheets write happens after the response is sent.
  after(async () => {
    try {
      await store.trackEvent(row);
    } catch (err) {
      console.error("[track] failed to record event", row.event, err);
    }
  });

  return Response.json({ ok: true });
}
