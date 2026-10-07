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

/**
 * Stores phones in E.164 where possible. US is the default market:
 * a bare 10-digit number (or 11 digits starting with 1) is treated as +1.
 */
export function normalizePhone(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const digits = raw.replace(/\D/g, "");
  if (raw.trim().startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : "";
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return "";
}

/** As-you-type formatting: "(555) 123-4567" for US, untouched digits after any other +code. */
export function formatPhoneInput(raw: string): string {
  const trimmed = raw.trimStart();
  const all = trimmed.replace(/\D/g, "");
  let digits = all;
  const plus = trimmed.startsWith("+");
  if (plus && digits && !digits.startsWith("1")) return `+${digits.slice(0, 15)}`;
  // US area codes never start with 1, so a leading 1 is always the country code.
  const country = plus || digits.startsWith("1");
  if (country) digits = digits.slice(1);
  const d = digits.slice(0, 10);
  const local =
    d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d;
  if (!country) return local;
  if (local) return `+1 ${local}`;
  return all ? (plus ? "+1" : "1") : "+";
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
