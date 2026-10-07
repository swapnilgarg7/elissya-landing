import { Plus } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/Logo";
import { InboxDemo } from "@/components/demo/InboxDemo";
import { Bento } from "@/components/sections/Bento";
import { Hero } from "@/components/sections/Hero";
import { WaitlistProvider, WantItButton } from "@/components/waitlist/WaitlistProvider";

const STATS = [
  { value: "1,284", label: "conversations" },
  { value: "78%", label: "handled by Elissya" },
  { value: "87", label: "new leads" },
  { value: "23", label: "brand opportunities" },
];

const FAQ = [
  {
    q: "Is it safe for my Instagram account?",
    a: "Elissya connects through Meta's official Instagram API, the same way approved business tools do. You never share your password, and you can disconnect any time.",
  },
  {
    q: "Will my followers know it's AI?",
    a: "You decide. Elissya replies in your style, and anything sensitive, personal or money-related goes to you instead of being answered.",
  },
  {
    q: "What do I need to get started?",
    a: "An Instagram Creator or Business account. If you're on a personal account, switching takes about a minute and we'll walk you through it.",
  },
  {
    q: "How much will it cost?",
    a: "Pricing isn't final yet. We're setting it with our first group of creators, and people on the waitlist hear about it first.",
  },
];

export default function Home() {
  return (
    <WaitlistProvider>
      <div className="grain">
        <header className="sticky top-0 z-40 border-b border-transparent bg-bg/75 backdrop-blur-md">
          <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 md:px-8">
            <a href="#" aria-label="Elissya home">
              <Logo />
            </a>
            <nav className="flex items-center gap-6">
              <a href="#demo" className="hidden text-sm text-muted transition-colors hover:text-ink sm:block">
                Demo
              </a>
              <a href="#faq" className="hidden text-sm text-muted transition-colors hover:text-ink sm:block">
                FAQ
              </a>
              <WantItButton from="nav" size="sm" />
            </nav>
          </div>
        </header>

        <main>
          <Hero />

          <section id="demo" className="mx-auto max-w-[1240px] scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
            <h2 className="max-w-[18ch] font-display text-[40px] leading-[1.02] font-semibold tracking-[-0.03em] md:text-[56px]">
              Your inbox, sorted by what matters.
            </h2>
            <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-muted">
              A working preview with sample data from a travel creator&apos;s week. Click around, then hit Take over.
            </p>
            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="border-l-2 border-accent/60 pl-4">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-[40px] leading-none font-semibold tracking-tight md:text-5xl">{s.value}</dd>
                  <dd className="mt-2 text-sm text-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-10">
              <InboxDemo />
            </div>
          </section>

          <section className="mx-auto max-w-[1240px] px-5 py-20 md:px-8 md:py-24">
            <h2 className="mb-10 max-w-[20ch] font-display text-[40px] leading-[1.02] font-semibold tracking-[-0.03em] md:text-[56px]">
              Fewer repetitive replies. More real conversations.
            </h2>
            <Bento />
          </section>

          <section id="faq" className="mx-auto grid max-w-[1240px] scroll-mt-20 gap-10 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 className="font-display text-[40px] leading-[1.02] font-semibold tracking-[-0.03em] md:text-[56px]">
              Fair questions.
            </h2>
            <div className="divide-y divide-line border-y border-line">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <Plus size={18} weight="bold" className="shrink-0 text-muted transition-transform duration-300 group-open:rotate-45" />
                  </summary>
                  <p className="max-w-[60ch] pb-6 text-[16px] leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="px-5 pt-16 pb-28 text-center md:px-8 md:pt-24 md:pb-36">
            <h2 className="mx-auto max-w-[17ch] font-display text-[44px] leading-[1] font-semibold tracking-[-0.035em] sm:text-[64px] lg:text-[80px]">
              Your DMs are a business. Let her run the busywork.
            </h2>
            <p className="mx-auto mt-6 max-w-[46ch] text-[17px] leading-relaxed text-muted">
              Early access opens in small batches, busiest inboxes first.
            </p>
            <div className="mt-10">
              <WantItButton from="final" size="lg" />
            </div>
          </section>
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
            <Logo size={22} />
            <p>We only use your details to send your invite. No spam, ever.</p>
            <p>&copy; 2026 Elissya</p>
          </div>
        </footer>
      </div>
    </WaitlistProvider>
  );
}
