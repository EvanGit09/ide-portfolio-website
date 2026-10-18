import { safeValidateUIMessages, type UIMessage } from "ai";
import { z } from "zod";
import { HISTORY_WINDOW, MAX_ASSISTANT_CHARS, MAX_BODY_BYTES, MAX_MESSAGES, MAX_USER_CHARS } from "./config";

export type ParseResult =
  | { ok: true; messages: UIMessage[] }
  | { ok: false; status: 400 | 413; error: string };

type Failure = Extract<ParseResult, { ok: false }>;

const envelopeSchema = z.object({ messages: z.array(z.unknown()).min(1).max(MAX_MESSAGES) });

const fail = (status: 400 | 413, error: string): Failure => ({ ok: false, status, error });

const INVALID = fail(400, "Invalid chat request.");

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function textOnly(message: UIMessage): UIMessage | null {
  if (message.role !== "user" && message.role !== "assistant") return null;
  const parts = message.parts.flatMap((part) =>
    part.type === "text" && part.text.trim() !== "" ? [{ type: "text" as const, text: part.text }] : [],
  );
  if (parts.length === 0) return null;
  return { id: message.id, role: message.role, parts };
}

const textLength = (message: UIMessage): number =>
  message.parts.reduce((total, part) => total + (part.type === "text" ? part.text.length : 0), 0);

function exceedsCaps(messages: UIMessage[]): boolean {
  return messages.some(
    (m) => textLength(m) > (m.role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS),
  );
}

function windowHistory(messages: UIMessage[]): UIMessage[] {
  const recent = messages.slice(-HISTORY_WINDOW);
  const firstUser = recent.findIndex((m) => m.role === "user");
  return firstUser === -1 ? [] : recent.slice(firstUser);
}

export async function parseChatRequest(rawBody: string): Promise<ParseResult> {
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) return fail(413, "Request is too large.");

  const envelope = envelopeSchema.safeParse(parseJson(rawBody));
  if (!envelope.success) return INVALID;

  const validated = await safeValidateUIMessages({ messages: envelope.data.messages });
  if (!validated.success) return INVALID;

  const sanitized = validated.data.flatMap((m) => {
    const clean = textOnly(m);
    return clean ? [clean] : [];
  });

  if (exceedsCaps(sanitized)) return fail(413, "Message is too long.");
  if (sanitized.at(-1)?.role !== "user") return INVALID;

  return { ok: true, messages: windowHistory(sanitized) };
}
