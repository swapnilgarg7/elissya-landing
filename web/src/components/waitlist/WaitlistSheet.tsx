"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Copy, WhatsappLogo, X } from "@phosphor-icons/react";
import { attribution, pixel, sessionId, track } from "@/lib/analytics";
import { CREATOR_TYPES, DM_RANGES, FOLLOWER_RANGES } from "@/lib/validation";

type Step = "email" | "instagram" | "details" | "done";

type Saved = { email?: string; instagram?: string; position?: number; step?: Step };

const SAVED_KEY = "elissya_joined";
const EASE = [0.16, 1, 0.3, 1] as const;

function loadSaved(): Saved {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "{}") as Saved;
  } catch {
    return {};
  }
}

function persist(s: Saved) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(s));
  } catch {
    /* private mode: the flow still works, it just won't resume */
  }
}

export function WaitlistSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Lazily seeded from localStorage so a returning visitor resumes where they left off.
  // The provider remounts this component (new key) each time the sheet opens.
  const [saved, setSaved] = useState<Saved>(loadSaved);
  const [step, setStep] = useState<Step>(() =>
    saved.step === "done" ? "done" : saved.instagram ? "details" : saved.email ? "instagram" : "email",
  );
  const [email, setEmail] = useState(saved.email ?? "");
  const [instagram, setInstagram] = useState(saved.instagram ?? "");
  const [creatorType, setCreatorType] = useState("");
  const [followers, setFollowers] = useState("");
  const [dms, setDms] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 250);
    return () => clearTimeout(t);
  }, [open, step]);

  function close() {
    if (step !== "done") track("form_closed", { detail: step });
    onClose();
  }

  async function submit(payload: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, email, sid: sessionId(), website: honeypot }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; position?: number; instagram?: string };
      if (!data.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return null;
      }
      return data;
    } catch {
      setError("You seem to be offline. Try again.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    const data = await submit({ step: "email", attribution: attribution() });
    if (!data) return;
    track("email_submitted");
    pixel("track", "Lead");
    const next = { ...saved, email: email.trim().toLowerCase(), position: data.position, step: "instagram" as Step };
    setSaved(next);
    persist(next);
    setStep("instagram");
  }

  async function onInstagram(e: React.FormEvent) {
    e.preventDefault();
    const data = await submit({ step: "instagram", instagram });
    if (!data) return;
    track("instagram_submitted");
    const next = { ...saved, instagram: data.instagram, step: "details" as Step };
    setSaved(next);
    persist(next);
    setStep("details");
  }

  async function onDetails(skipped: boolean) {
    const data = await submit(
      skipped
        ? { step: "details" }
        : { step: "details", creator_type: creatorType, followers, dms_per_day: dms, whatsapp },
    );
    if (!data) return;
    track("details_submitted", { detail: skipped ? "skipped" : "answered" });
    pixel("track", "CompleteRegistration");
    const next = { ...saved, step: "done" as Step };
    setSaved(next);
    persist(next);
    setStep("done");
  }

  const stepIndex = { email: 0, instagram: 1, details: 2, done: 3 }[step];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 cursor-default bg-[rgb(10_10_9/0.45)] backdrop-blur-[6px]"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="waitlist-title"
            className="relative w-full max-w-[520px] rounded-t-[28px] border border-line bg-surface p-6 pb-8 shadow-soft sm:rounded-[28px] sm:p-8"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex gap-1.5" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="relative h-1 w-10 overflow-hidden rounded-full bg-surface-2">
                    <motion.span
                      className="absolute inset-0 origin-left rounded-full bg-accent"
                      initial={false}
                      animate={{ scaleX: stepIndex > i ? 1 : stepIndex === i ? 0.35 : 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Honeypot for bots. Hidden from people and screen readers. */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="absolute -left-[9999px] size-px opacity-0"
              name="website"
            />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {step === "email" && (
                  <form onSubmit={onEmail} noValidate>
                    <Question id="waitlist-title" htmlFor="wl-email">
                      Where should we send your invite?
                    </Question>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">
                      Early access opens in small batches. We&apos;ll email you when it&apos;s your turn.
                    </p>
                    <Field
                      id="wl-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@gmail.com"
                      value={email}
                      onChange={setEmail}
                      error={error}
                    />
                    <Primary busy={busy} disabled={!email.trim()}>
                      Continue
                    </Primary>
                  </form>
                )}

                {step === "instagram" && (
                  <form onSubmit={onInstagram} noValidate>
                    <Question id="waitlist-title" htmlFor="wl-ig">
                      What&apos;s your Instagram?
                    </Question>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">
                      So we can see your niche and set Elissya up for your audience.
                    </p>
                    <Field
                      id="wl-ig"
                      prefix="@"
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="yourhandle"
                      value={instagram}
                      onChange={setInstagram}
                      error={error}
                    />
                    <Primary busy={busy} disabled={!instagram.trim()}>
                      Continue
                    </Primary>
                  </form>
                )}

                {step === "details" && (
                  <div>
                    <h2 id="waitlist-title" className="font-display text-[28px] leading-[1.1] font-semibold tracking-tight">
                      Last bit. Who gets in first?
                    </h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">
                      We open early access to the busiest inboxes first.
                    </p>
                    <div className="mt-6 space-y-5">
                      <Chips label="You are a" options={CREATOR_TYPES} value={creatorType} onChange={setCreatorType} />
                      <Chips label="Followers" options={FOLLOWER_RANGES} value={followers} onChange={setFollowers} />
                      <Chips label="DMs you get a day" options={DM_RANGES} value={dms} onChange={setDms} />
                      <div className="flex flex-col gap-2">
                        <label htmlFor="wl-wa" className="text-sm font-medium">
                          WhatsApp <span className="font-normal text-muted">(optional, for a faster invite)</span>
                        </label>
                        <input
                          id="wl-wa"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="+91 98xxx xxxxx"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          className="h-12 rounded-full border border-line bg-bg px-5 text-[15px] outline-none transition-colors placeholder:text-muted focus:border-ink"
                        />
                      </div>
                    </div>
                    {error && (
                      <p role="alert" className="mt-4 text-sm text-accent-ink">
                        {error}
                      </p>
                    )}
                    <div className="mt-7 flex items-center gap-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onDetails(false)}
                        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-medium text-bg transition-[transform,background-color] hover:bg-cta-hover hover:text-cta-hover-fg active:scale-[0.98] disabled:opacity-50"
                      >
                        {busy ? "Saving..." : "Join the list"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onDetails(true)}
                        className="h-12 rounded-full px-5 text-[15px] text-muted transition-colors hover:text-ink"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}

                {step === "done" && <Done saved={saved} />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Question({ id, htmlFor, children }: { id: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <label id={id} htmlFor={htmlFor} className="block font-display text-[28px] leading-[1.1] font-semibold tracking-tight">
      {children}
    </label>
  );
}

function Field({
  id,
  prefix,
  value,
  onChange,
  error,
  ...rest
}: {
  id: string;
  prefix?: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "prefix">) {
  return (
    <div className="mt-6 flex flex-col gap-2">
      <div
        className={`flex h-14 items-center rounded-full border bg-bg px-5 transition-colors focus-within:border-ink ${
          error ? "border-accent" : "border-line"
        }`}
      >
        {prefix && <span className="mr-0.5 text-lg text-muted">{prefix}</span>}
        <input
          id={id}
          data-autofocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
          className="h-full w-full bg-transparent text-lg outline-none placeholder:text-muted"
          {...rest}
        />
      </div>
      {error && (
        <p id={`${id}-err`} role="alert" className="px-5 text-sm text-accent-ink">
          {error}
        </p>
      )}
    </div>
  );
}

function Primary({ busy, disabled, children }: { busy: boolean; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-base font-medium text-bg transition-[transform,background-color,opacity] hover:bg-cta-hover hover:text-cta-hover-fg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-bg"
    >
      {busy ? "Saving..." : children}
      {!busy && <ArrowRight size={18} weight="bold" />}
    </button>
  );
}

function Chips<T extends readonly string[]>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? "" : o)}
              className={`h-10 rounded-full border px-4 text-sm transition-[background-color,border-color,color,transform] active:scale-[0.97] ${
                active ? "border-ink bg-ink text-bg" : "border-line bg-bg text-ink hover:border-ink/40"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Done({ saved }: { saved: Saved }) {
  const [copied, setCopied] = useState(false);
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/${saved.instagram ? `?ref=${encodeURIComponent(saved.instagram)}` : ""}`
      : "";
  const message = `I just joined the waitlist for Elissya, an AI that handles your Instagram DMs. ${link}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked; the link is still visible to select */
    }
  }

  return (
    <div>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="grid size-14 place-items-center rounded-full bg-accent text-white dark:text-bg"
      >
        <Check size={26} weight="bold" />
      </motion.div>
      <h2 id="waitlist-title" className="mt-6 font-display text-[34px] leading-[1.05] font-semibold tracking-tight">
        You&apos;re in.
        {saved.position ? <span className="text-muted"> #{saved.position} on the list.</span> : null}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        We&apos;ll email {saved.email ? <span className="text-ink">{saved.email}</span> : "you"} when your spot opens. Know a
        creator drowning in DMs? Send them your link.
      </p>
      <div className="mt-6 flex items-center gap-2 rounded-full border border-line bg-bg p-1.5 pl-5">
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-muted">{link.replace(/^https?:\/\//, "")}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-medium text-bg active:scale-[0.97]"
        >
          {copied ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line text-[15px] font-medium transition-colors hover:border-ink"
      >
        <WhatsappLogo size={20} weight="fill" />
        Share on WhatsApp
      </a>
    </div>
  );
}
