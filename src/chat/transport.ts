import { DefaultChatTransport, type UIMessage } from "ai";

export const HISTORY_WINDOW = 12;

export interface ChatRequestBody {
  id: string;
  messages: UIMessage[];
}

export const buildRequestBody = (id: string, messages: UIMessage[]): ChatRequestBody => ({
  id,
  messages: messages.slice(-HISTORY_WINDOW),
});

export function createChatTransport(api = "/api/chat", fetchImpl?: typeof fetch): DefaultChatTransport<UIMessage> {
  return new DefaultChatTransport<UIMessage>({
    api,
    fetch: fetchImpl,
    prepareSendMessagesRequest: ({ id, messages }) => ({ body: buildRequestBody(id, messages) }),
  });
}
