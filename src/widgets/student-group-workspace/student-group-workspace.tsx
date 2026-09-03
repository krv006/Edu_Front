import { useEffect, useState } from "react";
import { formatDayTime } from "@/shared/lib";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  FileQuestion,
  History,
  ListChecks,
  Paperclip,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ChatHeader } from "@/modules/conversation";
import { useCourse } from "@/modules/course";
import { MessageComposer, MessageList } from "@/modules/message";
import {
  HomeworkResultDialog,
  useAssignments,
  useDownloadAssignmentFile,
  useSubmission,
  useSubmitHomework,
} from "@/modules/homework";
import {
  LessonCalendar,
  LessonList,
  LessonViewSwitch,
  LiveLessonBar,
  RateLessonDialog,
  useLessons,
  useLessonView,
} from "@/modules/lesson";
import { QuizAttemptDialog, QuizAttemptsDialog, useQuizzes } from "@/modules/quiz";
import type {
  Assignment,
  ChatMessage,
  Conversation,
  Lesson,
  QuizSummary,
  SendMessagePayload,
  Submission,
} from "@/shared/types";
import type { ChatController } from "@/modules/message";
import { ROUTES } from "@/shared/config";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";

type TabId = "chat" | "lessons" | "assignments" | "quizzes";

const TABS: Array<{ id: TabId; label: string; icon: typeof BookOpen }> = [
  { id: "chat", label: "Chat", icon: BookOpen },
  { id: "lessons", label: "Darslar", icon: CalendarDays },
  { id: "assignments", label: "Vazifalar", icon: ListChecks },
  { id: "quizzes", label: "Testlar", icon: FileQuestion },
];

const SPEAKING_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.docx,.mp3,.wav,.m4a,.ogg";
const DEFAULT_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.docx";

function isAssignmentOverdue(assignment: Assignment): boolean {
  if (!assignment.dueAt || assignment.mySubmission) return false;
  const deadline = Date.parse(assignment.dueAt);
  return Number.isFinite(deadline) && deadline < Date.now();
}

export interface StudentGroupWorkspaceProps {
  conversation: Conversation;
  messages: ChatController["messages"];
  sendMessage: ChatController["sendMessage"];
  sendTyping: () => void;
  retryMessage: (message: ChatMessage) => void;
  currentUserId?: string;
}

export function StudentGroupWorkspace({
  conversation,
  messages,
  sendMessage,
  sendTyping,
  retryMessage,
  currentUserId,
}: StudentGroupWorkspaceProps) {
  const [params, setParams] = useSearchParams();
  const [reply, setReply] = useState<ChatMessage | null>(null);
  const courseId = conversation.courseId;

  const tabParam = params.get("tab") as TabId | null;
  const active: TabId = TABS.some((item) => item.id === tabParam) ? (tabParam as TabId) : "chat";

  // Darslar va vazifalar faqat o'z bo'limi ochilganda so'raladi — chatni
  // ochish uchun ular kutilib turilmasin.
  const lessons = useLessons({ course: courseId, page_size: 100 }, active === "lessons");
  const assignments = useAssignments(courseId, active === "assignments");
  const quizzes = useQuizzes(courseId, active === "quizzes");

  /**
   * O'quvchi guruh a'zolari ro'yxatini ko'ra olmaydi
   * (`GET /courses/{id}/students/` faqat o'qituvchi va adminga ochiq), lekin
   * kurs ma'lumotida `student_count` bor va u barcha rollarga beriladi —
   * shundan a'zolar SONI olinadi.
   */
  const course = useCourse(courseId);

  const hydrated: Conversation = {
    ...conversation,
    title: course.data?.title ?? conversation.title,
    subject: course.data?.subject,
    description: course.data?.description,
    memberCount: course.data?.studentCount ?? conversation.memberCount,
  };

  async function send(payload: SendMessagePayload) {
    try {
      await sendMessage.mutateAsync({
        ...payload,
        replyTo: reply ? { author: reply.senderName || "Javob", text: reply.text } : undefined,
      });
      setReply(null);
    } catch {
      toast.error("Xabar yuborilmadi");
    }
  }

  return (
    <section className="chat-page group-workspace student-group-workspace">
      <ChatHeader conversation={hydrated} backTo="/student/chats" />
      {/* Jonli dars bo'lsa chat tepasida chiziq turadi — Telegram uslubi. */}
      <LiveLessonBar courseId={courseId} />
      <nav className="group-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={active === tab.id ? "is-active" : ""}
              onClick={() => setParams(tab.id === "chat" ? {} : { tab: tab.id })}
            >
              {active === tab.id ? (
                <motion.span layoutId="student-group-tab" className="group-tab-indicator" />
              ) : null}
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="group-tab-content"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {active === "chat" ? (
            <MessageList
              messages={messages.data}
              conversation={hydrated}
              loading={messages.isLoading}
              error={messages.isError}
              onRetry={messages.refetch}
              onRetryMessage={retryMessage}
              currentUserId={currentUserId}
              onReply={setReply}
              onEdit={() => undefined}
              onDelete={() => undefined}
              onReact={() => undefined}
              capabilities={{ reply: true, edit: false, delete: false, react: false }}
            />
          ) : null}
          {active === "lessons" ? (
            <StudentLessons
              lessons={lessons.data}
              loading={lessons.isLoading}
              currentUserId={currentUserId}
            />
          ) : null}
          {active === "assignments" ? (
            <StudentAssignments assignments={assignments.data} loading={assignments.isLoading} />
          ) : null}
          {active === "quizzes" ? (
            <StudentQuizzes quizzes={quizzes.data} loading={quizzes.isLoading} />
          ) : null}
        </motion.div>
      </AnimatePresence>

      {active === "chat" ? (
        <MessageComposer
          onSend={send}
          onTyping={sendTyping}
          sending={sendMessage.isPending}
          replyTo={reply}
          currentUserId={currentUserId}
          onCancelContext={() => setReply(null)}
        />
      ) : null}
    </section>
  );
}

// ─── Darslar (ko‘rish + tugagan darsni baholash) ────────────────────────────
/**
 * O'qituvchidagi bilan AYNAN bir xil ko'rinish: ro'yxat ⇄ kalendar
 * almashtirgichi va o'sha komponentlar. Farq faqat amallar to'plamida —
 * o'quvchi darsni tahrirlay, o'chira yoki yakunlay olmaydi.
 */
function StudentLessons({
  lessons = [],
  loading,
  currentUserId,
}: {
  lessons?: Lesson[];
  loading: boolean;
  currentUserId?: string;
}) {
  const navigate = useNavigate();
  const [rateTarget, setRateTarget] = useState<Lesson | null>(null);
  const { view, setView } = useLessonView();

  const actions = {
    onJoin: (lesson: Lesson) => navigate(ROUTES.live(lesson.id)),
    onRecording: (lesson: Lesson) => navigate(ROUTES.recording(lesson.id)),
    onRate: setRateTarget,
  };

  return (
    <div className="group-panel student-readonly-panel">
      <div className="group-panel-head">
        <div>
          <span>KURS DARSLARI</span>
          <h2>Darslar</h2>
        </div>
        <div className="group-panel-tools">
          <LessonViewSwitch view={view} onChange={setView} />
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

      <RateLessonDialog
        lesson={rateTarget}
        currentUserId={currentUserId}
        onOpenChange={(open) => {
          if (!open) setRateTarget(null);
        }}
      />
    </div>
  );
}

// ─── Vazifalar ──────────────────────────────────────────────────────────────
function AttachmentButton({ assignment }: { assignment: Assignment }) {
  const download = useDownloadAssignmentFile();
  if (!assignment.hasAttachment) return null;
  return (
    <button
      className="icon-button"
      aria-label="Vazifa faylini yuklab olish"
      disabled={download.isPending}
      onClick={() =>
        download.mutate({ id: assignment.id, fileName: assignment.attachmentName || assignment.title })
      }
    >
      <Paperclip size={16} />
    </button>
  );
}

function AttachmentDownloadRow({ assignment }: { assignment: Assignment }) {
  const download = useDownloadAssignmentFile();
  return (
    <Button
      variant="secondary"
      loading={download.isPending}
      onClick={() =>
        download.mutate({ id: assignment.id, fileName: assignment.attachmentName || assignment.title })
      }
    >
      <Paperclip size={16} /> {assignment.attachmentName || "Vazifa faylini yuklab olish"}
    </Button>
  );
}

function SubmissionStatus({
  initial,
  onOpen,
}: {
  initial: Submission;
  onOpen: (submission: Submission) => void;
}) {
  const submission = useSubmission(initial.id, { poll: initial.status === "checking" });
  const data = submission.data ?? initial;
  const tone =
    data.status === "done" ? "" : data.status === "error" ? " grade-pill--error" : " grade-pill--checking";
  const label =
    data.status === "done" ? (
      <>
        <CheckCircle2 size={15} /> {data.overallScore} ball
      </>
    ) : data.status === "error" ? (
      "Tekshiruv xatosi"
    ) : (
      "Tekshirilmoqda…"
    );

  return (
    <button
      className={`grade-pill grade-pill--button${tone}`}
      onClick={() => onOpen(data)}
      aria-label="Natijani ochish"
    >
      {label}
    </button>
  );
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

function StudentAssignments({ assignments = [], loading }: { assignments?: Assignment[]; loading: boolean }) {
  const [selected, setSelected] = useState<Assignment | null>(null);
  /*
   * Bildirishnomadagi havola vazifani KO'RSATADI, lekin topshirish oynasini
   * o'zi ochmaydi: o'quvchi avval vazifani o'qib, keyin o'zi qaror qiladi.
   */
  const [params] = useSearchParams();
  const highlightId = params.get("assignment");
  useAssignmentHighlight(highlightId, assignments.length > 0);
  const [file, setFile] = useState<File | null>(null);
  const [resultOf, setResultOf] = useState<Submission | null>(null);
  const submit = useSubmitHomework();

  if (loading)
    return (
      <div className="student-tab-loading">
        <span />
      </div>
    );

  return (
    <div className="group-panel student-readonly-panel">
      <div className="group-panel-head">
        <div>
          <span>KURS VAZIFALARI</span>
          <h2>Vazifalar</h2>
        </div>
      </div>
      <div className="student-workspace-list">
        {assignments.map((item) => {
          const overdue = isAssignmentOverdue(item);
          const deadlineLabel = item.dueAt
            ? formatDayTime(item.dueAt)
            : null;

          return (
            <article
              key={item.id}
              data-assignment-id={item.id}
              className={`${item.id === highlightId ? "is-highlighted " : ""}${overdue ? "is-overdue" : ""}`.trim()}
            >
              <span className="workspace-list-icon">
                <ListChecks size={20} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p className={overdue ? "is-overdue" : ""}>
                  {deadlineLabel
                    ? `${overdue ? "Muddat tugagan" : "Muddat"}: ${deadlineLabel}`
                    : "Muddat yo‘q"}
                </p>
              </div>
              <AttachmentButton assignment={item} />
              {item.mySubmission ? (
                <SubmissionStatus initial={item.mySubmission} onOpen={setResultOf} />
              ) : overdue ? (
                <span className="assignment-missed-pill" role="status">
                  <CircleAlert size={15} /> Topshirilmagan
                </span>
              ) : (
                <Button size="sm" onClick={() => setSelected(item)}>
                  Topshirish
                </Button>
              )}
            </article>
          );
        })}
        {!assignments.length ? <p className="portal-muted">Vazifa yo‘q.</p> : null}
      </div>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setFile(null);
          }
        }}
      >
        {selected ? (
          <DialogContent title={selected.title} description="Topshiriq faylini yuklang (maksimal 25 MB).">
            <div className="homework-submit-dialog">
              <p>{selected.description}</p>
              {selected.hasAttachment ? <AttachmentDownloadRow assignment={selected} /> : null}
              <input
                type="file"
                accept={selected.skillKey === "speaking" ? SPEAKING_ACCEPT : DEFAULT_ACCEPT}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <Button
                loading={submit.isPending}
                disabled={!file || isAssignmentOverdue(selected)}
                onClick={() => {
                  if (isAssignmentOverdue(selected)) {
                    toast.error("Topshirish muddati tugagan");
                    setSelected(null);
                    return;
                  }
                  void submit
                    .mutateAsync({ assignmentId: selected.id, file, skillKey: selected.skillKey })
                    .then(() => setSelected(null));
                }}
              >
                Yuborish
              </Button>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>

      <HomeworkResultDialog
        submissionId={resultOf?.id}
        initial={resultOf}
        open={Boolean(resultOf)}
        onOpenChange={(open: boolean) => {
          if (!open) setResultOf(null);
        }}
        canDownloadFile
        title="Vazifangiz bo‘yicha natija"
      />
    </div>
  );
}

// ─── Testlar ──────────────────────────────────────────────────────────────
/** Bildirishnomadan kelingan testni ajratib ko'rsatadi (`useAssignmentHighlight`ga o'xshash). */
function useQuizHighlight(quizId: string | null, ready: boolean) {
  useEffect(() => {
    if (!quizId || !ready) return;
    document
      .querySelector(`[data-quiz-id="${CSS.escape(quizId)}"]`)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [quizId, ready]);
}

function StudentQuizzes({ quizzes = [], loading }: { quizzes?: QuizSummary[]; loading: boolean }) {
  const [attemptOf, setAttemptOf] = useState<QuizSummary | null>(null);
  const [historyOf, setHistoryOf] = useState<QuizSummary | null>(null);
  const [params] = useSearchParams();
  const highlightId = params.get("quiz");
  useQuizHighlight(highlightId, quizzes.length > 0);

  if (loading)
    return (
      <div className="student-tab-loading">
        <span />
      </div>
    );

  return (
    <div className="group-panel student-readonly-panel">
      <div className="group-panel-head">
        <div>
          <span>KURS TESTLARI</span>
          <h2>Testlar</h2>
        </div>
      </div>
      <div className="student-workspace-list">
        {quizzes.map((item) => {
          const deadlineLabel = item.dueAt ? formatDayTime(item.dueAt) : null;
          return (
            <article
              key={item.id}
              data-quiz-id={item.id}
              className={item.id === highlightId ? "is-highlighted" : ""}
            >
              <span className="workspace-list-icon">
                <FileQuestion size={20} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>
                  {deadlineLabel ? `Muddat: ${deadlineLabel}` : "Muddat yo‘q"} · {item.questionCount} ta
                  savol
                </p>
              </div>
              <button
                className="icon-button"
                aria-label="Urinishlar tarixi"
                onClick={() => setHistoryOf(item)}
              >
                <History size={16} />
              </button>
              <Button size="sm" onClick={() => setAttemptOf(item)}>
                Yechish
              </Button>
            </article>
          );
        })}
        {!quizzes.length ? <p className="portal-muted">Test yo‘q.</p> : null}
      </div>

      <QuizAttemptDialog
        quizId={attemptOf?.id ?? null}
        open={Boolean(attemptOf)}
        onOpenChange={(open) => {
          if (!open) setAttemptOf(null);
        }}
      />
      <QuizAttemptsDialog
        quizId={historyOf?.id ?? null}
        open={Boolean(historyOf)}
        onOpenChange={(open) => {
          if (!open) setHistoryOf(null);
        }}
        title={historyOf ? `“${historyOf.title}” — urinishlaringiz` : undefined}
      />
    </div>
  );
}
