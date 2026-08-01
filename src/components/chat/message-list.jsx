import { useEffect, useRef, useState } from "react";
import { DateSeparator } from "./date-separator";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { MessageActionsMenu } from "./message-actions-menu";

export function MessageList({
  messages,
  conversation,
  loading,
  error,
  onRetry,
  onReply,
  onEdit,
  onDelete,
  onReact,
}) {
  const bottomRef = useRef(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 20, y: 20 });
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  if (loading)
    return (
      <div className="message-loading">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className={`message-skeleton ${index % 2 ? "right" : ""}`}
          />
        ))}
      </div>
    );
  if (error)
    return (
      <div className="chat-error">
        <strong>Xabarlar yuklanmadi</strong>
        <p>Bir ozdan so‘ng yana urinib ko‘ring.</p>
        <button onClick={onRetry}>Qayta urinish</button>
      </div>
    );

  return (
    <div className="message-scroll" role="log" aria-live="polite">
      <div className="message-list">
        <DateSeparator>Bugun</DateSeparator>
        {(messages ?? []).map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onReply={onReply}
            onReact={onReact}
            onOpenActions={(selected, position) => {
              const mobile = window.innerWidth <= 768;
              const menuWidth = mobile ? 226 : 234;
              const menuHeight = mobile ? 270 : 292;
              setActionMessage(selected);
              setMenuPosition({
                x: Math.max(10, Math.min(mobile ? position.x - menuWidth / 2 : position.x, window.innerWidth - menuWidth - 10)),
                y: Math.max(64, Math.min(mobile ? position.y - 126 : position.y, window.innerHeight - menuHeight - 10)),
              });
            }}
          />
        ))}
        {conversation.typing && <TypingIndicator name={conversation.title} />}
        <div ref={bottomRef} />
      </div>
      <MessageActionsMenu
        message={actionMessage}
        position={menuPosition}
        onClose={() => setActionMessage(null)}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
        onReact={onReact}
      />
    </div>
  );
}
