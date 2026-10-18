import { loadEnv, type Connect, type ConfigEnv, type Plugin, type UserConfig, type ViteDevServer } from "vite";
import { botIdChallengeStub } from "./botid-challenge-stub.ts";
import { abortOnEarlyClose, failResponse, sendWebResponse, toWebRequest } from "./web-node-bridge.ts";

const CHAT_PATH = "/api/chat";
const API_KEY_NAME = "OPENROUTER_API_KEY";

export function shouldApplyDevApi(_config: UserConfig, env: ConfigEnv): boolean {
  return env.command === "serve" && !process.env.VITEST;
}

function handleChat(server: ViteDevServer): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (req.method !== "POST" || req.url?.split("?")[0] !== CHAT_PATH) return next();
    const controller = new AbortController();
    abortOnEarlyClose(res, controller);
    try {
      const mod = (await server.ssrLoadModule("/api/chat.ts")) as { POST: (r: Request) => Promise<Response> };
      await sendWebResponse(await mod.POST(toWebRequest(req, controller.signal)), res);
    } catch (error: unknown) {
      console.error("[dev-api] /api/chat failed", error);
      failResponse(res);
    }
  };
}

export function chatApiDevPlugin(): Plugin {
  return {
    name: "chat-api-dev",
    apply: shouldApplyDevApi,
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, "");
      if (!process.env[API_KEY_NAME] && env[API_KEY_NAME]) process.env[API_KEY_NAME] = env[API_KEY_NAME];
      server.middlewares.use(botIdChallengeStub());
      server.middlewares.use(handleChat(server));
    },
  };
}
