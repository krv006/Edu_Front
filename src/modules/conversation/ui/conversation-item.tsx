import { motion } from "framer-motion";
import { UsersRound, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "@/shared/ui/legacy";
import { formatConversationTime } from "@/shared/lib";
import type { Conversation } from "@/shared/types";

export interface ConversationItemProps {
  conversation: Conversation;
  active: boolean;
  basePath?: string;
  /** Shu guruhda hozir jonli dars ketyapti — ro'yxatdan turib ko'rinadi. */
  live?: boolean;
}

export function ConversationItem({
  conversation,
  active,
  basePath = "/teacher/chats",
  live = false,
}: ConversationItemProps) {
  return (
    <Link
      className={`conversation-item ${active ? "is-active" : ""}`}
      to={`${basePath}/${conversation.id}`}
    >
      {active && (
        <motion.span
          className="conversation-active"
          layoutId="conversation-active"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <span className="conversation-avatar">
        <Avatar
          name={conversation.title}
          tone={conversation.avatarTone}
          src={conversation.imageUrl}
          size="lg"
          status={conversation.type === "direct" ? conversation.status : undefined}
        />
        {live && <span className="conversation-live-ring" aria-hidden="true" />}
      </span>
      <span className="conversation-copy">
        <span className="conversation-row">
          <strong>{conversation.title}</strong>
          <time>{formatConversationTime(conversation.updatedAt)}</time>
        </span>
        <span className="conversation-row conversation-row--preview">
          {/*
            Jonli dars ohirgi xabardan muhimroq: o'quvchi qaysi guruhga
            kirishini ro'yxatdan turib bilishi kerak, shuning uchun shu paytda
            oldin ko'rinish o'rnini egallaydi.
          */}
          {live ? (
            <span className="conversation-live-copy">
              <Video size={13} aria-hidden="true" />
              Dars ketmoqda
            </span>
          ) : (
            <span className={conversation.typing ? "typing-copy" : ""}>
              {conversation.type === "group" && <UsersRound size={13} aria-hidden="true" />}
              {conversation.typing ? "yozmoqda..." : conversation.lastMessage}
            </span>
          )}
          {conversation.unreadCount > 0 && (
            <span className="unread-badge">{conversation.unreadCount}</span>
          )}
        </span>
      </span>
    </Link>
  );
}
