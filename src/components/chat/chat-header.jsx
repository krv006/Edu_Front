import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar } from "../ui/avatar";

import { ConversationInfoPanel } from "./conversation-info-panel";

export function ChatHeader({ conversation, backTo = "/teacher/chats" }) {
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
        <div className="chat-actions">
          <button
            className="icon-button"
            onClick={() =>
              toast.info("Chat ichida qidiruv keyingi yangilanishda qo‘shiladi")
            }
            aria-label="Chatda qidirish"
          >
            <Search size={19} />
          </button>
        </div>
      </header>
      <ConversationInfoPanel
        conversation={conversation}
        open={infoOpen}
        onOpenChange={setInfoOpen}
      />
    </>
  );
}
