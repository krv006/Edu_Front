import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Menu, MessagesSquare, Plus, Search, UserRound, UsersRound, X } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  ConversationItem,
  NewConversationDialog,
  useConversationFilter,
  useConversations,
  type ConversationFilter,
} from "@/modules/conversation";
import { NotificationBell } from "@/modules/notification";
import { Avatar } from "@/shared/ui/legacy";
import { useAuth } from "@/modules/auth";
import { StudentEnrollmentDialog } from "@/modules/student";
import { AccountMenu } from "@/widgets/account-menu";
import type { Conversation, ConversationRole } from "@/shared/types";


/** Telegram uslubidagi chap panel: ikonka tepada, yozuv ostida. */
const FILTERS: Array<{ id: ConversationFilter; label: string; icon: typeof MessagesSquare }> = [
  { id: "all", label: "Barchasi", icon: MessagesSquare },
  { id: "direct", label: "Shaxsiy", icon: UserRound },
  { id: "group", label: "Guruhlar", icon: UsersRound },
  { id: "unread", label: "O‘qilmagan", icon: Mail },
];

/** Filtr shartini bitta joyda saqlaymiz — ro'yxat ham, nishoncha ham shundan foydalanadi. */
function matchesFilter(conversation: Conversation, filter: ConversationFilter): boolean {
  if (filter === "all") return true;
  if (filter === "unread") return conversation.unreadCount > 0;
  return conversation.type === filter;
}

export interface ConversationPanelProps {
  role?: ConversationRole;
}

export function ConversationPanel({ role = "teacher" }: ConversationPanelProps) {
  const [search, setSearch] = useState("");
  // Panel qayta mount bo'lganda ham tanlov saqlanib qolishi kerak — shuning
  // uchun komponentdan tashqarida (izohi store faylida).
  const { filter, setFilter } = useConversationFilter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
        return searchMatches && matchesFilter(item, filter);
      }),
    [data, search, filter]
  );

  /** Har bo'lim yonidagi nishoncha — o'qilmagan suhbatlar soni. */
  const unreadByFilter = useMemo(() => {
    const counts = {} as Record<ConversationFilter, number>;
    for (const item of FILTERS) {
      counts[item.id] = data.filter(
        (conversation) => conversation.unreadCount > 0 && matchesFilter(conversation, item.id)
      ).length;
    }
    return counts;
  }, [data]);

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
      className={`conversation-panel ${
        conversationId ? "has-active-chat" : ""
      }`}
      aria-label="Suhbatlar ro‘yxati"
    >
      {/* Telegram uslubidagi chap panel — ikonka tepada, yozuv ostida. */}
      <nav className="conversation-rail" aria-label="Suhbat turlari">
        {/* Yozuvsiz — hamburger o'zi tushunarli, yorlig'i faqat aria uchun. */}
        <button
          className="conversation-rail-menu"
          onClick={() => setMenuOpen(true)}
          aria-label="Profil menyusini ochish"
        >
          <Menu size={24} />
        </button>

        {FILTERS.map((item) => {
          const Icon = item.icon;
          const active = filter === item.id;
          const unread = unreadByFilter[item.id] ?? 0;
          return (
            <button
              key={item.id}
              className={active ? "is-active" : ""}
              aria-current={active ? "page" : undefined}
              onClick={() => setFilter(item.id)}
            >
              <Icon size={24} />
              <span>{item.label}</span>
              {unread ? <i className="conversation-rail-badge">{unread}</i> : null}
            </button>
          );
        })}
      </nav>

      <div className="conversation-panel-body">
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
          <button
            className="panel-account"
            onClick={() => setMenuOpen(true)}
            aria-label="Profil menyusi"
          >
            <Avatar
              name={user?.name ?? "Teacher"}
              tone="violet"
              size="sm"
              status="online"
            />
          </button>
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
      </div>

      {isTeacher ? (
        <NewConversationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      ) : (
        <StudentEnrollmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      )}
      <AccountMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        profileOpen={profileOpen}
        onProfileOpenChange={setProfileOpen}
        roleLabel={isTeacher ? "O‘qituvchi" : "O‘quvchi"}
        workspaceLabel={isTeacher ? "Teacher workspace" : "Student workspace"}
      />
    </section>
  );
}
