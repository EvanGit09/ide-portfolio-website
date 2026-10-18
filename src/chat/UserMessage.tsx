import { MessagePrimitive } from "@assistant-ui/react";

export function UserMessage() {
  return (
    <MessagePrimitive.Root className="chat-message chat-message--user">
      <span className="chat-message__label">You</span>
      <div className="chat-message__bubble">
        <MessagePrimitive.Parts>
          {({ part }) => (part.type === "text" ? <span className="chat-message__text">{part.text}</span> : null)}
        </MessagePrimitive.Parts>
      </div>
    </MessagePrimitive.Root>
  );
}
