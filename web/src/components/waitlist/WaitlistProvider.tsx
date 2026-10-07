"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { pixel, track } from "@/lib/analytics";
import { WaitlistSheet } from "./WaitlistSheet";

type Ctx = { open: (from: string) => void };

const WaitlistContext = createContext<Ctx>({ open: () => undefined });

export function useWaitlist() {
  return useContext(WaitlistContext);
}

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [opens, setOpens] = useState(0);

  useEffect(() => {
    track("page_view", { once: true });
  }, []);

  const open = useCallback((from: string) => {
    track("cta_click", { detail: from });
    pixel("trackCustom", "WaitlistIntent", { placement: from });
    setOpens((n) => n + 1);
    setOpen(true);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <WaitlistContext.Provider value={{ open }}>
        {children}
        <WaitlistSheet key={opens} open={isOpen} onClose={() => setOpen(false)} />
      </WaitlistContext.Provider>
    </MotionConfig>
  );
}

export function WantItButton({
  from,
  className = "",
  size = "md",
}: {
  from: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { open } = useWaitlist();
  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-12 px-6 text-[15px]",
    lg: "h-14 px-8 text-base",
  };
  return (
    <button
      type="button"
      onClick={() => open(from)}
      className={`group inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-ink font-medium text-bg transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px hover:bg-cta-hover hover:text-cta-hover-fg active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${sizes[size]} ${className}`}
    >
      I want it
      <ArrowRight
        aria-hidden
        size={size === "sm" ? 14 : 17}
        weight="bold"
        className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5"
      />
    </button>
  );
}
