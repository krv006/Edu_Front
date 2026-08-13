import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  ConversationItem,
  matchesConversationFilter,
  NewConversationDialog,
  useConversationFilter,
  useConversations,
  type ConversationFilter,
} from "@/modules/conversation";
import { NotificationBell } from "@/modules/notification";
import { Avatar } from "@/shared/ui/legacy";
import { useAuth } from "@/modules/auth";
import { StudentEnrollmentDialog } from "@/modules/student";
import type { ConversationRole } from "@/shared/types";

/**
 * Suhbat turlari — ro'yxat tepasidagi tugmachalar (Teams uslubi).
 * Ular BO'LIM emas, filtr: shuning uchun ustunda emas, shu yerda turadi.
 */
const FILTERS: Array<{ id: ConversationFilter; label: string }> = [
  { id: "all", label: "Barchasi" },
  { id: "direct", label: "Shaxsiy" },
  { id: "group", label: "Guruhlar" },
  { id: "unread", label: "O‘qilmagan" },
];

export interface ConversationPanelProps {
  role?: ConversationRole;
  /** Menyu layout darajasida turadi — panel faqat ochilishini so'raydi. */
  onOpenMenu: () => void;
}

export function ConversationPanel({ role = "teacher", onOpenMenu }: ConversationPanelProps) {
  const [search, setSearch] = useState("");
  // Panel qayta mount bo'lganda ham tanlov saqlanib qolishi kerak — shuning
  // uchun komponentdan tashqarida (izohi store faylida).
  const { filter, setFilter } = useConversationFilter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { data = [], isLoading, isError, refetch } = useConversations(role);
  const isTeacher = role === "teacher";
  const basePath = isTeacher ? "/teacher/chats" : "/student/chats";

  const visible = useMemo(
    () =>
      data.filter((item) => {
        const searchMatches = `${item.title} ${item.lastMessage}`
          .toLowerCase()
          .includes(search.toLowerCase());
        return searchMatches && matchesConversationFilter(item, filter);
      }),
    [data, search, filter]
  );

  useEffect(() => {
    if (!searchOpen) return undefined;
    function closeSearch(event: PointerEvent) {
      if (searchRef.current?.contains(event.target as Node)) return;
      setSearch("");
      setSearchOpen(false);
    }
    document.addEventListener("pointerdown", closeSearch);
    return () => document.removeEventListener("pointerdown", closeSearch);
  }, [searchOpen]);

  return (
    <section
      className={`conversation-panel ${conversationId ? "has-active-chat" : ""}`}
      aria-label="Suhbatlar ro‘yxati"
    >
      <div className="conversation-panel-header">
        <div className="panel-topbar">
          <div className="panel-search-zone" ref={searchRef}>
            <AnimatePresence initial={false} mode="popLayout">
              {searchOpen ? (
                <motion.label
                  key="search"
                  className="search-field panel-top-search"
                  initial={{ opacity: 0, scaleX: 0.88 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0.9 }}
                  transition={{ duration: 0.18 }}
                >
                  <Search size={17} />
                  <input
                    autoFocus
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Suhbatlarni qidirish"
                    aria-label="Suhbatlarni qidirish"
                  />
                  <button
                    onClick={() => {
                      setSearch("");
                      setSearchOpen(false);
                    }}
                    aria-label="Qidiruvni yopish"
                  >
                    <X size={15} />
                  </button>
                </motion.label>
              ) : (
                <motion.button
                  key="search-button"
                  className="panel-search-button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Qidiruvni ochish"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Search size={19} />
                  <span>Qidirish</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <NotificationBell enabled={Boolean(user)} />
          <button className="panel-account" onClick={onOpenMenu} aria-label="Profil menyusi">
            <Avatar name={user?.name ?? "Teacher"} tone="violet" size="sm" status="online" />
          </button>
        </div>

        <div className="conversation-filter-pills" role="tablist" aria-label="Suhbat turlari">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={filter === item.id}
              className={filter === item.id ? "is-active" : ""}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="conversation-list">
        {isLoading &&
          Array.from({ length: 6 }, (_, index) => (
            <div className="conversation-skeleton" key={index}>
              <span />
              <div>
                <i />
                <i />
              </div>
            </div>
          ))}
        {isError && (
          <div className="panel-state">
            <strong>Suhbatlarni yuklab bo‘lmadi</strong>
            <p>Internet aloqasini tekshirib, qayta urinib ko‘ring.</p>
            <button onClick={() => refetch()}>Qayta urinish</button>
          </div>
        )}
        {!isLoading &&
          !isError &&
          visible.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === conversationId}
              basePath={basePath}
            />
          ))}
        {!isLoading && !isError && visible.length === 0 && (
          <div className="panel-state panel-state--empty">
            <span>
              <Search size={22} />
            </span>
            <strong>Suhbat topilmadi</strong>
            <p>Qidiruv so‘zi yoki filterni o‘zgartirib ko‘ring.</p>
            <button
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>

      <motion.button
        className="new-conversation-fab"
        onClick={() => setDialogOpen(true)}
        aria-label={isTeacher ? "Yangi guruh yoki suhbat yaratish" : "O‘qituvchi yoki kurs topish"}
        whileHover={{ y: -3, scale: 1.03 }}
        whileTap={{ scale: 0.94 }}
      >
        <Plus size={18} />
      </motion.button>

      {isTeacher ? (
        <NewConversationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      ) : (
        <StudentEnrollmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      )}
    </section>
  );
}
