export interface ChatErrorInput {
  statusCode?: number;
  message?: string;
}

export const SERVER_FRIENDLY_MESSAGES: readonly string[] = [
  "The assistant has reached today's free usage limit. Please try again tomorrow, or email Corey at coreybirnie@gmail.com.",
  "The free AI model is busy right now. Please try again in a moment.",
  "Something went wrong while generating a reply. Please try again.",
];

const GENERIC = "Something went wrong. Please try again.";
const UNAVAILABLE = "The assistant is unavailable right now. Please try again later.";
const NETWORK = "Couldn't reach the assistant. Check your connection and try again.";
const NETWORK_PATTERN = /failed to fetch|networkerror|load failed|network request failed/i;

const STATUS_MESSAGES: Readonly<Record<number, string>> = {
  400: "That message couldn't be sent. Try rephrasing it.",
  403: "Your request was blocked. Refresh the page and try again.",
  413: "That message is too long. Please shorten it.",
  429: "You're sending messages too quickly. Wait a minute and try again.",
};

export function getChatErrorMessage({ statusCode, message }: ChatErrorInput): string {
  if (statusCode !== undefined && STATUS_MESSAGES[statusCode]) return STATUS_MESSAGES[statusCode];
  if (statusCode !== undefined && statusCode >= 500) return UNAVAILABLE;
  const text = message?.trim() ?? "";
  if (NETWORK_PATTERN.test(text)) return NETWORK;
  return SERVER_FRIENDLY_MESSAGES.includes(text) ? text : GENERIC;
}
