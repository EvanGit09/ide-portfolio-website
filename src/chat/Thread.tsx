import { ThreadPrimitive } from "@assistant-ui/react";
import { AssistantMessage } from "./AssistantMessage";
import { Composer } from "./Composer";
import { ArrowDownIcon } from "./icons";
import { UserMessage } from "./UserMessage";

export function Thread() {
  return (
    <ThreadPrimitive.Root className="chat-thread">
      <ThreadPrimitive.Viewport className="chat-thread__viewport" role="log" aria-label="Conversation" aria-relevant="additions">
        <ThreadPrimitive.Messages>
          {({ message }) => (message.role === "user" ? <UserMessage /> : <AssistantMessage />)}
        </ThreadPrimitive.Messages>
        <ThreadPrimitive.ViewportFooter className="chat-thread__footer">
          <ThreadPrimitive.ScrollToBottom className="chat-thread__scroll" aria-label="Scroll to latest message">
            <ArrowDownIcon />
          </ThreadPrimitive.ScrollToBottom>
          <Composer />
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}
