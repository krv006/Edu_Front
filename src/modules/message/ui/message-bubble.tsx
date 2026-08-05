import { CheckCheck, RefreshCw, Reply } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { formatMessageTime } from "@/shared/lib";
import type { ChatMessage } from "@/shared/types";
import { MessageText } from "./message-text";

export interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId?: string | null;
  onReply: (message: ChatMessage) => void;
  onOpenActions: (message: ChatMessage, position: { x: number; y: number }) => void;
  onReact: (message: ChatMessage, emoji: string) => void;
  onRetryMessage?: (message: ChatMessage) => void;
}

export function MessageBubble({ message, currentUserId = null, onReply, onOpenActions, onReact, onRetryMessage }: MessageBubbleProps) {
  const outgoing = message.senderId === currentUserId;
  const [dragging, setDragging] = useState(false);

  if (message.type === "system")
    return <div className="system-message">{message.text}</div>;

  return (
    <motion.div
      className={`message-row ${outgoing ? "message-row--outgoing" : ""} ${
        dragging ? "is-dragging" : ""
      }`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.16}
      dragMomentum={false}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_event, info) => {
        setDragging(false);
        if (Math.abs(info.offset.x) > 46) onReply(message);
      }}
      onDoubleClick={() => onReply(message)}
      onClick={(event) => {
        if (
          !dragging &&
          window.matchMedia("(max-width: 768px), (pointer: coarse)").matches
        ) {
          onOpenActions(message, {
            x: event.clientX || 20,
            y: event.clientY || window.innerHeight - 330,
          });
        }
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        onOpenActions(message, { x: event.clientX, y: event.clientY });
      }}
    >
      <span className="reply-drag-hint" aria-hidden="true">
        <Reply size={16} />
      </span>
      <div className="message-bubble">
        {message.senderName && !outgoing && (
          <span className="message-sender-name">{message.senderName}</span>
        )}
        {message.replyTo && (
          <div className="reply-quote">
            <strong>{message.replyTo.author}</strong>
            <span>{message.replyTo.text}</span>
          </div>
        )}
        {/* Backend hozircha faqat matnli xabar qaytaradi (mapMessageDto: type="text").
            Fayl/audio turlari API'da paydo bo'lganda shu yerga qo'shiladi. */}
        {message.text && <MessageText text={message.text} />}
        <span className="message-meta">
          {message.editedAt && <em>tahrirlangan</em>}
          <time>{formatMessageTime(message.createdAt)}</time>
          {outgoing && (
            <CheckCheck
              size={15}
              className={message.status === "read" ? "is-read" : ""}
              aria-label={message.status}
            />
          )}
        </span>
        {message.failed ? <button className="message-retry" onClick={(event) => { event.stopPropagation(); onRetryMessage?.(message); }}><RefreshCw size={13} /> Qayta yuborish</button> : null}
        <AnimatePresence initial={false}>
        {message.reactions && message.reactions.length > 0 && (
          <motion.div className="message-reactions" aria-label="Xabar reaksiyalari" initial={{ opacity: 0, y: -18, scale: .68 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .72 }} transition={{ type: "spring", stiffness: 520, damping: 24 }}>
            {message.reactions.map((reaction) => (
              <motion.button
                layout
                key={`${reaction.emoji}-${reaction.count}-${reaction.reacted}`}
                className={reaction.reacted ? "is-reacted" : ""}
                initial={{ opacity: 0, y: -22, scale: .35, rotate: -18 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, y: -10, scale: .45 }}
                transition={{ type: "spring", stiffness: 640, damping: 21 }}
                whileTap={{ scale: .82 }}
                onClick={(event) => {
                  event.stopPropagation();
                  onReact(message, reaction.emoji);
                }}
              >
                <motion.i className="reaction-pop-burst" initial={{ opacity: .75, scale: .2 }} animate={{ opacity: 0, scale: 2.2 }} transition={{ duration: .48, ease: "easeOut" }} />
                <motion.span initial={{ y: -7 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 700, damping: 18 }}>{reaction.emoji}</motion.span>
                {reaction.count}
              </motion.button>
            ))}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
