"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import {
  CaretLeft,
  Camera,
  Microphone,
  Phone,
  Sparkle,
  VideoCamera,
  Image as ImageIcon,
  AddressBook,
  Eye,
  Target,
} from "@phosphor-icons/react";

// The creator's own Instagram inbox. Blue bubbles are sent by Elissya on the
// creator's behalf; grey ones are the follower.
type Msg =
  | { kind: "them"; text: string; storyReply?: boolean; image?: string }
  | { kind: "me"; text: string }
  | { kind: "typing" };

const THREAD: { msg: Msg; wait: number; note?: Note }[] = [
  {
    msg: { kind: "them", storyReply: true, text: "omg GOA next month!! first trip w my girls. is south goa better for first timers?" },
    wait: 1400,
    note: { icon: "target", title: "Intent", body: "Travel planning, Goa" },
  },
  { msg: { kind: "typing" }, wait: 1500 },
  {
    msg: {
      kind: "me",
      text: "okay first goa trip is SUCH a vibe 😭 south is perfect for that. 2 nights in palolem, then agonda if u want it quieter. beach shacks or cafes?",
    },
    wait: 2600,
    note: { icon: "sparkle", title: "Replied in your voice", body: "6 seconds after her DM" },
  },
  {
    msg: { kind: "them", image: "/demo/beach.jpg", text: "shacks 100%. my sis went last year, is this palolem??" },
    wait: 1900,
  },
  { msg: { kind: "typing" }, wait: 1500, note: { icon: "eye", title: "Read the photo", body: "Palolem beach, South Goa" } },
  {
    msg: { kind: "me", text: "wait YES that's palolem 😍 the blue shack on the left does the best prawn thali. sending u my south goa list rn" },
    wait: 2400,
  },
  {
    msg: { kind: "them", text: "ur literally the best 🫶" },
    wait: 4200,
    note: { icon: "book", title: "Saved to your CRM", body: "@ananya.goes is now Engaged" },
  },
];

type Note = { icon: "target" | "sparkle" | "eye" | "book"; title: string; body: string };

const NOTE_ICONS = { target: Target, sparkle: Sparkle, eye: Eye, book: AddressBook };
const STORY_MS = 2600;

export function HeroPhone() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"story" | "thread">(reduce ? "thread" : "story");
  const [count, setCount] = useState(reduce ? THREAD.length : 0);
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let at = 0;
    timers.push(
      setTimeout(() => {
        setPhase("story");
        setCount(0);
      }, 0),
    );
    at += STORY_MS;
    timers.push(setTimeout(() => setPhase("thread"), at));
    at += 500;
    THREAD.forEach((step, i) => {
      timers.push(setTimeout(() => setCount(i + 1), at));
      at += step.wait;
    });
    timers.push(setTimeout(() => setLoop((l) => l + 1), at));
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce, loop]);

  // A typing bubble is only shown while it's the newest item.
  const visible = THREAD.slice(0, count).filter((s, i) => s.msg.kind !== "typing" || i === count - 1);
  const notes = THREAD.slice(0, count).flatMap((s) => (s.note ? [s.note] : []));

  return (
    <div ref={ref} className="relative mx-auto w-fit">
      <Notes notes={notes} />
      <div className="relative h-[600px] w-[296px] rounded-[48px] border border-line bg-[#0b0b0a] p-[9px] shadow-soft sm:h-[640px] sm:w-[316px]">
        <div className="relative h-full w-full overflow-hidden rounded-[40px] bg-white text-[#111] dark:bg-[#000] dark:text-white">
          <div className="absolute top-2.5 left-1/2 z-30 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
          <AnimatePresence initial={false} mode="popLayout">
            {phase === "story" ? (
              <Story key={`story-${loop}`} />
            ) : (
              <motion.div
                key={`thread-${loop}`}
                className="absolute inset-0 flex flex-col"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <ThreadHeader />
                <div className="flex flex-1 flex-col justify-end gap-1.5 overflow-hidden px-3 pb-2">
                  <AnimatePresence initial={false}>
                    {visible.map((s) => (
                      <Bubble key={`${loop}-${THREAD.indexOf(s)}`} msg={s.msg} />
                    ))}
                  </AnimatePresence>
                </div>
                <Composer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Story() {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.45 }}
    >
      <Image src="/demo/story.jpg" alt="Wanderbuddy's Instagram story: a yellow scooter on a coastal road in Goa at sunset" fill sizes="320px" className="object-cover" priority />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
      <div className="absolute inset-x-3 top-11 h-[2px] overflow-hidden rounded-full bg-white/35">
        <motion.div
          className="h-full origin-left bg-white"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: STORY_MS / 1000, ease: "linear" }}
        />
      </div>
      <div className="absolute top-14 left-3 flex items-center gap-2 text-white">
        <Image src="/demo/av-wanderbuddy.jpg" alt="" width={28} height={28} className="rounded-full ring-1 ring-white/60" />
        <span className="text-[13px] font-semibold">wanderbuddy</span>
        <span className="text-[13px] text-white/70">2h</span>
      </div>
      <motion.div
        className="absolute top-[38%] left-1/2 w-[78%] -translate-x-1/2 -rotate-3 rounded-2xl bg-white px-4 py-3 text-center text-[#111] shadow-lg"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 180, damping: 16 }}
      >
        <p className="font-display text-[19px] leading-tight font-bold">where are you travelling next?</p>
        <p className="mt-1 text-[13px] text-[#555]">DM me, I&apos;ll send my list ✈️</p>
      </motion.div>
      <div className="absolute inset-x-3 bottom-5 flex items-center gap-2">
        <div className="h-10 flex-1 rounded-full border border-white/60 px-4 text-[13px] leading-10 text-white/85">
          Send message
        </div>
      </div>
    </motion.div>
  );
}

function ThreadHeader() {
  return (
    <div className="flex items-center gap-2.5 border-b border-black/5 px-3 pt-12 pb-2.5 dark:border-white/10">
      <CaretLeft size={22} weight="bold" />
      <Image src="/demo/av-ananya.jpg" alt="" width={32} height={32} className="rounded-full" />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[14px] font-semibold">Ananya</p>
        <p className="text-[11px] text-[#777]">ananya.goes</p>
      </div>
      <Phone size={22} />
      <VideoCamera size={22} />
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const enter = {
    initial: { opacity: 0, y: 14, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, transition: { duration: 0.12 } },
    transition: { type: "spring" as const, stiffness: 320, damping: 26 },
  };

  if (msg.kind === "typing") {
    return (
      <motion.div layout {...enter} className="flex items-end gap-1.5 self-end">
        <span className="mb-1 text-[10px] font-medium text-accent">Elissya is typing</span>
        <div className="flex gap-1 rounded-[18px] bg-bubble-out px-3.5 py-3">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-1.5 rounded-full bg-white/90"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (msg.kind === "me") {
    return (
      <motion.div layout {...enter} className="flex max-w-[82%] flex-col items-end self-end">
        <p className="rounded-[18px] bg-bubble-out px-3 py-2 text-[13px] leading-snug text-white">{msg.text}</p>
        <span className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-accent">
          <Sparkle size={10} weight="fill" />
          Sent by Elissya
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div layout {...enter} className="flex max-w-[82%] items-end gap-1.5 self-start">
      <Image src="/demo/av-ananya.jpg" alt="" width={22} height={22} className="mb-0.5 rounded-full" />
      <div className="flex flex-col items-start gap-1">
        {msg.storyReply && (
          <div className="flex items-center gap-2 border-l-2 border-black/15 pl-2 dark:border-white/20">
            <div className="relative h-12 w-7 overflow-hidden rounded-md">
              <Image src="/demo/story.jpg" alt="" fill sizes="28px" className="object-cover" />
            </div>
            <span className="text-[10px] text-[#777]">Replied to your story</span>
          </div>
        )}
        {msg.image && (
          <div className="relative h-[150px] w-[120px] overflow-hidden rounded-[16px]">
            <Image src={msg.image} alt="Photo Ananya sent: Palolem beach with fishing boats and beach shacks" fill sizes="120px" className="object-cover" />
          </div>
        )}
        <p className="rounded-[18px] bg-bubble-in px-3 py-2 text-[13px] leading-snug">{msg.text}</p>
      </div>
    </motion.div>
  );
}

function Composer() {
  return (
    <div className="flex items-center gap-2 px-3 pt-1 pb-5">
      <div className="grid size-8 place-items-center rounded-full bg-bubble-out text-white">
        <Camera size={16} weight="fill" />
      </div>
      <div className="flex h-9 flex-1 items-center rounded-full border border-black/10 px-3 text-[13px] text-[#888] dark:border-white/15">
        Message...
      </div>
      <Microphone size={20} />
      <ImageIcon size={20} />
    </div>
  );
}

function Notes({ notes }: { notes: Note[] }) {
  return (
    <div className="pointer-events-none absolute bottom-20 -left-48 z-10 hidden w-56 flex-col gap-3 xl:flex">
      <AnimatePresence>
        {notes.map((n, i) => {
          const Icon = NOTE_ICONS[n.icon];
          return (
            <motion.div
              key={n.title}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.95 }}
              animate={{ opacity: 1, x: i % 2 ? 18 : 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="flex items-start gap-3 rounded-2xl border border-line bg-surface/90 p-3 shadow-soft backdrop-blur"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink">
                <Icon size={16} weight="bold" />
              </span>
              <span className="leading-tight">
                <span className="block text-[13px] font-semibold">{n.title}</span>
                <span className="mt-0.5 block text-[12px] text-muted">{n.body}</span>
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
