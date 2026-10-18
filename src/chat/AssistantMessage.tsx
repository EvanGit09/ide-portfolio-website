import { ActionBarPrimitive, AuiIf, ErrorPrimitive, MessagePrimitive } from "@assistant-ui/react";
import { useAISDKError } from "@assistant-ui/ai-sdk";
import { APICallError } from "ai";
import { getChatErrorMessage } from "./error-messages";
import { CheckIcon, CopyIcon, RetryIcon } from "./icons";
import { MarkdownText } from "./MarkdownText";

function TypingIndicator() {
  return (
    <span className="chat-typing" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function ChatError() {
  const error = useAISDKError();
  const statusCode = APICallError.isInstance(error) ? error.statusCode : undefined;
  const text = getChatErrorMessage({ statusCode, message: error?.message });
  return (
    <ErrorPrimitive.Root className="chat-error" role="alert">
      <ErrorPrimitive.Message className="chat-error__message">{text}</ErrorPrimitive.Message>
      <ActionBarPrimitive.Reload className="chat-error__retry">
        <RetryIcon />
        Retry
      </ActionBarPrimitive.Reload>
    </ErrorPrimitive.Root>
  );
}

function MessageActions() {
  return (
    <ActionBarPrimitive.Root hideWhenRunning autohide="not-last" className="chat-actions">
      <ActionBarPrimitive.Copy className="chat-actions__btn" aria-label="Copy message" title="Copy">
        <CopyIcon />
        <CheckIcon />
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload className="chat-actions__btn" aria-label="Retry response" title="Retry">
        <RetryIcon />
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
}

export function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="chat-message chat-message--ai">
      <span className="chat-message__label">Agent</span>
      <div className="chat-message__bubble">
        <MessagePrimitive.Parts>
          {({ part }) => {
            if (part.type !== "text") return null;
            return part.text === "" && part.status?.type === "running" ? <TypingIndicator /> : <MarkdownText />;
          }}
        </MessagePrimitive.Parts>
        <MessagePrimitive.Error>
          <ChatError />
        </MessagePrimitive.Error>
      </div>
      <AuiIf condition={(s) => !(s.message.status?.type === "incomplete" && s.message.status.reason === "error")}>
        <MessageActions />
      </AuiIf>
    </MessagePrimitive.Root>
  );
}
