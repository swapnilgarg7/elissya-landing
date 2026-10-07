import type { EventRow, FunnelEvent, SignupRow } from "./store/types";

export const STAGES: { event: FunnelEvent; label: string }[] = [
  { event: "page_view", label: "Visited" },
  { event: "demo_view", label: "Scrolled to demo" },
  { event: "cta_click", label: "Clicked “I want it”" },
  { event: "email_submitted", label: "Gave email" },
  { event: "instagram_submitted", label: "Gave Instagram" },
  { event: "details_submitted", label: "Finished" },
];

export type Range = "24h" | "7d" | "30d" | "all";

export function sinceFor(range: Range): number {
  const day = 86_400_000;
  return { "24h": Date.now() - day, "7d": Date.now() - 7 * day, "30d": Date.now() - 30 * day, all: 0 }[range];
}

/** Distinct visitors (session ids) that fired each event. */
function uniques(events: EventRow[]) {
  const sets = new Map<FunnelEvent, Set<string>>();
  for (const e of events) {
    if (!sets.has(e.event)) sets.set(e.event, new Set());
    sets.get(e.event)!.add(e.session_id);
  }
  return (ev: FunnelEvent) => sets.get(ev)?.size ?? 0;
}

export function computeFunnel(all: EventRow[], range: Range) {
  const since = sinceFor(range);
  const events = all.filter((e) => Date.parse(e.ts) >= since);
  const count = uniques(events);

  const stages = STAGES.map((s, i) => {
    const n = count(s.event);
    const prev = i === 0 ? n : count(STAGES[i - 1].event);
    return { ...s, n, ofPrev: i === 0 || !prev ? null : n / prev };
  });
  const top = stages[0].n || 1;

  // Where people who opened the form gave up.
  const closed = new Map<string, Set<string>>();
  for (const e of events) {
    if (e.event !== "form_closed") continue;
    if (!closed.has(e.detail)) closed.set(e.detail, new Set());
    closed.get(e.detail)!.add(e.session_id);
  }
  const abandon = ["email", "instagram", "details"].map((step) => ({ step, n: closed.get(step)?.size ?? 0 }));

  // Per-source breakdown, by each visitor's first-touch utm_source.
  const bySource = new Map<string, EventRow[]>();
  for (const e of events) {
    const key = e.utm_source || (e.referrer ? hostOf(e.referrer) : "direct");
    if (!bySource.has(key)) bySource.set(key, []);
    bySource.get(key)!.push(e);
  }
  const sources = [...bySource.entries()]
    .map(([source, rows]) => {
      const c = uniques(rows);
      const visitors = c("page_view");
      return {
        source,
        visitors,
        clicks: c("cta_click"),
        emails: c("email_submitted"),
        finished: c("details_submitted"),
        conversion: visitors ? c("email_submitted") / visitors : 0,
      };
    })
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 12);

  const devices = new Map<string, Set<string>>();
  for (const e of events) {
    if (e.event !== "page_view") continue;
    const d = e.device || "unknown";
    if (!devices.has(d)) devices.set(d, new Set());
    devices.get(d)!.add(e.session_id);
  }

  return {
    stages: stages.map((s) => ({ ...s, ofTop: s.n / top })),
    abandon,
    sources,
    devices: [...devices.entries()].map(([device, s]) => ({ device, n: s.size })).sort((a, b) => b.n - a.n),
  };
}

export function filterSignups(rows: SignupRow[], range: Range) {
  const since = sinceFor(range);
  return rows.filter((r) => Date.parse(r.created_at) >= since).reverse();
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "other";
  }
}
