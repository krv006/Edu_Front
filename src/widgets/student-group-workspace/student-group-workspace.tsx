import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CalendarDays, CheckCircle2, Clock3, ListChecks, Paperclip, PlayCircle, Star } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ChatHeader } from "@/modules/conversation";
import { MessageComposer, MessageList } from "@/modules/message";
import {
  HomeworkResultDialog,
  useAssignments,
  useDownloadAssignmentFile,
  useSubmission,
  useSubmitHomework,
} from "@/modules/homework";
import { isLessonClosed, RateLessonDialog, RatingSummary, useLessons } from "@/modules/lesson";
import type {
  Assignment,
  ChatMessage,
  Conversation,
  Lesson,
  SendMessagePayload,
  Submission,
} from "@/shared/types";
import type { ChatController } from "@/modules/message";
import { ROUTES } from "@/shared/config";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";

type TabId = "chat" | "lessons" | "assignments";

const TABS: Array<{ id: TabId; label: string; icon: typeof BookOpen }> = [
  { id: "chat", label: "Chat", icon: BookOpen },
  { id: "lessons", label: "Darslar", icon: CalendarDays },
  { id: "assignments", label: "Vazifalar", icon: ListChecks },
];

const SPEAKING_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.docx,.mp3,.wav,.m4a,.ogg";
const DEFAULT_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.docx";

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
  const lessons = useLessons({ course: courseId, page_size: 100 });
  const assignments = useAssignments(courseId);

  const tabParam = params.get("tab") as TabId | null;
  const active: TabId = TABS.some((item) => item.id === tabParam) ? (tabParam as TabId) : "chat";

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
      <ChatHeader conversation={conversation} backTo="/student/chats" />
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
              conversation={conversation}
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
          <span>KURS DARSLARI</span>
          <h2>Darslar</h2>
        </div>
      </div>
      <div className="student-workspace-list">
        {lessons.map((lesson) => (
          <article key={lesson.id}>
            <span className="workspace-list-icon">
              <CalendarDays size={20} />
            </span>
            <div>
              <strong>{lesson.title}</strong>
              <p>
                {lesson.date} · {lesson.time} · <Clock3 size={14} /> {lesson.durationMinutes} daqiqa
              </p>
            </div>
            {lesson.status === "finished" ? (
              <>
                <RatingSummary average={lesson.avgRating} count={lesson.ratingCount} compact />
                <Button size="sm" variant="secondary" onClick={() => setRateTarget(lesson)}>
                  <Star size={16} /> Baholash
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(ROUTES.recording(lesson.id))}
                >
                  <PlayCircle size={16} /> Yozuv
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                disabled={isLessonClosed(lesson)}
                onClick={() => navigate(ROUTES.live(lesson.id))}
              >
                Darsga kirish
              </Button>
            )}
          </article>
        ))}
        {!lessons.length ? <p className="portal-muted">Dars rejalashtirilmagan.</p> : null}
      </div>

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
      aria-label="AI tahlilini ochish"
    >
      {label}
    </button>
  );
}

function StudentAssignments({ assignments = [], loading }: { assignments?: Assignment[]; loading: boolean }) {
  const [selected, setSelected] = useState<Assignment | null>(null);
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
        {assignments.map((item) => (
          <article key={item.id}>
            <span className="workspace-list-icon">
              <ListChecks size={20} />
            </span>
            <div>
              <strong>{item.title}</strong>
              <p>
                {item.dueAt
                  ? `Muddat: ${new Intl.DateTimeFormat("uz-UZ", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(item.dueAt))}`
                  : "Muddat yo‘q"}
              </p>
            </div>
            <AttachmentButton assignment={item} />
            {item.mySubmission ? (
              <SubmissionStatus initial={item.mySubmission} onOpen={setResultOf} />
            ) : (
              <Button size="sm" onClick={() => setSelected(item)}>
                Topshirish
              </Button>
            )}
          </article>
        ))}
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
                disabled={!file}
                onClick={() =>
                  submit
                    .mutateAsync({ assignmentId: selected.id, file, skillKey: selected.skillKey })
                    .then(() => setSelected(null))
                }
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
        title="Vazifangiz bo‘yicha AI tahlili"
      />
    </div>
  );
}
