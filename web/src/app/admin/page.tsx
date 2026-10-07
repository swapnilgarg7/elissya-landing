import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { isAdmin } from "@/lib/admin-auth";
import { computeFunnel, filterSignups, type Range } from "@/lib/funnel";
import { sheetsConfigured, store } from "@/lib/store";

// Private, per-request dashboard: rendering on every request is intended.
export const instant = false;

export const metadata: Metadata = { title: "Waitlist dashboard", robots: { index: false, follow: false } };

const RANGES: { id: Range; label: string }[] = [
  { id: "24h", label: "24 hours" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "all", label: "All time" },
];

const pct = (x: number | null) => (x === null ? "" : `${(x * 100).toFixed(x < 0.1 && x > 0 ? 1 : 0)}%`);

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  if (!(await isAdmin())) {
    return <Login error={sp.error === "1"} configured={Boolean(process.env.ADMIN_PASSWORD)} />;
  }

  const range = (RANGES.find((r) => r.id === sp.range)?.id ?? "7d") as Range;

  let error: string | null = null;
  let events: Awaited<ReturnType<typeof store.listEvents>> = { rows: [], truncated: false };
  let signupRows: Awaited<ReturnType<typeof store.listSignups>> = [];
  try {
    [events, signupRows] = await Promise.all([store.listEvents(), store.listSignups()]);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const f = computeFunnel(events.rows, range);
  const signups = filterSignups(signupRows, range);
  const finished = signups.filter((s) => s.step === "complete").length;

  return (
    <div className="min-h-[100dvh] bg-bg">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5 md:px-8">
          <Logo size={24} />
          <form action="/api/admin/logout" method="post">
            <button className="text-sm text-muted hover:text-ink">Log out</button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight">Waitlist funnel</h1>
            <p className="mt-1 text-sm text-muted">
              Unique visitors per step. Data source: {sheetsConfigured ? "Google Sheets" : "local file (dev only)"}
              {events.truncated ? ", showing the most recent 50,000 events" : ""}.
            </p>
          </div>
          <nav className="flex gap-1 rounded-full border border-line bg-surface p-1" aria-label="Time range">
            {RANGES.map((r) => (
              <a
                key={r.id}
                href={`/admin?range=${r.id}`}
                aria-current={r.id === range ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm ${r.id === range ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}
              >
                {r.label}
              </a>
            ))}
          </nav>
        </div>

        {error && (
          <p role="alert" className="mt-6 rounded-2xl border border-accent/30 bg-accent-soft p-4 text-sm">
            Couldn&apos;t load data: {error}
          </p>
        )}

        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Tile label="Visitors" value={f.stages[0].n} />
          <Tile label="Clicked “I want it”" value={f.stages[2].n} sub={pct(f.stages[2].ofTop) + " of visitors"} />
          <Tile label="Gave their email" value={f.stages[3].n} sub={pct(f.stages[3].ofTop) + " of visitors"} />
          <Tile
            label="Clicked but left"
            value={Math.max(0, f.stages[2].n - f.stages[3].n)}
            sub={f.stages[2].n ? `${pct(1 - f.stages[3].n / f.stages[2].n)} of clickers` : "no clicks yet"}
          />
        </section>

        <section className="mt-6 rounded-[24px] border border-line bg-surface p-6 md:p-8">
          <h2 className="font-semibold">Where people drop off</h2>
          <p className="mt-1 text-sm text-muted">Bar length is share of all visitors. The right column is conversion from the step above.</p>
          <ol className="mt-6 space-y-3">
            {f.stages.map((s, i) => (
              <li key={s.event} className="group relative grid grid-cols-[150px_1fr_72px] items-center gap-4 md:grid-cols-[190px_1fr_90px]">
                <span className="text-sm">{s.label}</span>
                <span className="relative h-9">
                  <span
                    className="absolute inset-y-0 left-0 rounded-r-[4px] bg-accent transition-opacity group-hover:opacity-85"
                    style={{ width: `${Math.max(s.ofTop * 100, s.n ? 0.8 : 0)}%` }}
                  />
                  <span
                    className={`absolute inset-y-0 flex items-center font-mono text-[13px] font-medium ${
                      s.ofTop > 0.15 ? "text-white dark:text-bg" : "text-ink"
                    }`}
                    style={{ left: s.ofTop > 0.15 ? "10px" : `calc(${s.ofTop * 100}% + 8px)` }}
                  >
                    {s.n.toLocaleString("en-IN")}
                  </span>
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute -top-10 left-0 z-10 hidden rounded-lg border border-line bg-surface px-3 py-1.5 text-xs whitespace-nowrap shadow-soft group-hover:block"
                  >
                    {s.n.toLocaleString("en-IN")} visitors, {pct(s.ofTop)} of all
                    {s.ofPrev !== null ? `, ${pct(s.ofPrev)} of the step above` : ""}
                  </span>
                </span>
                <span className="text-right font-mono text-[13px] text-muted">{i === 0 ? "" : pct(s.ofPrev)}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 border-t border-line pt-5">
            <h3 className="text-sm font-semibold">Closed the form at</h3>
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              {f.abandon.map((a) => (
                <span key={a.step}>
                  <span className="text-muted">{{ email: "Email step", instagram: "Instagram step", details: "Details step" }[a.step]}:</span>{" "}
                  <span className="font-mono">{a.n}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="overflow-x-auto rounded-[24px] border border-line bg-surface p-6">
            <h2 className="font-semibold">By source</h2>
            <p className="mt-1 text-sm text-muted">First touch: utm_source, else the referring site.</p>
            <table className="mt-4 w-full min-w-[520px] text-sm">
              <thead className="text-left text-muted">
                <tr>
                  <th className="py-2 font-normal">Source</th>
                  <th className="py-2 text-right font-normal">Visitors</th>
                  <th className="py-2 text-right font-normal">Clicked</th>
                  <th className="py-2 text-right font-normal">Email</th>
                  <th className="py-2 text-right font-normal">Finished</th>
                  <th className="py-2 text-right font-normal">Email rate</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[13px]">
                {f.sources.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center font-sans text-muted">
                      No visits in this range yet.
                    </td>
                  </tr>
                )}
                {f.sources.map((s) => (
                  <tr key={s.source} className="border-t border-line">
                    <td className="py-2.5 font-sans">{s.source}</td>
                    <td className="py-2.5 text-right">{s.visitors}</td>
                    <td className="py-2.5 text-right">{s.clicks}</td>
                    <td className="py-2.5 text-right">{s.emails}</td>
                    <td className="py-2.5 text-right">{s.finished}</td>
                    <td className="py-2.5 text-right">{pct(s.conversion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-[24px] border border-line bg-surface p-6">
            <h2 className="font-semibold">Devices</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {f.devices.length === 0 && <li className="text-muted">No visits yet.</li>}
              {f.devices.map((d) => (
                <li key={d.device} className="flex justify-between">
                  <span>{d.device}</span>
                  <span className="font-mono">{d.n}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-6 overflow-x-auto rounded-[24px] border border-line bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Signups</h2>
              <p className="mt-1 text-sm text-muted">
                {signups.length} in range, {finished} finished all steps.
              </p>
            </div>
            <a href="/api/admin/export" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg hover:bg-cta-hover hover:text-cta-hover-fg">
              Download CSV
            </a>
          </div>
          <table className="mt-4 w-full min-w-[860px] text-sm">
            <thead className="text-left text-muted">
              <tr>
                {["When", "Email", "Instagram", "Type", "Followers", "DMs/day", "WhatsApp", "Got to", "Source"].map((h) => (
                  <th key={h} className="py-2 pr-4 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {signups.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted">
                    No signups in this range yet. Share the page and they&apos;ll show up here.
                  </td>
                </tr>
              )}
              {signups.slice(0, 300).map((s) => (
                <tr key={s.email} className="border-t border-line">
                  <td className="py-2.5 pr-4 whitespace-nowrap text-muted">{new Date(s.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="py-2.5 pr-4">{s.email}</td>
                  <td className="py-2.5 pr-4">
                    {s.instagram ? (
                      <a className="underline decoration-line underline-offset-4 hover:decoration-accent" href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noopener noreferrer">
                        @{s.instagram}
                      </a>
                    ) : (
                      <span className="text-muted">none</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">{s.creator_type}</td>
                  <td className="py-2.5 pr-4">{s.followers}</td>
                  <td className="py-2.5 pr-4">{s.dms_per_day}</td>
                  <td className="py-2.5 pr-4 font-mono text-[13px]">{s.whatsapp}</td>
                  <td className="py-2.5 pr-4">{{ email: "Email", instagram: "Instagram", complete: "Finished" }[s.step] ?? s.step}</td>
                  <td className="py-2.5 pr-4 text-muted">{s.utm_source || "direct"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-[24px] border border-line bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl font-semibold tracking-tight">{value.toLocaleString("en-IN")}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function Login({ error, configured }: { error: boolean; configured: boolean }) {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-bg px-5">
      <form action="/api/admin/login" method="post" className="w-full max-w-sm rounded-[24px] border border-line bg-surface p-7 shadow-soft">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">Waitlist dashboard</h1>
        {!configured ? (
          <p className="mt-3 text-sm text-muted">Set ADMIN_PASSWORD in your environment to enable this page.</p>
        ) : (
          <>
            <label htmlFor="pw" className="mt-5 block text-sm font-medium">
              Password
            </label>
            <input
              id="pw"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 h-12 w-full rounded-full border border-line bg-bg px-5 outline-none focus:border-ink"
            />
            {error && <p role="alert" className="mt-2 text-sm text-accent-ink">Wrong password.</p>}
            <button className="mt-4 h-12 w-full rounded-full bg-ink font-medium text-bg hover:bg-cta-hover hover:text-cta-hover-fg">
              Open dashboard
            </button>
          </>
        )}
      </form>
    </div>
  );
}
