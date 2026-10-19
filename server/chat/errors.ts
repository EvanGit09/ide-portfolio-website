import { APICallError, RetryError } from "ai";
import { CONTACT_EMAIL } from "./config.js";

const QUOTA_MESSAGE = `The assistant has reached today's free usage limit. Please try again tomorrow, or email Corey at ${CONTACT_EMAIL}.`;
export const BUSY_MESSAGE = "The free AI model is busy right now. Please try again in a moment.";
const GENERIC_MESSAGE = "Something went wrong while generating a reply. Please try again.";

function unwrap(error: unknown): unknown {
  return RetryError.isInstance(error) ? (error.lastError ?? error) : error;
}

function isDailyQuota(error: APICallError): boolean {
  const haystack = `${error.message} ${error.responseBody ?? ""}`.toLowerCase();
  return haystack.includes("per-day") || haystack.includes("free-models-per-day");
}

function isBusy(error: APICallError): boolean {
  const status = error.statusCode;
  return status === undefined || status === 429 || status >= 500;
}

export function toFriendlyStreamError(error: unknown): string {
  const cause = unwrap(error);
  if (!APICallError.isInstance(cause)) return GENERIC_MESSAGE;
  if (cause.statusCode === 429 && isDailyQuota(cause)) return QUOTA_MESSAGE;
  return isBusy(cause) ? BUSY_MESSAGE : GENERIC_MESSAGE;
}

export function textResponse(status: number, message: string): Response {
  return new Response(message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

export function logChatError(context: string, error: unknown): void {
  const cause = unwrap(error);
  const details = {
    context,
    name: cause instanceof Error ? cause.name : typeof cause,
    statusCode: APICallError.isInstance(cause) ? cause.statusCode : undefined,
    isRetryable: APICallError.isInstance(cause) ? cause.isRetryable : undefined,
  };
  console.error("[chat]", details);
}
