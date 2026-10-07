"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import {
  Briefcase,
  CheckCircle,
  HandPalm,
  Prohibit,
  Sparkle,
  Tray,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { track } from "@/lib/analytics";

type Folder = "all" | "needs" | "brand" | "handled" | "spam";

type Convo = {
  id: string;
  name: string;
  handle: string;
  avatar: string | null;
  folders: Folder[];
  preview: string;
  time: string;
  badge: { label: string; tone: "accent" | "ok" | "muted" };
};

const CONVOS: Convo[] = [
  {
    id: "kova",
    name: "Rahul Mehta",
    handle: "kova.travelgear",
    avatar: "/demo/av-rahul.jpg",
    folders: ["all", "needs", "brand"],
    preview: "Hi! I'm from Kova Travel Gear. We'd love to collab on a few UGC reels",
    time: "2m",
    badge: { label: "Brand deal", tone: "accent" },
  },
  {
    id: "ananya",
    name: "Ananya",
    handle: "ananya.goes",
    avatar: "/demo/av-ananya.jpg",
    folders: ["all", "handled"],
    preview: "ur literally the best 🫶",
    time: "4m",
    badge: { label: "Elissya", tone: "ok" },
  },
  {
    id: "meher",
    name: "Meher Kaur",
    handle: "meherwrites",
    avatar: "/demo/av-meher.jpg",
    folders: ["all", "needs"],
    preview: "can I use your Goa list on my blog? happy to credit you!",
    time: "26m",
    badge: { label: "Needs you", tone: "accent" },
  },
  {
    id: "kabir",
    name: "Kabir Sethi",
    handle: "kabir.frames",
    avatar: "/demo/av-kabir.jpg",
    folders: ["all", "handled"],
    preview: "bro what do u shoot ur reels on",
    time: "41m",
    badge: { label: "Elissya", tone: "ok" },
  },
  {
    id: "spam",
    name: "crypto.signals.vip",
    handle: "crypto.signals.vip",
    avatar: null,
    folders: ["all", "spam"],
    preview: "earn 5x daily, guaranteed. click the link in bio",
    time: "1h",
    badge: { label: "Spam", tone: "muted" },
  },
];

const FOLDERS: { id: Folder; label: string; count: string; Icon: typeof Tray }[] = [
  { id: "all", label: "All", count: "1,284", Icon: Tray },
  { id: "needs", label: "Needs you", count: "2", Icon: WarningCircle },
  { id: "brand", label: "Brand deals", count: "1", Icon: Briefcase },
  { id: "handled", label: "Handled", count: "214", Icon: Sparkle },
  { id: "spam", label: "Spam", count: "31", Icon: Prohibit },
];

const CYCLE = ["kova", "ananya", "meher", "kabir", "spam"];

export function InboxDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [folder, setFolder] = useState<Folder>("all");
  const [selected, setSelected] = useState("kova");
  const [touched, setTouched] = useState(false);
  const [takenOver, setTakenOver] = useState(false);

  useEffect(() => {
    if (inView) track("demo_view", { once: true });
  }, [inView]);

  // Walks through conversations on its own until the visitor clicks something.
  useEffect(() => {
    if (!inView || touched || reduce) return;
    const t = setInterval(() => {
      setSelected((cur) => CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length]);
    }, 4200);
    return () => clearInterval(t);
  }, [inView, touched, reduce]);

  const list = CONVOS.filter((c) => c.folders.includes(folder));

  function pickFolder(f: Folder) {
    setTouched(true);
    setFolder(f);
    const first = CONVOS.find((c) => c.folders.includes(f));
    if (first) setSelected(first.id);
  }

  return (
    <div ref={ref} className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-soft">
      <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[190px_minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Folders */}
        <nav
          aria-label="Inbox folders"
          className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line p-3 md:flex-col md:border-r md:border-b-0"
        >
          {FOLDERS.map(({ id, label, count, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => pickFolder(id)}
              aria-pressed={folder === id}
              className={`flex shrink-0 items-center gap-2.5 rounded-full px-3.5 py-2 text-left text-sm transition-colors md:rounded-xl ${
                folder === id ? "bg-ink text-bg" : "text-muted hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <Icon size={16} weight={folder === id ? "fill" : "regular"} />
              <span className="flex-1 whitespace-nowrap">{label}</span>
              <span className={`font-mono text-[11px] ${folder === id ? "text-bg/70" : "text-muted"}`}>{count}</span>
            </button>
          ))}
        </nav>

        {/* Conversation list */}
        <ul className="divide-y divide-line border-line lg:border-r">
          {list.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  setTouched(true);
                  setSelected(c.id);
                }}
                className={`relative flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors ${
                  selected === c.id ? "bg-accent-soft/60" : "hover:bg-surface-2/60"
                }`}
              >
                {selected === c.id && (
                  <motion.span layoutId="sel" className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent" />
                )}
                <Avatar src={c.avatar} name={c.name} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{c.name}</span>
                    <span className="ml-auto shrink-0 text-[11px] text-muted">{c.time}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-muted">{c.preview}</span>
                  <Badge {...c.badge} />
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Detail */}
        <div className="border-t border-line p-5 md:col-span-2 lg:col-span-1 lg:border-t-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected + (takenOver ? "-taken" : "")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Detail
                id={selected}
                takenOver={takenOver}
                onTakeOver={() => {
                  setTouched(true);
                  setTakenOver(true);
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  if (!src) {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
        <UserCircle size={22} />
      </span>
    );
  }
  return <Image src={src} alt={name} width={40} height={40} className="size-10 shrink-0 rounded-full object-cover" />;
}

function Badge({ label, tone }: Convo["badge"]) {
  const tones = {
    accent: "bg-accent-soft text-accent-ink",
    ok: "bg-surface-2 text-ink",
    muted: "bg-surface-2 text-muted",
  };
  return (
    <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {tone === "ok" && <Sparkle size={10} weight="fill" className="text-accent" />}
      {label}
    </span>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-[13px] text-muted">{k}</dt>
      <dd className="text-right text-[13px] font-medium">{v}</dd>
    </div>
  );
}

function Header({ id }: { id: string }) {
  const c = CONVOS.find((x) => x.id === id)!;
  return (
    <div className="flex items-center gap-3">
      <Avatar src={c.avatar} name={c.name} />
      <div className="min-w-0">
        <p className="truncate font-semibold">{c.name}</p>
        <p className="text-[13px] text-muted">@{c.handle}</p>
      </div>
    </div>
  );
}

function Summary({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-2xl bg-bg p-4">
      <p className="flex items-center gap-1.5 text-[12px] font-medium text-accent-ink">
        <Sparkle size={12} weight="fill" />
        Elissya&apos;s summary
      </p>
      <p className="mt-1.5 text-[14px] leading-relaxed">{children}</p>
    </div>
  );
}

function Detail({ id, takenOver, onTakeOver }: { id: string; takenOver: boolean; onTakeOver: () => void }) {
  if (id === "kova") {
    return (
      <div>
        <Header id={id} />
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-accent/25 bg-accent-soft/70 p-4">
          <HandPalm size={20} weight="fill" className="mt-0.5 shrink-0 text-accent-ink" />
          <p className="text-[14px] leading-snug">
            {takenOver ? (
              <>You&apos;re in the chat. Elissya drafted a reply with your rate card, ready when you are.</>
            ) : (
              <>
                <span className="font-semibold">Brand opportunity.</span> Elissya paused this chat. Brand deals always come
                to you.
              </>
            )}
          </p>
        </div>
        <dl className="mt-3 divide-y divide-line">
          <Row k="Brand" v="Kova Travel Gear" />
          <Row k="Ask" v="3 UGC reels + 1 story" />
          <Row k="Budget mentioned" v="$1,500" />
          <Row k="Timeline" v="Shoot in November" />
          <Row k="Lead score" v={<span className="text-accent-ink">86, very high</span>} />
        </dl>
        {takenOver ? (
          <div className="mt-4 rounded-2xl bg-bg p-4 text-[14px] leading-relaxed">
            <p className="text-[12px] font-medium text-muted">Draft</p>
            <p className="mt-1">
              Hey Rahul! Love Kova&apos;s stuff. Happy to do this. For 3 reels + a story my rate is $1,800, usage rights for
              3 months included. Can you share the brief?
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={onTakeOver}
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-ink text-sm font-medium text-bg transition-[transform,background-color] hover:bg-cta-hover hover:text-cta-hover-fg active:scale-[0.98]"
          >
            Take over
          </button>
        )}
      </div>
    );
  }

  if (id === "ananya") {
    return (
      <div>
        <Header id={id} />
        <dl className="mt-4 divide-y divide-line">
          <Row k="Intent" v="Travel planning" />
          <Row k="Destination" v="South Goa" />
          <Row k="Came from" v="Story: where are you travelling next?" />
          <Row k="Stage" v="Engaged" />
          <Row
            k="AI"
            v={
              <span className="inline-flex items-center gap-1 text-accent-ink">
                <Sparkle size={12} weight="fill" /> Handling
              </span>
            }
          />
        </dl>
        <Summary>
          First Goa trip with friends next month. Prefers beach shacks over cafes. Sent her your South Goa list; she sent a
          Palolem photo from her sister.
        </Summary>
      </div>
    );
  }

  if (id === "meher") {
    return (
      <div>
        <Header id={id} />
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-bg p-4">
          <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-accent" />
          <p className="text-[14px] leading-snug">
            Escalated by your rule: <span className="font-medium">&ldquo;Anyone asking to reuse my content comes to me.&rdquo;</span>
          </p>
        </div>
        <Summary>
          Travel blogger, 8k followers. Wants to republish your Goa list with credit. Elissya told her you&apos;ll reply
          personally today.
        </Summary>
      </div>
    );
  }

  if (id === "kabir") {
    return (
      <div>
        <Header id={id} />
        <dl className="mt-4 divide-y divide-line">
          <Row k="Intent" v="Gear question" />
          <Row k="Answered from" v="Your notes: My kit" />
          <Row k="Stage" v="Follower" />
          <Row
            k="AI"
            v={
              <span className="inline-flex items-center gap-1">
                <CheckCircle size={13} weight="fill" className="text-accent" /> Resolved
              </span>
            }
          />
        </dl>
        <Summary>
          Asked what you shoot reels on. Elissya shared your phone and mic setup from your kit notes and the link you keep
          for it. He asked the same thing 3 other people did this week.
        </Summary>
      </div>
    );
  }

  return (
    <div>
      <Header id={id} />
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-bg p-4">
        <Prohibit size={20} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-[14px] leading-snug">
          Archived automatically. Never replied to. You can review spam any time, nothing gets deleted.
        </p>
      </div>
    </div>
  );
}
