import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";
import { APP_NAME, APP_URL, MODEL_ID } from "./config.js";

export function createOpenRouterModel(apiKey: string | undefined): LanguageModel | null {
  if (!apiKey) return null;
  return createOpenRouter({ apiKey, appUrl: APP_URL, appName: APP_NAME })(MODEL_ID);
}
