import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, type LanguageModel } from "ai";
import { MAX_OUTPUT_TOKENS, MAX_RETRIES, UPSTREAM_TIMEOUT_MS } from "./config";
import { BUSY_MESSAGE, logChatError, textResponse, toFriendlyStreamError } from "./errors";
import { surfaceTimeout } from "./timeout-stream";
import { buildSystemPrompt } from "./system-prompt";
import { parseChatRequest } from "./validate-request";

export type ChatHandlerDeps = {
  getModel: () => LanguageModel | null;
  checkBot: (request: Request) => Promise<{ isBot: boolean }>;
  now: () => Date;
};

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin === null) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function isBlockedBot(deps: ChatHandlerDeps, request: Request): Promise<boolean> {
  try {
    return (await deps.checkBot(request)).isBot;
  } catch (error) {
    logChatError("bot-check-failed", error);
    return false;
  }
}

async function respond(deps: ChatHandlerDeps, request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return textResponse(403, "Cross-origin requests are not allowed.");
  if (await isBlockedBot(deps, request)) return textResponse(403, "Request blocked.");

  const parsed = await parseChatRequest(await request.text());
  if (!parsed.ok) return textResponse(parsed.status, parsed.error);

  const model = deps.getModel();
  if (!model) {
    console.error("[chat] OPENROUTER_API_KEY is not configured");
    return textResponse(500, "The assistant is unavailable right now.");
  }

  const timeout = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);
  const result = streamText({
    model,
    instructions: buildSystemPrompt(deps.now()),
    messages: await convertToModelMessages(parsed.messages),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    maxRetries: MAX_RETRIES,
    abortSignal: AbortSignal.any([request.signal, timeout]),
  });

  const stream = toUIMessageStream({
    stream: result.stream,
    onError: (error) => {
      logChatError("stream", error);
      return toFriendlyStreamError(error);
    },
  });
  const timedOut = (): boolean => timeout.aborted && !request.signal.aborted;
  return createUIMessageStreamResponse({ stream: surfaceTimeout(stream, timedOut, BUSY_MESSAGE) });
}

export function createChatHandler(deps: ChatHandlerDeps): (request: Request) => Promise<Response> {
  return async (request) => {
    try {
      return await respond(deps, request);
    } catch (error) {
      logChatError("handler", error);
      return textResponse(500, "Something went wrong. Please try again.");
    }
  };
}
