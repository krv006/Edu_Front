import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/modules/auth";
import { toIntlLocale } from "@/shared/i18n";
import { AttendanceAccordion, useAttendance } from "@/modules/attendance";
import { AddStudentDialog, useCourse, useCourseStudents, useUnenrollStudent } from "@/modules/course";
import {
  AssignmentDetailDialog,
  useAssignments,
  useCreateAssignment,
  useDeleteAssignment,
  useUpdateAssignment,
} from "@/modules/homework";
import {
  FinishLessonDialog,
  LessonCalendar,
  LessonList,
  LessonRatingsDialog,
  LessonViewSwitch,
  LiveLessonBar,
  useCreateLesson,
  useCreateLessonSchedule,
  useDeleteLesson,
  useLessons,
  useLessonView,
  useUpdateLesson,
} from "@/modules/lesson";
import { ChatHeader } from "@/modules/conversation";
import { MessageComposer, MessageList } from "@/modules/message";
import type {
  Assignment,
  AttendanceRow,
  ChatMessage,
  Conversation,
  DomainUser,
  Enrollment,
  Lesson,
  SendMessagePayload,
} from "@/shared/types";
import type { ChatController } from "@/modules/message";
import type { Page } from "@/shared/api";
import { Avatar, Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { ROUTES } from "@/shared/config";
import {
  AddAssignmentDialog,
  AddLessonDialog,
  type LessonDraft,
  type LessonScheduleDraft,
} from "./group-action-dialogs";

type TabId = "chat" | "lessons" | "assignments" | "students" | "attendance";

function useTabs(): Array<{ id: TabId; label: string; icon: typeof BookOpen }> {
  const { t } = useTranslation("group");
  return [
    { id: "chat", label: t("tabs.chat"), icon: BookOpen },
    { id: "lessons", label: t("tabs.lessons"), icon: CalendarDays },
    { id: "assignments", label: t("tabs.assignments"), icon: ClipboardList },
    { id: "students", label: t("tabs.students"), icon: UsersRound },
    { id: "attendance", label: t("tabs.attendance"), icon: CheckCircle2 },
  ];
}


export interface GroupWorkspaceProps {
  conversation: Conversation;
  messages: ChatController["messages"];
  sendMessage: ChatController["sendMessage"];
  sendTyping: () => void;
  retryMessage: (message: ChatMessage) => void;
}

export function GroupWorkspace({
  conversation,
  messages,
  sendMessage,
  sendTyping,
  retryMessage,
}: GroupWorkspaceProps) {
  const { t } = useTranslation("group");
  const TABS = useTabs();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [reply, setReply] = useState<ChatMessage | null>(null);
  const courseId = conversation.courseId;

  const tabParam = params.get("tab") as TabId | null;
  const activeTab: TabId = TABS.some((item) => item.id === tabParam) ? (tabParam as TabId) : "chat";

  /**
   * Har bir bo'lim faqat o'zi ochilganda so'rov yuboradi.
   *
   * Avval beshalasi ham chat ochilishi bilan birdan ketardi — davomat va
   * o'quvchilar ro'yxati `page_size: 100` bilan og'ir, natijada foydalanuvchi
   * xabarlarni ko'rishdan oldin bir necha soniya kutardi. Kurs ma'lumoti
   * bundan mustasno: u chat sarlavhasini to'ldiradi.
   */
  const course = useCourse(courseId);
  // Davomat jadvali darslar ro'yxatiga tayanadi — u ikki bo'limda kerak.
  const lessons = useLessons(
    { course: courseId, page_size: 100 },
    activeTab === "lessons" || activeTab === "attendance"
  );
  const assignments = useAssignments(courseId, activeTab === "assignments");
  const students = useCourseStudents(courseId, { page_size: 100 }, activeTab === "students");
  const attendance = useAttendance({ page_size: 100 }, activeTab === "attendance");

  async function send(payload: SendMessagePayload) {
    try {
      await sendMessage.mutateAsync({
        ...payload,
        replyTo: reply ? { author: reply.senderName || t("replyFallback"), text: reply.text } : undefined,
      });
      setReply(null);
    } catch {
      toast.error(t("sendFailed"));
    }
  }

  /** Sarlavha kurs ma'lumoti bilan boyitiladi — chat xonasi faqat `title` beradi. */
  const hydrated: Conversation = {
    ...conversation,
    title: course.data?.title ?? conversation.title,
    subject: course.data?.subject,
    description: course.data?.description,
    memberCount: course.data?.studentCount ?? 0,
  };

  return (
    <section className="chat-page group-workspace">
      <ChatHeader conversation={hydrated} />
      {/* Jonli dars bo'lsa chat tepasida chiziq turadi — Telegram uslubi. */}
      <LiveLessonBar courseId={courseId} />
      <nav className="group-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "is-active" : ""}
              onClick={() => setParams(tab.id === "chat" ? {} : { tab: tab.id })}
            >
              {activeTab === tab.id ? (
                <motion.span layoutId="group-tab-indicator" className="group-tab-indicator" />
              ) : null}
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="group-tab-content"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
        >
          {activeTab === "chat" ? (
            <MessageList
              messages={messages.data}
              conversation={hydrated}
              loading={messages.isLoading}
              error={messages.isError}
              onRetry={messages.refetch}
              onRetryMessage={retryMessage}
              currentUserId={user?.id}
              onReply={setReply}
              onEdit={() => undefined}
              onDelete={() => undefined}
              onReact={() => undefined}
              capabilities={{ reply: true, edit: false, delete: false, react: false }}
            />
          ) : null}
          {activeTab === "lessons" ? (
            <LessonsPanel courseId={courseId} lessons={lessons.data} loading={lessons.isLoading} />
          ) : null}
          {activeTab === "assignments" ? (
            <AssignmentsPanel
              courseId={courseId}
              assignments={assignments.data}
              loading={assignments.isLoading}
              isLanguageSubject={Boolean(course.data?.isLanguageSubject)}
            />
          ) : null}
          {activeTab === "students" ? (
            <StudentsPanel courseId={courseId} page={students.data} loading={students.isLoading} />
          ) : null}
          {activeTab === "attendance" ? (
            <AttendancePanel
              lessons={lessons.data}
              rows={attendance.data}
              loading={attendance.isLoading}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      {activeTab === "chat" ? (
        <MessageComposer
          onSend={send}
          onTyping={sendTyping}
          sending={sendMessage.isPending}
          replyTo={reply}
          onCancelContext={() => setReply(null)}
          currentUserId={user?.id}
        />
      ) : null}
    </section>
  );
}

// ─── Darslar ────────────────────────────────────────────────────────────────
interface LessonsPanelProps {
  courseId: string | null;
  lessons?: Lesson[];
  loading: boolean;
}

function LessonsPanel({ courseId, lessons = [], loading }: LessonsPanelProps) {
  const { t } = useTranslation("group");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [finishTarget, setFinishTarget] = useState<Lesson | null>(null);
  const [ratingsTarget, setRatingsTarget] = useState<Lesson | null>(null);
  const navigate = useNavigate();
  const create = useCreateLesson();
  const createSchedule = useCreateLessonSchedule();
  const update = useUpdateLesson();
  const remove = useDeleteLesson();
  const { view, setView } = useLessonView();

  /**
   * To'qnashuvni tekshirish uchun o'qituvchining BARCHA darslari kerak —
   * shu kurs emas, hamma kurslari bo'yicha. Faqat dialog ochilganda so'raladi.
   */
  const allLessons = useLessons({ page_size: 200 }, dialog);

  function save(form: LessonDraft) {
    const payload = { ...form, courseId };
    const request = editing
      ? update.mutateAsync({ id: editing.id, form: payload })
      : create.mutateAsync(payload);
    return request.then(() => {
      setDialog(false);
      setEditing(null);
    });
  }

  function saveSchedule(draft: LessonScheduleDraft) {
    if (!courseId) return Promise.resolve();
    return createSchedule
      .mutateAsync({
        courseId,
        title: draft.topic,
        time: draft.time,
        durationMinutes: Number(draft.duration) || 45,
        weekdays: draft.weekdays,
        startsOn: draft.startsOn,
        endsOn: draft.endsOn,
        dates: draft.dates,
      })
      .then(() => {
        setDialog(false);
        setEditing(null);
      });
  }

  // Ikkala ko'rinish ham aynan shu amallarni oladi.
  const actions = {
    onJoin: (lesson: Lesson) => navigate(ROUTES.live(lesson.id)),
    onFinish: setFinishTarget,
    onRatings: setRatingsTarget,
    onDelete: setDeleteTarget,
    onRecording: (lesson: Lesson) => navigate(ROUTES.recording(lesson.id)),
    onEdit: (lesson: Lesson) => {
      setEditing(lesson);
      setDialog(true);
    },
  };

  return (
    <div className="group-panel">
      <div className="group-panel-head">
        <div>
          <span>{t("lessons.eyebrow")}</span>
          <h2>{t("lessons.title")}</h2>
          <p>{t("lessons.subtitle")}</p>
        </div>
        <div className="group-panel-tools">
          <LessonViewSwitch view={view} onChange={setView} />
          <Button
            onClick={() => {
              setEditing(null);
              setDialog(true);
            }}
          >
            <Plus size={17} /> {t("lessons.addLesson")}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="student-tab-loading">
          <span />
        </div>
      ) : view === "calendar" ? (
        <LessonCalendar lessons={lessons} {...actions} />
      ) : (
        <LessonList lessons={lessons} {...actions} />
      )}

      <AddLessonDialog
        key={editing?.id ?? "new-lesson"}
        open={dialog}
        onOpenChange={(open) => {
          setDialog(open);
          if (!open) setEditing(null);
        }}
        initialValues={editing}
        existingLessons={allLessons.data ?? []}
        onCreate={save}
        onCreateSchedule={saveSchedule}
      />
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        {deleteTarget && (
          <DialogContent title={t("lessons.deleteDialogTitle")} description={t("lessons.deleteDialogDescription", { title: deleteTarget.title })}>
            <div className="dialog-actions">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                {t("lessons.cancel")}
              </Button>
              <Button
                loading={remove.isPending}
                onClick={() => remove.mutateAsync(deleteTarget.id).then(() => setDeleteTarget(null))}
              >
                {t("lessons.delete")}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
      <FinishLessonDialog
        lesson={finishTarget}
        onOpenChange={(open) => {
          if (!open) setFinishTarget(null);
        }}
      />
      <LessonRatingsDialog
        lesson={ratingsTarget}
        onOpenChange={(open) => {
          if (!open) setRatingsTarget(null);
        }}
      />
    </div>
  );
}

// ─── Vazifalar ──────────────────────────────────────────────────────────────
interface AssignmentsPanelProps {
  courseId: string | null;
  assignments?: Assignment[];
  loading: boolean;
  /** Til fani bo'lsa vazifaga "tekshiruv turi" tanlovi beriladi. */
  isLanguageSubject: boolean;
}

/**
 * Bildirishnomadan kelingan vazifani ko'rsatadi: ro'yxatda ajratib qo'yadi va
 * ekranga suradi. Ro'yxat kechroq yuklanishi mumkin, shuning uchun element
 * paydo bo'lgach qidiriladi.
 */
function useAssignmentHighlight(assignmentId: string | null, ready: boolean) {
  useEffect(() => {
    if (!assignmentId || !ready) return;
    document
      .querySelector(`[data-assignment-id="${CSS.escape(assignmentId)}"]`)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [assignmentId, ready]);
}

function AssignmentsPanel({
  courseId,
  assignments = [],
  loading,
  isLanguageSubject,
}: AssignmentsPanelProps) {
  const { t, i18n } = useTranslation("group");
  const [dialog, setDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  /* Havola vazifani ajratib ko'rsatadi, dialogni o'zi ochmaydi. */
  const [assignmentParams] = useSearchParams();
  const highlightId = assignmentParams.get("assignment");
  useAssignmentHighlight(highlightId, (assignments?.length ?? 0) > 0);
  const create = useCreateAssignment();
  const update = useUpdateAssignment();
  const remove = useDeleteAssignment();

  // Vazifani darsga bog'lash uchun kurs darslari kerak — faqat dialog ochilganda.
  const lessons = useLessons({ course: courseId, page_size: 100 }, dialog);

  return (
    <div className="group-panel">
      <div className="group-panel-head">
        <div>
          <span>{t("assignments.eyebrow")}</span>
          <h2>{t("assignments.title")}</h2>
          <p>{t("assignments.subtitle")}</p>
        </div>
        <Button onClick={() => setDialog(true)}>
          <Plus size={17} /> {t("assignments.addAssignment")}
        </Button>
      </div>

      {loading ? (
        <div className="student-tab-loading">
          <span />
        </div>
      ) : assignments.length ? (
        <div className="assignment-list">
          {assignments.map((item) => (
            <motion.article
              key={item.id}
              data-assignment-id={item.id}
              className={`assignment-card ${item.id === highlightId ? "is-highlighted" : ""}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="assignment-card-icon">
                <ClipboardList size={20} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <small>
                  {item.dueAt
                    ? t("assignments.dueLabel", {
                        date: new Intl.DateTimeFormat(toIntlLocale(i18n.language), {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(item.dueAt)),
                      })
                    : t("assignments.noDue")}{" "}
                  · {t("assignments.submissionsCount", { count: item.submissionsCount ?? 0 })}
                </small>
                {/* Umumiy ro'yxatda vazifa qaysi darsga tegishli ekani ko'rinsin. */}
                {item.lessonTitle ? (
                  <span className="assignment-lesson-tag">
                    <CalendarDays size={12} /> {item.lessonTitle}
                  </span>
                ) : null}
              </div>
              <span className="assignment-subject">{item.subject}</span>
              <Button size="sm" variant="secondary" onClick={() => setDetailId(item.id)}>
                <CheckCircle2 size={15} /> {t("assignments.results")}
              </Button>
              <button
                className="icon-button"
                onClick={() => {
                  setEditingAssignment(item);
                  setDialog(true);
                }}
                aria-label={t("assignments.editAria")}
                title={t("assignments.editTitle")}
              >
                <Pencil size={16} />
              </button>
              <button
                className="icon-button destructive-icon"
                onClick={() => setDeleteTarget(item)}
                aria-label={t("assignments.deleteAria")}
              >
                <Trash2 size={16} />
              </button>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="premium-empty">
          <ClipboardList size={30} />
          <h3>{t("assignments.emptyTitle")}</h3>
          <Button onClick={() => setDialog(true)}>{t("assignments.emptyCreateFirst")}</Button>
        </div>
      )}

      <AddAssignmentDialog
        // Tahrirlanadigan vazifa almashsa forma qayta boshlab to'ldirilsin —
        // aks holda ichki state eski vazifadan qolib ketardi.
        key={editingAssignment?.id ?? "new"}
        open={dialog}
        onOpenChange={(open) => {
          setDialog(open);
          if (!open) setEditingAssignment(null);
        }}
        lessons={lessons.data ?? []}
        isLanguageSubject={isLanguageSubject}
        initialValues={editingAssignment}
        onCreate={(form) => {
          const payload = { ...form, courseId };
          const request = editingAssignment
            ? update.mutateAsync({ id: editingAssignment.id, form: payload })
            : create.mutateAsync(payload);
          request.then(() => {
            setDialog(false);
            setEditingAssignment(null);
          });
        }}
      />
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        {deleteTarget && (
          <DialogContent
            title={t("assignments.deleteDialogTitle")}
            description={t("assignments.deleteDialogDescription", { title: deleteTarget.title })}
          >
            <div className="dialog-actions">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                {t("assignments.cancel")}
              </Button>
              <Button
                loading={remove.isPending}
                onClick={() => remove.mutateAsync(deleteTarget.id).then(() => setDeleteTarget(null))}
              >
                {t("assignments.delete")}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
      <AssignmentDetailDialog
        assignmentId={detailId}
        open={Boolean(detailId)}
        onOpenChange={(open: boolean) => {
          if (!open) setDetailId(null);
        }}
      />
    </div>
  );
}

// ─── O‘quvchilar ────────────────────────────────────────────────────────────
interface StudentsPanelProps {
  courseId: string | null;
  page?: Page<Enrollment>;
  loading: boolean;
}

function StudentsPanel({ courseId, page, loading }: StudentsPanelProps) {
  const { t } = useTranslation("group");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<DomainUser | null>(null);
  const unenroll = useUnenrollStudent();

  const students = useMemo(
    () =>
      (page?.items ?? [])
        .map((item) => item.student)
        .filter((item) => `${item.name} ${item.username}`.toLowerCase().includes(search.toLowerCase())),
    [page, search]
  );

  function confirmRemove() {
    if (!removeTarget) return;
    unenroll.mutate(
      { courseId, studentId: removeTarget.id },
      { onSuccess: () => setRemoveTarget(null) }
    );
  }

  return (
    <div className="group-panel">
      <div className="group-panel-head">
        <div>
          <span>{t("students.eyebrow")}</span>
          <h2>{t("students.title")}</h2>
          <p>{t("students.countSuffix", { count: page?.total ?? 0 })}</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus size={17} /> {t("students.addStudent")}
        </Button>
      </div>

      <label className="student-search">
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("students.searchPlaceholder")}
        />
      </label>

      {loading ? (
        <div className="student-tab-loading">
          <span />
        </div>
      ) : (
        <div className="student-grid">
          {students.map((student) => (
            <article className="student-card" key={student.id}>
              <Avatar name={student.name} tone={student.avatarTone} size="md" />
              <div>
                <strong>{student.name}</strong>
                <span>@{student.username}</span>
              </div>
              <button
                className="icon-button destructive-icon"
                aria-label={t("students.removeAria", { name: student.name })}
                onClick={() => setRemoveTarget(student)}
              >
                <UserMinus size={16} />
              </button>
            </article>
          ))}
          {!students.length ? <p className="portal-muted">{t("students.empty")}</p> : null}
        </div>
      )}

      <AddStudentDialog courseId={courseId} open={addOpen} onOpenChange={setAddOpen} />
      <Dialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        {removeTarget && (
          <DialogContent
            title={t("students.removeDialogTitle")}
            description={t("students.removeDialogDescription", { name: removeTarget.name })}
          >
            <div className="dialog-actions">
              <Button variant="secondary" onClick={() => setRemoveTarget(null)}>
                {t("students.cancel")}
              </Button>
              <Button loading={unenroll.isPending} onClick={confirmRemove}>
                {t("students.remove")}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

// ─── Davomat ────────────────────────────────────────────────────────────────
interface AttendancePanelProps {
  lessons?: Lesson[];
  rows?: AttendanceRow[];
  loading: boolean;
}

function AttendancePanel({ lessons = [], rows = [], loading }: AttendancePanelProps) {
  const { t } = useTranslation("group");
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const filtered = rows.filter((row) => lessonIds.has(row.lessonId));
  const lessonCount = new Set(filtered.map((row) => row.lessonId)).size;

  if (loading)
    return (
      <div className="student-tab-loading">
        <span />
      </div>
    );

  return (
    <div className="group-panel">
      <div className="group-panel-head">
        <div>
          <span>{t("attendance.eyebrow")}</span>
          <h2>{t("attendance.title")}</h2>
          <p>{t("attendance.summary", { lessonCount, recordCount: filtered.length })}</p>
        </div>
      </div>
      <AttendanceAccordion rows={filtered} emptyLabel={t("attendance.empty")} />
    </div>
  );
}
