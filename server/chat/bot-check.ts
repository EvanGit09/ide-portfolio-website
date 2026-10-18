import { checkBotId } from "botid/server";
import type { IncomingHttpHeaders } from "node:http";

function toIncomingHeaders(headers: Headers): IncomingHttpHeaders {
  return Object.fromEntries(headers.entries());
}

export async function checkBot(request: Request): Promise<{ isBot: boolean }> {
  const verdict = await checkBotId({ advancedOptions: { headers: toIncomingHeaders(request.headers) } });
  return { isBot: verdict.isBot };
}
