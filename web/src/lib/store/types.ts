export const FUNNEL_EVENTS = [
  "page_view",
  "demo_view",
  "cta_click",
  "email_submitted",
  "instagram_submitted",
  "details_submitted",
  "form_closed",
] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

export type Attribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  referrer: string;
  ref: string;
};

export type EventRow = Attribution & {
  ts: string;
  session_id: string;
  event: FunnelEvent;
  detail: string;
  country: string;
  device: string;
};

export type SignupStep = "email" | "instagram" | "complete";

export type SignupRow = Attribution & {
  created_at: string;
  updated_at: string;
  session_id: string;
  email: string;
  instagram: string;
  creator_type: string;
  followers: string;
  dms_per_day: string;
  whatsapp: string;
  step: SignupStep;
  country: string;
};

/** Partial update applied to the signup keyed by email. */
export type SignupPatch = Partial<Omit<SignupRow, "created_at" | "updated_at">> & {
  email: string;
};

export interface Store {
  readonly name: string;
  trackEvent(row: EventRow): Promise<void>;
  /** Insert or merge by email. Returns 1-based waitlist position. */
  upsertSignup(patch: SignupPatch): Promise<{ position: number }>;
  listEvents(): Promise<{ rows: EventRow[]; truncated: boolean }>;
  listSignups(): Promise<SignupRow[]>;
}

const STEP_RANK: Record<SignupStep, number> = { email: 0, instagram: 1, complete: 2 };

/** A signup never moves backwards (re-entering an email must not undo "complete"). */
export function laterStep(a: SignupStep, b: SignupStep | undefined): SignupStep {
  return b && STEP_RANK[b] > STEP_RANK[a] ? b : a;
}
