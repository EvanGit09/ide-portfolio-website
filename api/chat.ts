import { checkBot } from "../server/chat/bot-check.js";
import { createChatHandler } from "../server/chat/handler.js";
import { createOpenRouterModel } from "../server/chat/model.js";

const handler = createChatHandler({
  getModel: () => createOpenRouterModel(process.env.OPENROUTER_API_KEY),
  checkBot,
  now: () => new Date(),
});

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
