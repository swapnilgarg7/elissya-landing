import { localStore } from "./local";
import { sheetsStore } from "./sheets";
import type { Store } from "./types";

export const sheetsConfigured = Boolean(process.env.SHEETS_WEBAPP_URL && process.env.SHEETS_SECRET);

if (!sheetsConfigured && process.env.VERCEL) {
  console.error(
    "[elissya] SHEETS_WEBAPP_URL / SHEETS_SECRET are not set. Signups will NOT be saved in this deployment.",
  );
}

export const store: Store = sheetsConfigured ? sheetsStore : localStore;

export * from "./types";
