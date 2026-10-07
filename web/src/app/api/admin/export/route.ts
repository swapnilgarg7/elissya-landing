import { isAdmin } from "@/lib/admin-auth";
import { store } from "@/lib/store";

const COLUMNS = [
  "created_at",
  "email",
  "instagram",
  "creator_type",
  "followers",
  "dms_per_day",
  "whatsapp",
  "step",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "referrer",
  "ref",
  "country",
] as const;

function cell(v: unknown) {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // keep spreadsheet apps from evaluating it
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const rows = await store.listSignups();
  const csv = [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(","))].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="elissya-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
