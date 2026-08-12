import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/shared/ui/legacy";

import { ConversationInfoPanel } from "./conversation-info-panel";
import type { Conversation } from "@/shared/types";

export interface ChatHeaderProps {
  conversation: Conversation;
  backTo?: string;
}

export function ChatHeader({ conversation, backTo = "/teacher/chats" }: ChatHeaderProps) {
  const navigate = useNavigate();
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <>
      <header className="chat-header">
        <button
          className="icon-button chat-back"
          onClick={() => navigate(backTo)}
          aria-label="Suhbatlar ro‘yxatiga qaytish"
        >
          <ArrowLeft size={21} />
        </button>
        <button
          className="chat-identity"
          onClick={() => setInfoOpen(true)}
          aria-label={`${conversation.title} ma’lumotlarini ochish`}
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
                ? `${conversation.memberCount ?? 1} o‘quvchi`
                : conversation.status === "online"
                ? "Hozir onlayn"
                : "Yaqinda faol edi"}
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
