import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import { BOTID_CHALLENGE_PATH, BOTID_CHALLENGE_STUB, botIdChallengeStub } from "./botid-challenge-stub.ts";

function run(method: string, url: string) {
  const res = { statusCode: 0, setHeader: vi.fn(), end: vi.fn() };
  const next = vi.fn();
  botIdChallengeStub()({ method, url } as IncomingMessage, res as unknown as ServerResponse, next);
  return { res, next };
}

describe("botIdChallengeStub", () => {
  it("serves the stub script for the challenge path with a query string", () => {
    const { res, next } = run("GET", `${BOTID_CHALLENGE_PATH}?i=0&v=3`);
    expect(res.statusCode).toBe(200);
    expect(res.end).toHaveBeenCalledWith(BOTID_CHALLENGE_STUB);
    expect(next).not.toHaveBeenCalled();
  });

  it("passes through other requests", () => {
    expect(run("GET", "/index.html").next).toHaveBeenCalled();
    expect(run("POST", BOTID_CHALLENGE_PATH).next).toHaveBeenCalled();
  });
});

describe("BOTID_CHALLENGE_PATH", () => {
  it("matches the challenge rewrite in vercel.json", () => {
    const config = JSON.parse(readFileSync("vercel.json", "utf8")) as { rewrites: { source: string; destination: string }[] };
    const challenge = config.rewrites.find((r) => r.destination.endsWith("/bot-protection/v1/challenge"));
    expect(challenge?.source).toBe(BOTID_CHALLENGE_PATH);
  });
});
