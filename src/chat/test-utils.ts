import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";

const textChunks = (text: string): UIMessageChunk[] => [
  { type: "start", messageId: "reply" },
  { type: "text-start", id: "t" },
  ...(text.match(/.{1,20}/gs) ?? []).map((delta): UIMessageChunk => ({ type: "text-delta", id: "t", delta })),
  { type: "text-end", id: "t" },
  { type: "finish", finishReason: "stop" },
];

export interface MockTransportOptions {
  text?: string;
  error?: Error;
  hold?: boolean;
}

export interface MockTransport extends ChatTransport<UIMessage> {
  release: () => void;
  sent: UIMessage[][];
}

export function createMockTransport({ text = "", error, hold = false }: MockTransportOptions): MockTransport {
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => (release = resolve));
  const sent: UIMessage[][] = [];
  return {
    release: () => release(),
    sent,
    async sendMessages({ messages }) {
      sent.push(messages);
      if (error) throw error;
      const chunks = textChunks(text);
      return new ReadableStream<UIMessageChunk>({
        async start(controller) {
          controller.enqueue(chunks[0]);
          controller.enqueue(chunks[1]);
          if (hold) await gate;
          for (const chunk of chunks.slice(2)) controller.enqueue(chunk);
          controller.close();
        },
      });
    },
    async reconnectToStream() {
      return null;
    },
  };
}
