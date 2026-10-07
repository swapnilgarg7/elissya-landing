import { store, type SignupPatch } from "@/lib/store";
import {
  CREATOR_TYPES,
  DM_RANGES,
  FOLLOWER_RANGES,
  normalizeEmail,
  normalizeHandle,
  normalizePhone,
  oneOf,
  readJson,
  sanitizeAttribution,
  sanitizeId,
} from "@/lib/validation";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return Response.json({ ok: false, error: "Bad request" }, { status: 400 });

  // Honeypot: real people never see or fill this field.
  if (typeof body.website === "string" && body.website) {
    return Response.json({ ok: true });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return Response.json({ ok: false, field: "email", error: "That email doesn't look right." }, { status: 422 });
  }

  const patch: SignupPatch = {
    email,
    session_id: sanitizeId(body.sid),
    country: req.headers.get("x-vercel-ip-country") ?? "",
    step: "email",
  };

  // Requests can arrive out of order or alone (the client saves in the background),
  // so every step may carry attribution and the Instagram handle.
  Object.assign(patch, sanitizeAttribution(body.attribution));
  const instagram = body.instagram ? normalizeHandle(body.instagram) : null;
  if (instagram) patch.instagram = instagram;

  if (body.step === "email") {
    // email only
  } else if (body.step === "instagram") {
    if (!instagram) {
      return Response.json(
        { ok: false, field: "instagram", error: "Use your handle, like @wanderbuddy." },
        { status: 422 },
      );
    }
    patch.step = "instagram";
  } else if (body.step === "details") {
    patch.creator_type = oneOf(CREATOR_TYPES, body.creator_type);
    patch.followers = oneOf(FOLLOWER_RANGES, body.followers);
    patch.dms_per_day = oneOf(DM_RANGES, body.dms_per_day);
    patch.whatsapp = normalizePhone(body.whatsapp);
    patch.step = "complete";
  } else {
    return Response.json({ ok: false, error: "Unknown step" }, { status: 400 });
  }

  try {
    // Waitlist position is deliberately not returned: it would reveal the total signup count.
    await store.upsertSignup(patch);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] failed to save signup", err);
    return Response.json(
      { ok: false, error: "We couldn't save that. Try again in a moment." },
      { status: 502 },
    );
  }
}
