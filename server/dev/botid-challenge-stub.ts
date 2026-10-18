import type { Connect } from "vite";

export const BOTID_CHALLENGE_PATH = "/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/a-4-a/c.js";
export const BOTID_CHALLENGE_STUB = "(window.V_C = window.V_C || []).push({ b: 0, d: 0 });";

export function botIdChallengeStub(): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (req.method !== "GET" || !req.url?.startsWith(BOTID_CHALLENGE_PATH)) return next();
    res.statusCode = 200;
    res.setHeader("content-type", "text/javascript; charset=utf-8");
    res.setHeader("cache-control", "no-store");
    res.end(BOTID_CHALLENGE_STUB);
  };
}
