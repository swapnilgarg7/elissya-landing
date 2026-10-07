import { ADMIN_COOKIE, passwordMatches, sessionToken } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const url = new URL("/admin", req.url);

  if (!passwordMatches(password)) {
    url.searchParams.set("error", "1");
    return Response.redirect(url, 303);
  }

  const res = new Response(null, { status: 303, headers: { Location: url.pathname } });
  const secure = url.protocol === "https:" ? "; Secure" : "";
  res.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${sessionToken()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${secure}`,
  );
  return res;
}
