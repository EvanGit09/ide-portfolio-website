import { once } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";

export function toWebHeaders(raw: IncomingMessage["headers"]): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) headers.append(name, item);
  }
  return headers;
}

export function toWebRequest(req: IncomingMessage, abort: AbortSignal): Request {
  const host = req.headers.host ?? "localhost";
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  return new Request(`http://${host}${req.url ?? "/"}`, {
    method: req.method,
    headers: toWebHeaders(req.headers),
    body: hasBody ? (Readable.toWeb(req) as ReadableStream<Uint8Array>) : undefined,
    duplex: "half",
    signal: abort,
  } as RequestInit);
}

export async function sendWebResponse(response: Response, res: ServerResponse): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, name) => res.setHeader(name, value));
  if (!response.body) {
    res.end();
    return;
  }
  const reader = response.body.getReader();
  let finished = false;
  try {
    while (!res.destroyed) {
      const chunk = await reader.read();
      if (chunk.done) {
        finished = true;
        break;
      }
      if (!res.write(chunk.value)) await Promise.race([once(res, "drain"), once(res, "close")]);
    }
  } finally {
    if (!finished) await reader.cancel().catch(() => undefined);
    res.end();
  }
}

export function abortOnEarlyClose(res: ServerResponse, controller: AbortController): void {
  res.on("close", () => {
    if (!res.writableFinished) controller.abort();
  });
}

export function failResponse(res: ServerResponse): void {
  if (res.headersSent) {
    res.destroy();
    return;
  }
  res.statusCode = 500;
  res.setHeader("content-type", "text/plain; charset=utf-8");
  res.end("Internal dev server error");
}
