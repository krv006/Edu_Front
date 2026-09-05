import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, UserRoundPlus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ConversationItem,
  matchesConversationFilter,
  NewConversationDialog,
  useConversationFilter,
  useConversations,
  useRequestDirect,
  useTeachersForDirect,
  type ConversationFilter,
  type DirectTeacher,
} from "@/modules/conversation";
import { useLiveLessons } from "@/modules/lesson";
import { homeworkApi, homeworkKeys } from "@/modules/homework";
import { NotificationBell, type NotificationLink } from "@/modules/notification";
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data = [], isLoading, isError, refetch } = useConversations(role);
  const isTeacher = role === "teacher";
  const basePath = isTeacher ? "/teacher/chats" : "/student/chats";

  /**
   * Telegram uslubi: qidiruvda mavjud suhbatlardan tashqari ODAM ham topiladi.
   *
   * O'quvchi uchun `GET /chat/rooms/teachers/` ishlatiladi — bu unga ochiq
   * yagona odam ro'yxati. O'qituvchida bunday qidiruv yo'q: shaxsiy suhbatni
   * faqat o'quvchi boshlay oladi (backend o'qituvchidan so'rovni qabul
   * qilmaydi), shuning uchun unga topilgan odam bilan qiladigan ish qolmaydi.
   */
  const query = search.trim();
  const peopleEnabled = !isTeacher && query.length >= 2;
  const teachers = useTeachersForDirect(peopleEnabled);
  const requestDirect = useRequestDirect();

  /**
   * Qaysi guruhda dars ketyapti — chatga kirmasdan ko'rinishi uchun.
   * Dars kurs bilan bog'langan, chat ham: bog'lovchi kalit `courseId`.
   */
  const liveLessons = useLiveLessons(Boolean(user)).data;
  const liveCourses = useMemo(
    () => new Set((liveLessons ?? []).map((lesson) => lesson.courseId)),
    [liveLessons]
  );

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

  /** Allaqachon suhbati borlar ro'yxatda chiqadi — ularni takrorlamaymiz. */
  const people = useMemo(() => {
    if (!peopleEnabled) return [];
    const lowered = query.toLowerCase();
    const existing = new Set(data.map((item) => item.participantId).filter(Boolean));
    return (teachers.data ?? []).filter(
      (teacher) =>
        !existing.has(teacher.id) &&
        `${teacher.name} ${teacher.username}`.toLowerCase().includes(lowered)
    );
  }, [peopleEnabled, query, data, teachers.data]);

  /*
   * Bildirishnomadagi havolani ochish.
   *
   * Vazifa xabari faqat vazifa id'sini beradi, vazifa esa o'z guruh chatining
   * "Vazifalar" bo'limida yashaydi. Shuning uchun avval vazifa olinadi
   * (`courseId` uchun), so'ng shu kursning suhbati topiladi. Test esa endi
   * (rail'dagi) umumiy "Testlar" bo'limida — kurs/xona qidirish shart emas.
   */
  const queryClient = useQueryClient();

  async function openNotificationLink(link: NotificationLink) {
    if (link.type === "assignment") {
      try {
        const assignment = await queryClient.fetchQuery({
          queryKey: homeworkKeys.assignment(link.id),
          queryFn: ({ signal }) => homeworkApi.getAssignment(link.id, { signal }),
        });
        const room = data.find((item) => item.courseId === assignment.courseId);
        if (!room) {
          toast.error("Vazifa guruhi topilmadi");
          return;
        }
        navigate(`${basePath}/${room.id}?tab=assignments&assignment=${link.id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Vazifani ochib bo‘lmadi");
      }
      return;
    }
    if (link.type === "quiz") {
      navigate(`${basePath}/quizzes?quiz=${link.id}`);
    }
  }

  function startDirect(teacher: DirectTeacher) {
    if (teacher.roomId) {
      navigate(`${basePath}/${teacher.roomId}`);
      return;
    }
    requestDirect.mutate(teacher.id, {
      onSuccess: (room) => {
        toast.success(
          room.directStatus === "active"
            ? "Suhbat ochildi"
            : "So‘rov yuborildi — o‘qituvchi tasdiqlashi kerak"
        );
        setSearch("");
        setSearchOpen(false);
        if (room.directStatus === "active") navigate(`${basePath}/${room.id}`);
      },
      onError: (error: Error) => toast.error(error.message),
    });
  }

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
          <NotificationBell enabled={Boolean(user)} onOpenLink={openNotificationLink} />
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
              live={Boolean(conversation.courseId && liveCourses.has(conversation.courseId))}
            />
          ))}
        {people.length ? (
          <>
            <span className="conversation-list-label">ODAMLAR</span>
            {people.map((teacher) => (
              <button
                key={teacher.id}
                type="button"
                className="conversation-person"
                disabled={requestDirect.isPending}
                onClick={() => startDirect(teacher)}
              >
                <Avatar name={teacher.name} size="lg" />
                <span>
                  <strong>{teacher.name}</strong>
                  <small>@{teacher.username}</small>
                </span>
                <UserRoundPlus size={17} />
              </button>
            ))}
          </>
        ) : null}

        {!isLoading && !isError && visible.length === 0 && !people.length && (
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
