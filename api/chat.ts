import { checkBot } from "../server/chat/bot-check";
import { createChatHandler } from "../server/chat/handler";
import { createOpenRouterModel } from "../server/chat/model";

const handler = createChatHandler({
  getModel: () => createOpenRouterModel(process.env.OPENROUTER_API_KEY),
  checkBot,
  now: () => new Date(),
});

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
