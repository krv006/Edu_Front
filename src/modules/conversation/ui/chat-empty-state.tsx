import { ArrowRight, MessageCircleMore, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ChatEmptyState({ onOpenConversations }: { onOpenConversations?: () => void }) {
  const { t } = useTranslation("chat");
  return (
    <section className="chat-empty-state">
      <div className="empty-visual">
        <span className="empty-orbit empty-orbit--one" />
        <span className="empty-orbit empty-orbit--two" />
        <div className="empty-icon">
          <MessageCircleMore size={34} />
          <span>
            <Sparkles size={14} />
          </span>
        </div>
      </div>
      <h2>{t("emptyState.title")}</h2>
      <p>{t("emptyState.description")}</p>
      <button onClick={onOpenConversations}>
        {t("emptyState.openConversations")} <ArrowRight size={17} />
      </button>
    </section>
  );
}
