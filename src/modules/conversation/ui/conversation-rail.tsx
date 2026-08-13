import { CalendarDays, Menu, MessagesSquare, Sparkles } from "lucide-react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import type { ConversationRole } from "@/shared/types";
import { useConversations } from "../model/use-conversations";

/** Ustundagi asosiy bo'lim — Teams uslubi: ikonka tepada, yozuv ostida. */
export type ConversationSection = "chat" | "schedule" | "ai";

const SECTIONS: Array<{
  id: ConversationSection;
  label: string;
  icon: typeof MessagesSquare;
  /** Suhbatlar bo'limiga nisbatan yo'l; bo'sh bo'lsa — o'zi. */
  path: string;
}> = [
  { id: "chat", label: "Chat", icon: MessagesSquare, path: "" },
  { id: "schedule", label: "Kalendar", icon: CalendarDays, path: "/schedule" },
  { id: "ai", label: "AI", icon: Sparkles, path: "/ai" },
];

export interface ConversationRailProps {
  role: ConversationRole;
  section: ConversationSection;
  onOpenMenu: () => void;
}

/**
 * Asosiy bo'limlar ustuni.
 *
 * Ataylab `ConversationPanel` dan TASHQARIDA turadi: kalendar va AI
 * bo'limlarida suhbatlar ustuni butunlay yopiladi, panel ichida bo'lganda
 * esa u bilan birga bu ham yo'qolib, qaytishning iloji qolmasdi.
 *
 * Suhbat turlari (Shaxsiy/Guruhlar/O'qilmagan) bu yerda emas — ular
 * ro'yxat tepasidagi tugmachalarda, chunki ular bo'lim emas, filtr.
 */
export function ConversationRail({ role, section, onOpenMenu }: ConversationRailProps) {
  const navigate = useNavigate();
  const { data = [] } = useConversations(role);
  const basePath = role === "teacher" ? "/teacher/chats" : "/student/chats";
  const chatsPath = useResolvedPath(basePath).pathname;

  /** Chat yonidagi nishoncha — o'qilmagan suhbatlar soni. */
  const unreadChats = data.filter((conversation) => conversation.unreadCount > 0).length;

  return (
    <nav className="conversation-rail" aria-label="Bo‘limlar">
      {/* Yozuvsiz — hamburger o'zi tushunarli, yorlig'i faqat aria uchun. */}
      <button
        className="conversation-rail-menu"
        onClick={onOpenMenu}
        aria-label="Profil menyusini ochish"
      >
        <Menu size={24} />
      </button>

      {SECTIONS.map((item) => {
        const Icon = item.icon;
        const active = section === item.id;
        return (
          <button
            key={item.id}
            className={active ? "is-active" : ""}
            aria-current={active ? "page" : undefined}
            onClick={() => navigate(`${chatsPath}${item.path}`)}
          >
            <Icon size={24} />
            <span>{item.label}</span>
            {item.id === "chat" && unreadChats ? (
              <i className="conversation-rail-badge">{unreadChats}</i>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
