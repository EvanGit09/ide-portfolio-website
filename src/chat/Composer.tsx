import { AuiIf, ComposerPrimitive } from "@assistant-ui/react";
import { SendIcon, StopIcon } from "./icons";

export const MAX_MESSAGE_LENGTH = 2000;

export function Composer() {
  return (
    <ComposerPrimitive.Root className="chat-composer">
      <ComposerPrimitive.Input
        className="chat-composer__input"
        placeholder="Ask about Corey, or anything…"
        aria-label="Message the agent"
        maxLength={MAX_MESSAGE_LENGTH}
        rows={1}
      />
      <AuiIf condition={(s) => !s.composer.canCancel}>
        <ComposerPrimitive.Send className="chat-composer__btn chat-composer__send" aria-label="Send message">
          <SendIcon />
        </ComposerPrimitive.Send>
      </AuiIf>
      <AuiIf condition={(s) => s.composer.canCancel}>
        <ComposerPrimitive.Cancel className="chat-composer__btn chat-composer__stop" aria-label="Stop generating">
          <StopIcon />
        </ComposerPrimitive.Cancel>
      </AuiIf>
    </ComposerPrimitive.Root>
  );
}
