import { NextResponse } from "next/server";
import { getServiceSupabase } from "../../lib/supabase";

export const runtime = "nodejs";

// Pragmatic, reasonably strict email shape check (server-side validation).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = {
  email?: unknown;
  // Honeypot: real users never fill this hidden field.
  company?: unknown;
};

function json(
  body: { ok: boolean; message: string },
  status: number,
): NextResponse {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return json(
      { ok: false, message: "Something went wrong — please try again." },
      400,
    );
  }

  // Honeypot tripped → silently accept so bots get no signal.
  if (typeof payload.company === "string" && payload.company.trim() !== "") {
    return json({ ok: true, message: "You're on the list. We'll be in touch." }, 200);
  }

  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json(
      { ok: false, message: "Please enter a valid email address." },
      400,
    );
  }

  const supabase = getServiceSupabase();

  // Demo mode: no backend configured. Log and succeed so the deployed
  // site works out of the box before Supabase is wired up.
  if (!supabase) {
    console.info(`[waitlist:demo] signup received for ${email}`);
    return json(
      { ok: true, message: "You're on the list. We'll be in touch." },
      200,
    );
  }

  const { error } = await supabase.from("waitlist").insert({ email });

  if (error) {
    // 23505 = unique_violation → already signed up. Treat as success.
    if (error.code === "23505") {
      return json(
        { ok: true, message: "You're already on the list — see you soon." },
        200,
      );
    }

    console.error("[waitlist] insert failed:", error.message);
    return json(
      { ok: false, message: "Something went wrong — please try again." },
      500,
    );
  }

  return json(
    { ok: true, message: "You're on the list. We'll be in touch." },
    200,
  );
}
