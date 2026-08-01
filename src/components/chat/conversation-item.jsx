import { motion } from "framer-motion";
import { UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "../ui/avatar";
import { formatConversationTime } from "../../lib/date";

export function ConversationItem({ conversation, active }) {
  return (
    <Link
      className={`conversation-item ${active ? "is-active" : ""}`}
      to={`/teacher/chats/${conversation.id}`}
    >
      {active && (
        <motion.span
          className="conversation-active"
          layoutId="conversation-active"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <Avatar
        name={conversation.title}
        tone={conversation.avatarTone}
        size="lg"
        status={
          conversation.type === "direct" ? conversation.status : undefined
        }
      />
      <span className="conversation-copy">
        <span className="conversation-row">
          <strong>{conversation.title}</strong>
          <time>{formatConversationTime(conversation.updatedAt)}</time>
        </span>
        <span className="conversation-row conversation-row--preview">
          <span className={conversation.typing ? "typing-copy" : ""}>
            {conversation.type === "group" && (
              <UsersRound size={13} aria-hidden="true" />
            )}
            {conversation.typing ? "yozmoqda..." : conversation.lastMessage}
          </span>
          {conversation.unreadCount > 0 && (
            <span className="unread-badge">{conversation.unreadCount}</span>
          )}
        </span>
      </span>
    </Link>
  );
}
