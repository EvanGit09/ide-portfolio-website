import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { EventEmitter } from "node:events";
import { abortOnEarlyClose, failResponse, sendWebResponse, toWebHeaders, toWebRequest } from "./web-node-bridge.ts";

function fakeIncoming(init: { method: string; url: string; headers: Record<string, string | string[]>; body?: string }): IncomingMessage {
  const req = Readable.from(init.body ? [Buffer.from(init.body)] : []) as unknown as IncomingMessage;
  return Object.assign(req, { method: init.method, url: init.url, headers: init.headers });
}

function fakeResponse(): { res: ServerResponse; chunks: string[]; ended: () => boolean } {
  const res = new ServerResponse(new IncomingMessage(new Socket()));
  const chunks: string[] = [];
  let done = false;
  res.write = ((chunk: Uint8Array) => (chunks.push(Buffer.from(chunk).toString()), true)) as typeof res.write;
  res.end = (() => ((done = true), res)) as typeof res.end;
  return { res, chunks, ended: () => done };
}

describe("toWebHeaders", () => {
  it("copies strings, expands arrays and skips undefined", () => {
    const headers = toWebHeaders({ host: "a", "x-multi": ["1", "2"], skipped: undefined });
    expect(headers.get("host")).toBe("a");
    expect(headers.get("x-multi")).toBe("1, 2");
    expect(headers.has("skipped")).toBe(false);
  });
});

describe("toWebRequest", () => {
  it("builds a POST request with body and url", async () => {
    const req = fakeIncoming({ method: "POST", url: "/api/chat", headers: { host: "localhost:5173", "content-type": "application/json" }, body: '{"a":1}' });
    const web = toWebRequest(req, new AbortController().signal);
    expect(web.method).toBe("POST");
    expect(web.url).toBe("http://localhost:5173/api/chat");
    expect(await web.text()).toBe('{"a":1}');
  });

  it("propagates abort", () => {
    const controller = new AbortController();
    const req = fakeIncoming({ method: "POST", url: "/api/chat", headers: {}, body: "{}" });
    const web = toWebRequest(req, controller.signal);
    controller.abort();
    expect(web.signal.aborted).toBe(true);
  });

  it("omits the body for GET", () => {
    const web = toWebRequest(fakeIncoming({ method: "GET", url: "/x", headers: {} }), new AbortController().signal);
    expect(web.body).toBeNull();
  });
});

describe("sendWebResponse", () => {
  it("streams status, headers and chunks", async () => {
    const { res, chunks, ended } = fakeResponse();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("one"));
        controller.enqueue(new TextEncoder().encode("two"));
        controller.close();
      },
    });
    await sendWebResponse(new Response(body, { status: 201, headers: { "x-test": "yes" } }), res);
    expect(res.statusCode).toBe(201);
    expect(res.getHeader("x-test")).toBe("yes");
    expect(chunks).toEqual(["one", "two"]);
    expect(ended()).toBe(true);
  });

  it("ends immediately without a body", async () => {
    const { res, ended } = fakeResponse();
    await sendWebResponse(new Response(null, { status: 204 }), res);
    expect(res.statusCode).toBe(204);
    expect(ended()).toBe(true);
  });
});

class FakeRes extends EventEmitter {
  statusCode = 0;
  headersSent = false;
  destroyed = false;
  writableFinished = false;
  written: string[] = [];
  ended = false;
  body = "";
  headers: Record<string, string> = {};
  constructor(private readonly backpressure = false) {
    super();
  }
  setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }
  write(chunk: Uint8Array): boolean {
    this.written.push(Buffer.from(chunk).toString());
    if (this.backpressure) setTimeout(() => this.emit("drain"), 5);
    return !this.backpressure;
  }
  end(text?: string): void {
    this.ended = true;
    this.body = text ?? "";
  }
  destroy(): void {
    this.destroyed = true;
  }
}

const asRes = (fake: FakeRes): ServerResponse => fake as unknown as ServerResponse;

function trackedBody(chunks: string[]): { body: ReadableStream<Uint8Array>; cancelled: () => boolean } {
  let cancelled = false;
  const queue = [...chunks];
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      const next = queue.shift();
      if (next === undefined) controller.close();
      else controller.enqueue(new TextEncoder().encode(next));
    },
    cancel() {
      cancelled = true;
    },
  });
  return { body, cancelled: () => cancelled };
}

describe("sendWebResponse backpressure and cancellation", () => {
  it("waits for drain and writes every chunk in order", async () => {
    const fake = new FakeRes(true);
    const { body } = trackedBody(["a", "b", "c"]);
    await sendWebResponse(new Response(body), asRes(fake));
    expect(fake.written).toEqual(["a", "b", "c"]);
    expect(fake.ended).toBe(true);
  });

  it("cancels the source reader when the client closes early", async () => {
    const fake = new FakeRes();
    const { body, cancelled } = trackedBody(["a", "b", "c"]);
    const original = fake.write.bind(fake);
    fake.write = (chunk: Uint8Array): boolean => {
      fake.destroyed = true;
      return original(chunk);
    };
    await sendWebResponse(new Response(body), asRes(fake));
    expect(fake.written).toEqual(["a"]);
    expect(cancelled()).toBe(true);
  });

  it("does not cancel the source after a complete stream", async () => {
    const fake = new FakeRes();
    const { body, cancelled } = trackedBody(["a"]);
    await sendWebResponse(new Response(body), asRes(fake));
    expect(cancelled()).toBe(false);
  });
});

describe("abortOnEarlyClose", () => {
  it("aborts when the response closes before finishing", () => {
    const fake = new FakeRes();
    const controller = new AbortController();
    abortOnEarlyClose(asRes(fake), controller);
    fake.emit("close");
    expect(controller.signal.aborted).toBe(true);
  });

  it("does not abort after the response finished", () => {
    const fake = new FakeRes();
    const controller = new AbortController();
    abortOnEarlyClose(asRes(fake), controller);
    fake.writableFinished = true;
    fake.emit("close");
    expect(controller.signal.aborted).toBe(false);
  });
});

describe("failResponse", () => {
  it("sends a 500 plain-text response before headers are sent", () => {
    const fake = new FakeRes();
    failResponse(asRes(fake));
    expect(fake.statusCode).toBe(500);
    expect(fake.headers["content-type"]).toContain("text/plain");
    expect(fake.body).toBe("Internal dev server error");
    expect(fake.destroyed).toBe(false);
  });

  it("destroys the connection instead of appending text after headers are sent", () => {
    const fake = new FakeRes();
    fake.headersSent = true;
    failResponse(asRes(fake));
    expect(fake.destroyed).toBe(true);
    expect(fake.ended).toBe(false);
    expect(fake.body).toBe("");
  });
});
