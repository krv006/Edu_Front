import { ArrowRight, MessageCircleMore, Sparkles } from "lucide-react";

export function ChatEmptyState({ onOpenConversations }: { onOpenConversations?: () => void }) {
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
      <h2>Suhbatni tanlang</h2>
      <p>
        Xabarlarni ko‘rish va davom ettirish uchun chap tomondagi suhbatlardan
        birini tanlang.
      </p>
      <button onClick={onOpenConversations}>
        Suhbatlarni ochish <ArrowRight size={17} />
      </button>
    </section>
  );
}
