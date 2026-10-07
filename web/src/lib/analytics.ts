"use client";

import type { Attribution, FunnelEvent } from "./store/types";

const SID_KEY = "elissya_sid";
const ATTR_KEY = "elissya_attr";
const SENT_KEY = "elissya_sent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export function sessionId(): string {
  return safe(() => {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  }, "anon-" + Math.random().toString(36).slice(2));
}

/** First-touch attribution: the ad or link that first brought this visitor in. */
export function attribution(): Attribution {
  return safe(() => {
    const saved = localStorage.getItem(ATTR_KEY);
    if (saved) return JSON.parse(saved) as Attribution;
    const p = new URLSearchParams(location.search);
    const ref = document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : "";
    const a: Attribution = {
      utm_source: p.get("utm_source") ?? (p.get("fbclid") ? "facebook" : ""),
      utm_medium: p.get("utm_medium") ?? "",
      utm_campaign: p.get("utm_campaign") ?? "",
      utm_content: p.get("utm_content") ?? "",
      referrer: ref,
      ref: p.get("ref") ?? "",
    };
    localStorage.setItem(ATTR_KEY, JSON.stringify(a));
    return a;
  }, { utm_source: "", utm_medium: "", utm_campaign: "", utm_content: "", referrer: "", ref: "" });
}

/**
 * Records a funnel event. `once` events fire at most once per tab session to
 * keep the sheet small; the dashboard counts distinct visitors either way.
 */
export function track(event: FunnelEvent, opts: { detail?: string; once?: boolean } = {}) {
  if (opts.once) {
    const sent = safe(() => JSON.parse(sessionStorage.getItem(SENT_KEY) ?? "[]") as string[], []);
    if (sent.includes(event)) return;
    safe(() => sessionStorage.setItem(SENT_KEY, JSON.stringify([...sent, event])), undefined);
  }
  const body = JSON.stringify({ event, sid: sessionId(), detail: opts.detail, attribution: attribution() });
  const sentBeacon = safe(
    () => navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" })) ?? false,
    false,
  );
  if (!sentBeacon) {
    fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(
      () => undefined,
    );
  }
}

export function pixel(...args: unknown[]) {
  safe(() => window.fbq?.(...args), undefined);
}
