// Absolute URLs (OG image, canonical) come from config, never a hardcoded host.
// Set NEXT_PUBLIC_SITE_URL per environment, e.g. https://elissya.sorvexai.com
// A bare domain ("elissya.sorvexai.com") is accepted and treated as https.
function normalizeOrigin(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    console.error(`[elissya] Ignoring invalid site URL: "${raw}"`);
    return null;
  }
}

export const siteUrl =
  normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? "") ??
  normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "") ??
  "http://localhost:3000";

export const site = {
  name: "Elissya",
  title: "Elissya - your agentic social media manager",
  description:
    "Elissya answers your Instagram DMs in your voice, sorts fans from brand deals, and hands you the conversations that matter.",
};
