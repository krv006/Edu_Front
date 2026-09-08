import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/shared/ui/legacy";

import { ConversationInfoPanel } from "./conversation-info-panel";
import type { Conversation } from "@/shared/types";

export interface ChatHeaderProps {
  conversation: Conversation;
  backTo?: string;
}

export function ChatHeader({ conversation, backTo = "/teacher/chats" }: ChatHeaderProps) {
  const { t } = useTranslation("chat");
  const navigate = useNavigate();
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <>
      <header className="chat-header">
        <button
          className="icon-button chat-back"
          onClick={() => navigate(backTo)}
          aria-label={t("header.backAria")}
        >
          <ArrowLeft size={21} />
        </button>
        <button
          className="chat-identity"
          onClick={() => setInfoOpen(true)}
          aria-label={t("header.openInfoAria", { title: conversation.title })}
        >
          <Avatar
            name={conversation.title}
            tone={conversation.avatarTone}
            src={conversation.imageUrl}
            size="md"
            status={
              conversation.type === "direct" ? conversation.status : undefined
            }
          />
          <span className="chat-person">
            <strong>{conversation.title}</strong>
            <span>
              {conversation.type === "group"
                ? t("header.memberCount", { count: conversation.memberCount ?? 1 })
                : conversation.status === "online"
                ? t("header.online")
                : t("header.recentlyActive")}
            </span>
          </span>
        </button>
      </header>
      <ConversationInfoPanel
        conversation={conversation}
        open={infoOpen}
        onOpenChange={setInfoOpen}
      />
    </>
  );
}
