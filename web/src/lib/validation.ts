import { FUNNEL_EVENTS, type Attribution, type FunnelEvent } from "./store/types";

export const CREATOR_TYPES = ["UGC creator", "Influencer", "Brand or agency", "Something else"] as const;
export const FOLLOWER_RANGES = ["Under 10k", "10k-50k", "50k-200k", "200k+"] as const;
export const DM_RANGES = ["Under 20", "20-100", "100-500", "500+"] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HANDLE_RE = /^[a-z0-9._]{1,30}$/;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  return email.length <= 254 && EMAIL_RE.test(email) ? email : null;
}

/** Accepts "@handle", "handle", or a pasted profile URL. */
export function normalizeHandle(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let h = raw.trim().toLowerCase();
  const fromUrl = h.match(/instagram\.com\/([^/?#\s]+)/);
  if (fromUrl) h = fromUrl[1];
  h = h.replace(/^@+/, "");
  return HANDLE_RE.test(h) ? h : null;
}

export function normalizePhone(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const p = raw.replace(/[^\d+]/g, "");
  return p.replace(/\D/g, "").length >= 8 && p.length <= 16 ? p : "";
}

export function oneOf<T extends readonly string[]>(list: T, raw: unknown): T[number] | "" {
  return typeof raw === "string" && (list as readonly string[]).includes(raw) ? raw : "";
}

export function isFunnelEvent(raw: unknown): raw is FunnelEvent {
  return typeof raw === "string" && (FUNNEL_EVENTS as readonly string[]).includes(raw);
}

export function sanitizeId(raw: unknown): string {
  return typeof raw === "string" ? raw.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64) : "";
}

function str(raw: unknown, max = 200): string {
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
}

export function sanitizeAttribution(raw: unknown): Attribution {
  const a = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    utm_source: str(a.utm_source, 100),
    utm_medium: str(a.utm_medium, 100),
    utm_campaign: str(a.utm_campaign, 150),
    utm_content: str(a.utm_content, 150),
    referrer: str(a.referrer, 300),
    ref: normalizeHandle(a.ref) ?? "",
  };
}

export function deviceFrom(ua: string | null): string {
  if (!ua) return "";
  if (/bot|crawler|spider|facebookexternalhit/i.test(ua)) return "bot";
  if (/Instagram/i.test(ua)) return "instagram-app";
  if (/FBAN|FBAV/i.test(ua)) return "facebook-app";
  return /Mobi|Android|iPhone/i.test(ua) ? "mobile" : "desktop";
}

/** Rejects oversized bodies before parsing them. */
export async function readJson(req: Request, maxBytes = 4096): Promise<Record<string, unknown> | null> {
  const text = await req.text();
  if (text.length > maxBytes) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}
