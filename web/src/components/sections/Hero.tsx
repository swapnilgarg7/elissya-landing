import { HeroPhone } from "@/components/demo/HeroPhone";
import { WantItButton } from "@/components/waitlist/WaitlistProvider";

// Entrance animations are pure CSS (.rise in globals.css) so the hero is
// visible before JavaScript loads, which matters on slow in-app browsers.
const rise = (delayMs: number) => ({ style: { animationDelay: `${delayMs}ms` } });

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-14 px-5 pt-10 pb-20 md:px-8 lg:min-h-[calc(100dvh-72px)] lg:grid-cols-[1.2fr_0.8fr] lg:gap-8 lg:pt-6 lg:pb-16">
      <div>
        <h1 className="font-display font-semibold tracking-[-0.035em]">
          <span {...rise(50)} className="rise flex items-center gap-[0.18em] text-[50px] leading-[0.95] sm:text-[84px] lg:text-[88px] xl:text-[100px]">
            Meet
            <picture className="inline-block shrink-0 translate-y-[0.03em]">
              <source srcSet="/brand/mark-dark.png" media="(prefers-color-scheme: dark)" />
              <img src="/brand/mark-light.png" alt="" className="size-[0.74em] max-w-none" width={88} height={88} />
            </picture>
            Elissya.
          </span>
          <span
            {...rise(180)}
            className="rise mt-4 block max-w-[16ch] text-[32px] leading-[1.05] tracking-[-0.025em] text-muted sm:text-[40px] lg:text-[46px]"
          >
            Your agentic social media manager.
          </span>
        </h1>
        <p {...rise(300)} className="rise mt-6 max-w-[44ch] text-[17px] leading-relaxed text-muted sm:text-lg">
          She answers your Instagram DMs in your voice, sorts fans from brand deals, and hands you what matters.
        </p>
        <div {...rise(420)} className="rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
          <WantItButton from="hero" size="lg" />
          <a
            href="#demo"
            className="text-[15px] font-medium text-ink underline decoration-line decoration-2 underline-offset-[6px] transition-colors hover:decoration-accent"
          >
            Watch her work
          </a>
        </div>
      </div>

      <div {...rise(250)} className="rise relative justify-self-center lg:justify-self-end lg:pr-6"
      >
        {/* The brand gradient from the logo, used once, as the phone's aura. */}
        <div
          aria-hidden
          className="absolute inset-x-[-12%] top-[18%] bottom-[8%] rounded-full opacity-35 blur-[70px] dark:opacity-25"
          style={{ background: "var(--brand-gradient)" }}
        />
        <HeroPhone />
      </div>
    </section>
  );
}
