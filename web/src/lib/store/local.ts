import { promises as fs } from "node:fs";
import path from "node:path";
import { laterStep, type EventRow, type SignupPatch, type SignupRow, type Store } from "./types";

// Dev-only fallback so the funnel works before Google Sheets is wired up.
// Vercel's filesystem is read-only, so this is never used in production.
const FILE = path.join(process.cwd(), ".data", "elissya.json");

type Db = { events: EventRow[]; signups: SignupRow[] };

let queue: Promise<unknown> = Promise.resolve();

async function read(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Db;
  } catch {
    return { events: [], signups: [] };
  }
}

async function write(db: Db) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2));
}

/** Serialise read-modify-write cycles so concurrent requests don't clobber each other. */
function mutate<T>(fn: (db: Db) => T): Promise<T> {
  const next = queue.then(async () => {
    const db = await read();
    const result = fn(db);
    await write(db);
    return result;
  });
  queue = next.catch(() => undefined);
  return next;
}

export const localStore: Store = {
  name: "local-json",

  async trackEvent(row) {
    await mutate((db) => {
      db.events.push(row);
    });
  },

  async upsertSignup(patch: SignupPatch) {
    return mutate((db) => {
      const now = new Date().toISOString();
      const idx = db.signups.findIndex((s) => s.email === patch.email);
      if (idx === -1) {
        db.signups.push({
          created_at: now,
          updated_at: now,
          session_id: "",
          instagram: "",
          creator_type: "",
          followers: "",
          dms_per_day: "",
          whatsapp: "",
          step: "email",
          country: "",
          utm_source: "",
          utm_medium: "",
          utm_campaign: "",
          utm_content: "",
          referrer: "",
          ref: "",
          ...stripEmpty(patch),
        } as SignupRow);
        return { position: db.signups.length };
      }
      const prev = db.signups[idx];
      db.signups[idx] = {
        ...prev,
        ...stripEmpty(patch),
        step: laterStep(prev.step, patch.step),
        updated_at: now,
      };
      return { position: idx + 1 };
    });
  },

  async listEvents() {
    return { rows: (await read()).events, truncated: false };
  },

  async listSignups() {
    return (await read()).signups;
  },
};

function stripEmpty<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ""),
  ) as Partial<T>;
}
