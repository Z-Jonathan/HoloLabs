import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

/**
 * Generates Holo's conversational reply.
 * - With ANTHROPIC_API_KEY set: calls Claude (server-side only).
 * - Without it: deterministic demo replies so the deployed site works
 *   out of the box — same graceful-degradation pattern as the waitlist.
 */

const MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `You are Holo, a friendly conversation partner inside a sign language app. Your replies are performed by a 3D avatar in American Sign Language (fingerspelling plus a small sign vocabulary), with captions shown alongside.

Rules for every reply:
- Keep it SHORT: one sentence, at most about 12 words.
- Use simple, common English words. Avoid jargon, idioms, and filler.
- No markdown, no emoji, no quotation marks, no lists.
- Prefer words like: hello, thank you, yes, no, good, nice, happy, help, please, sorry, friend, name, meet, you, me.
- Be warm and direct. Ask at most one short question back.
- Respond only with the final reply text — no reasoning or preamble.`;

interface IncomingMessage {
  role?: unknown;
  text?: unknown;
}

interface Turn {
  role: "user" | "assistant";
  content: string;
}

function json(
  body: { ok: boolean; reply: string; source: "claude" | "demo" | "none" },
  status: number,
): NextResponse {
  return NextResponse.json(body, { status });
}

/** Tiny canned-response engine for demo mode (no API key configured). */
function demoReply(text: string): string {
  const t = text.toLowerCase();
  if (/\b(hello|hi|hey)\b/.test(t)) return "Hello! Nice to meet you.";
  if (/\bhow are you\b/.test(t)) return "I am good, thank you. And you?";
  if (/\b(thank|thanks)\b/.test(t)) return "You are welcome!";
  if (/\b(bye|goodbye)\b/.test(t)) return "Goodbye, friend. See you soon!";
  if (/\bname\b/.test(t)) return "My name is Holo. What is yours?";
  if (/\b(yes|no)\b/.test(t)) return "Got it. Tell me more.";
  return "I see. Tell me more, please.";
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: { messages?: unknown };
  try {
    payload = (await request.json()) as { messages?: unknown };
  } catch {
    return json({ ok: false, reply: "", source: "none" }, 400);
  }

  if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
    return json({ ok: false, reply: "", source: "none" }, 400);
  }

  // Validate + map to API turns; cap history to the last 12 turns.
  const turns: Turn[] = [];
  for (const raw of payload.messages.slice(-12) as IncomingMessage[]) {
    const role = raw.role === "holo" ? "assistant" : "user";
    const content = typeof raw.text === "string" ? raw.text.trim() : "";
    if (content === "" || content.length > 2000) continue;
    turns.push({ role, content });
  }
  const lastUser = [...turns].reverse().find((t) => t.role === "user");
  if (!lastUser) {
    return json({ ok: false, reply: "", source: "none" }, 400);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ ok: true, reply: demoReply(lastUser.content), source: "demo" }, 200);
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: turns,
    });

    const reply = response.content
      .filter(
        (block): block is Anthropic.TextBlock => block.type === "text",
      )
      .map((block) => block.text)
      .join(" ")
      .trim();

    if (!reply) {
      return json(
        { ok: true, reply: demoReply(lastUser.content), source: "demo" },
        200,
      );
    }
    return json({ ok: true, reply, source: "claude" }, 200);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`[respond] Claude API error ${error.status}:`, error.message);
    } else {
      console.error("[respond] unexpected error:", error);
    }
    // Degrade to demo mode rather than breaking the conversation.
    return json(
      { ok: true, reply: demoReply(lastUser.content), source: "demo" },
      200,
    );
  }
}
