"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

const VOICES = {
  Casual: "honestly $200-250 for 4 days if u do scooters + shacks 😌 sending u my budget sheet",
  Playful: "ok so like $200-250 for 4 days!! scooter + beach shacks = elite 🛵 budget sheet coming ur way",
  Professional: "Roughly $200-250 for four days with a scooter and beach shack stays. I'll share my budget breakdown.",
} as const;

type Voice = keyof typeof VOICES;

const RULES = [
  "Brand deals always come to me",
  "Never quote my rates",
  "Archive obvious spam",
  "Loop in my manager on big deals",
];

const CAMPAIGNS = [
  "DM “GOA” for my full list",
  "DM me a photo of your setup",
  "DM “COLLAB” if you're a brand",
  "DM “EARLY” for first access",
  "DM me your dream destination",
  "DM me your biggest creator struggle",
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
};

export function Bento() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-[auto_auto_auto]">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[28px] bg-accent-soft p-6 md:col-span-4 md:p-8"
      >
        <VoiceCell />
      </motion.div>

      <motion.figure
        {...reveal}
        transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col overflow-hidden rounded-[28px] border border-line bg-surface md:col-span-2 md:row-span-2"
      >
        <div className="relative min-h-[320px] flex-1">
          <Image
            src="/demo/creator.jpg"
            alt="A UGC creator filming a skincare video on her phone at home"
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        </div>
        <figcaption className="p-6 text-[15px] leading-relaxed">
          <span className="font-semibold">You make the content.</span>{" "}
          <span className="text-muted">Elissya answers the hundreds of DMs it starts.</span>
        </figcaption>
      </motion.figure>

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[28px] border border-line bg-surface p-6 md:col-span-2 md:p-7"
      >
        <RulesCell />
      </motion.div>

      <motion.figure
        {...reveal}
        transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="relative min-h-[300px] overflow-hidden rounded-[28px] md:col-span-2"
      >
        <Image
          src="/demo/phone.jpg"
          alt="A phone full of notifications on a cafe table"
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(10_9_14/0.82)] via-[rgb(10_9_14/0.2)] to-transparent" />
        <figcaption className="absolute inset-x-0 bottom-0 p-6 text-[15px] leading-relaxed text-white">
          <span className="font-semibold">Every DM becomes a contact.</span>{" "}
          <span className="text-white/75">With a summary, tags and a lead score.</span>
        </figcaption>
      </motion.figure>

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-[28px] border border-line bg-surface py-7 md:col-span-6"
      >
        <div className="px-6 md:px-8">
          <h3 className="font-display text-2xl font-semibold tracking-tight md:text-[28px]">
            Turn one story into hundreds of conversations.
          </h3>
          <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-muted">
            Post a prompt. Elissya replies to every DM it brings in, tags who sent what, and tells you how it did.
          </p>
        </div>
        <Marquee items={CAMPAIGNS} />
      </motion.div>
    </div>
  );
}

function VoiceCell() {
  const [voice, setVoice] = useState<Voice>("Casual");
  return (
    <div className="flex h-full flex-col">
      <h3 className="font-display text-2xl font-semibold tracking-tight md:text-[28px]">Sounds like you, not a bot.</h3>
      <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-muted">
        She learns from your past replies, your notes and your rate card. Same question, your way of saying it.
      </p>
      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Reply voice">
        {(Object.keys(VOICES) as Voice[]).map((v) => (
          <button
            key={v}
            role="tab"
            type="button"
            aria-selected={voice === v}
            onClick={() => setVoice(v)}
            className={`h-9 rounded-full px-4 text-sm transition-colors ${
              voice === v ? "bg-ink text-bg" : "bg-surface/70 text-ink hover:bg-surface"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-2 text-[14px]">
        <p className="max-w-[80%] self-start rounded-[18px] bg-surface px-3.5 py-2.5">how much does a goa trip cost?</p>
        <div className="min-h-[64px] self-end sm:max-w-[80%]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={voice}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="rounded-[18px] bg-bubble-out px-3.5 py-2.5 text-white"
            >
              {VOICES[voice]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function RulesCell() {
  const [on, setOn] = useState<boolean[]>(RULES.map(() => true));
  return (
    <div>
      <h3 className="font-display text-2xl font-semibold tracking-tight">Knows when to step back.</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">Your rules. Take over any chat in one tap.</p>
      <ul className="mt-5 space-y-3">
        {RULES.map((r, i) => (
          <li key={r} className="flex items-center justify-between gap-3">
            <span className="text-[14px]">{r}</span>
            <button
              type="button"
              role="switch"
              aria-checked={on[i]}
              aria-label={r}
              onClick={() => setOn((s) => s.map((v, j) => (j === i ? !v : v)))}
              className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${on[i] ? "bg-accent" : "bg-surface-2"}`}
            >
              <motion.span
                className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow"
                animate={{ x: on[i] ? 16 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-3 motion-reduce:animate-none">
        {row.map((t, i) => (
          <span
            key={i}
            aria-hidden={i >= items.length}
            className="rounded-full border border-line bg-bg px-4 py-2 text-sm whitespace-nowrap"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
