import type { EventRow, SignupPatch, SignupRow, Store } from "./types";

// Talks to the Apps Script web app in /apps-script/Code.gs, which reads and
// writes the "Events" and "Signups" tabs of the Google Sheet.

const TIMEOUT_MS = 12_000;

async function call<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const url = process.env.SHEETS_WEBAPP_URL!;
  const res = await fetch(url, {
    method: "POST",
    // text/plain avoids a CORS preflight; Apps Script reads the raw body either way.
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, secret: process.env.SHEETS_SECRET, ...payload }),
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await res.text();
  let data: { ok: boolean; error?: string } & T;
  try {
    data = JSON.parse(text);
  } catch {
    // Apps Script returns an HTML error page when the deployment is wrong
    // (e.g. access not set to "Anyone").
    throw new Error(`Sheets web app returned non-JSON (HTTP ${res.status}): ${text.slice(0, 160)}`);
  }
  if (!data.ok) throw new Error(`Sheets web app error: ${data.error ?? "unknown"}`);
  return data;
}

export const sheetsStore: Store = {
  name: "google-sheets",

  async trackEvent(row) {
    await call("track", { row });
  },

  async upsertSignup(patch: SignupPatch) {
    const { position } = await call<{ position: number }>("upsert", { patch });
    return { position };
  },

  async listEvents() {
    const { rows, truncated } = await call<{ rows: EventRow[]; truncated: boolean }>("events");
    return { rows, truncated };
  },

  async listSignups() {
    const { rows } = await call<{ rows: SignupRow[] }>("signups");
    return rows;
  },
};
