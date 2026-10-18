import type { UIMessageChunk } from "ai";

export function surfaceTimeout(
  stream: ReadableStream<UIMessageChunk>,
  timedOut: () => boolean,
  errorText: string,
): ReadableStream<UIMessageChunk> {
  return stream.pipeThrough(
    new TransformStream<UIMessageChunk, UIMessageChunk>({
      transform(chunk, controller) {
        controller.enqueue(chunk.type === "abort" && timedOut() ? { type: "error", errorText } : chunk);
      },
    }),
  );
}
