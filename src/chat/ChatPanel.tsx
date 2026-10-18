import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/ai-sdk";
import type { ChatTransport, UIMessage } from "ai";
import { useState } from "react";
import { SEED_MESSAGES } from "./seed-messages";
import { Thread } from "./Thread";
import { createChatTransport } from "./transport";

export interface ChatPanelProps {
  transport?: ChatTransport<UIMessage>;
}

export function ChatPanel({ transport }: ChatPanelProps) {
  const [defaultTransport] = useState(() => createChatTransport());
  const resolvedTransport = transport ?? defaultTransport;
  const runtime = useChatRuntime({ transport: resolvedTransport, messages: SEED_MESSAGES });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}
