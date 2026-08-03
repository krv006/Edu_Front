import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Plus, Search, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { useConversations } from "@/modules/conversation";
import { ConversationItem } from "../chat/conversation-item";
import { NewConversationDialog } from "../chat/new-conversation-dialog";
import { Avatar } from "../ui/avatar";
import { useAuth } from "@/app/providers";
import { StudentEnrollmentDialog } from "@/modules/student";
import { TeacherMenu } from "./teacher-menu";

const filters = [
  { id: "all", label: "Barchasi" },
  { id: "direct", label: "Shaxsiy" },
  { id: "group", label: "Guruhlar" },
  { id: "unread", label: "O‘qilmagan" },
];

export function ConversationPanel({ role = "teacher" }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
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
        const filterMatches =
          filter === "all" ||
          item.type === filter ||
          (filter === "unread" && item.unreadCount > 0);
        return searchMatches && filterMatches;
      }),
    [data, search, filter]
  );

  useEffect(() => {
    if (!searchOpen) return undefined;
    function closeSearch(event) {
      if (searchRef.current?.contains(event.target)) return;
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
      <div className="conversation-panel-header">
        <div className="panel-topbar">
          <button
            className="panel-menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Profil menyusini ochish"
          >
            <Menu size={21} />
          </button>
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

        <nav className="conversation-filter-tabs" aria-label="Suhbat turlari">
          {filters.map((item) => (
            <button
              key={item.id}
              className={filter === item.id ? "is-active" : ""}
              onClick={() => setFilter(item.id)}
            >
              {filter === item.id && (
                <motion.span
                  layoutId="conversation-filter-indicator"
                  className="conversation-filter-indicator"
                />
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
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
      <TeacherMenu
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
