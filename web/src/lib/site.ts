// Absolute URLs (OG image, canonical) come from config, never a hardcoded host.
// Set NEXT_PUBLIC_SITE_URL per environment, e.g. https://elissya.ai
export const siteUrl = (() => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
})();

export const site = {
  name: "Elissya",
  title: "Elissya - your agentic social media manager",
  description:
    "Elissya answers your Instagram DMs in your voice, sorts fans from brand deals, and hands you the conversations that matter.",
};
