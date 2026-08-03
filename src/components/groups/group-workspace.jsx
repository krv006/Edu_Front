import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Plus,
  Search,
  UserPlus,
  UsersRound,
  Video,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { availableUsers } from "@/modules/user";
import { ChatHeader } from "../chat/chat-header";
import { MessageList } from "../chat/message-list";
import { MessageComposer } from "../chat/message-composer";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { AddAssignmentDialog, AddLessonDialog } from "./group-action-dialogs";

const tabs = [
  { id: "chat", label: "Chat", icon: BookOpen },
  { id: "lessons", label: "Darslar", icon: CalendarDays },
  { id: "assignments", label: "Vazifalar", icon: ClipboardList },
  { id: "students", label: "O‘quvchilar", icon: UsersRound },
];

export function GroupWorkspace({
  conversation,
  messages,
  sendMessage,
  updateMessage,
  deleteMessage,
  toggleReaction,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [studentSearch, setStudentSearch] = useState("");
  const [replyMessage, setReplyMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const activeTab = tabs.some((tab) => tab.id === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "chat";
  const students = useMemo(
    () =>
      availableUsers.filter((user) =>
        user.name.toLowerCase().includes(studentSearch.toLowerCase())
      ),
    [studentSearch]
  );

  async function handleSend(payload) {
    try {
      if (editingMessage) {
        await updateMessage.mutateAsync({
          messageId: editingMessage.id,
          text: payload.text,
        });
        setEditingMessage(null);
        toast.success("Xabar tahrirlandi");
        return;
      }
      await sendMessage.mutateAsync({
        ...payload,
        replyTo: replyMessage
          ? {
              author:
                replyMessage.senderName ||
                (replyMessage.senderId === "teacher-1"
                  ? "Siz"
                  : conversation.title),
              text: replyMessage.text,
            }
          : undefined,
      });
      setReplyMessage(null);
    } catch {
      toast.error("Xabar yuborilmadi");
    }
  }

  async function handleDelete(message, scope) {
    try {
      await deleteMessage.mutateAsync({ messageId: message.id, scope });
      if (replyMessage?.id === message.id) setReplyMessage(null);
      if (editingMessage?.id === message.id) setEditingMessage(null);
      toast.success(
        scope === "everyone"
          ? "Xabar hamma uchun o‘chirildi"
          : "Xabar siz uchun o‘chirildi"
      );
    } catch {
      toast.error("Xabarni o‘chirib bo‘lmadi");
    }
  }

  return (
    <section className="chat-page group-workspace">
      <ChatHeader conversation={conversation} />
      <nav className="group-tabs" aria-label="Guruh bo‘limlari">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              className={active ? "is-active" : ""}
              onClick={() =>
                setSearchParams(tab.id === "chat" ? {} : { tab: tab.id })
              }
            >
              {active && (
                <motion.span
                  layoutId="group-tab-indicator"
                  className="group-tab-indicator"
                />
              )}
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
          transition={{ duration: 0.18 }}
        >
          {activeTab === "chat" && (
            <MessageList
              messages={messages.data}
              conversation={conversation}
              loading={messages.isLoading}
              error={messages.isError}
              onRetry={messages.refetch}
              onReply={(message) => {
                setReplyMessage(message);
                setEditingMessage(null);
              }}
              onEdit={(message) => {
                setEditingMessage(message);
                setReplyMessage(null);
              }}
              onDelete={handleDelete}
              onReact={(message, emoji) =>
                toggleReaction.mutate({ messageId: message.id, emoji })
              }
            />
          )}
          {activeTab === "lessons" && <LessonsPanel />}
          {activeTab === "assignments" && <AssignmentsPanel />}
          {activeTab === "students" && (
            <StudentsPanel
              students={students}
              search={studentSearch}
              onSearch={setStudentSearch}
            />
          )}
        </motion.div>
      </AnimatePresence>
      {activeTab === "chat" && (
        <MessageComposer
          key={editingMessage?.id ?? "compose"}
          onSend={handleSend}
          sending={sendMessage.isPending || updateMessage.isPending}
          replyTo={replyMessage}
          editingMessage={editingMessage}
          onCancelContext={() => {
            setReplyMessage(null);
            setEditingMessage(null);
          }}
        />
      )}
    </section>
  );
}

function LessonsPanel() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lessons, setLessons] = useState([
    { id: "lesson-1", topic: "Present Simple — amaliyot", date: "2026-08-01", time: "18:30", duration: "45" },
  ]);
  return (
    <div className="group-panel">
      <div className="group-panel-head">
        <div>
          <span>GURUH DARSLARI</span>
          <h2>Darslar jadvali</h2>
          <p>Rejalashtirilgan va yakunlangan mashg‘ulotlar.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={17} /> Dars qo‘shish
        </Button>
      </div>
      <div className="lesson-list">
        {lessons.map((lesson) => {
          const date = new Date(`${lesson.date}T00:00:00`);
          return (
            <motion.article key={lesson.id} className="lesson-feature-card" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}>
              <div className="lesson-date"><strong>{String(date.getDate()).padStart(2, "0")}</strong><span>{["YAN", "FEV", "MAR", "APR", "MAY", "IYN", "IYL", "AVG", "SEN", "OKT", "NOY", "DEK"][date.getMonth()]}</span></div>
              <div className="lesson-main"><span className="live-pill"><span /> REJADA</span><h3>{lesson.topic}</h3><p><Clock3 size={15} /> {lesson.time} · {lesson.duration} daqiqa</p></div>
              <Button size="sm" onClick={() => toast.success(`${lesson.topic} darsiga kirildi`)}><Video size={16} /> Darsga kirish</Button>
            </motion.article>
          );
        })}
      </div>
      <div className="lesson-summary">
        <span>
          <CheckCircle2 size={17} /> 12 ta dars yakunlangan
        </span>
        <span>Jami 9 soat 20 daqiqa</span>
      </div>
      <AddLessonDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreate={(lesson) => { setLessons((current) => [...current, lesson]); toast.success("Yangi dars saqlandi"); }} />
    </div>
  );
}

function AssignmentsPanel() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);
  return (
    <div className="group-panel">
      <div className="group-panel-head">
        <div>
          <span>GURUH VAZIFALARI</span>
          <h2>Vazifalar</h2>
          <p>Topshiriqlar va natijalarni shu yerda boshqaring.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={17} /> Vazifa berish
        </Button>
      </div>
      {assignments.length === 0 ? <div className="premium-empty">
        <span>
          <ClipboardList size={30} />
        </span>
        <h3>Hali vazifa berilmagan</h3>
        <p>
          O‘quvchilarga birinchi vazifani bering va topshirish jarayonini
          kuzating.
        </p>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={16} /> Birinchi vazifani berish
        </Button>
      </div> : (
        <div className="assignment-list">
          {assignments.map((assignment) => (
            <motion.article key={assignment.id} className="assignment-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <span className="assignment-card-icon"><ClipboardList size={20} /></span>
              <div><strong>{assignment.title}</strong><p>{assignment.description}</p><small>{assignment.dueAt ? `Muddat: ${assignment.dueAt.replace("T", " · ")}` : "Muddat belgilanmagan"}{assignment.fileName ? ` · ${assignment.fileName}` : ""}</small></div>
              <span className="assignment-subject">{assignment.subject}</span>
            </motion.article>
          ))}
        </div>
      )}
      <AddAssignmentDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreate={(assignment) => { setAssignments((current) => [...current, assignment]); toast.success("Vazifa guruhga yuborildi"); }} />
    </div>
  );
}

function StudentsPanel({ students, search, onSearch }) {
  return (
    <div className="group-panel">
      <div className="group-panel-head">
        <div>
          <span>ISHTIROKCHILAR</span>
          <h2>O‘quvchilar</h2>
          <p>{students.length} o‘quvchi ko‘rsatilmoqda.</p>
        </div>
        <Button onClick={() => toast.info("O‘quvchi taklif qilish")}>
          <UserPlus size={17} /> O‘quvchi qo‘shish
        </Button>
      </div>
      <label className="student-search">
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Ism yoki username bo‘yicha qidirish"
        />
      </label>
      <div className="student-grid">
        {students.map((student, index) => (
          <motion.article
            key={student.id}
            className="student-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <Avatar
              name={student.name}
              tone={student.avatarTone}
              size="md"
              status={student.status}
            />
            <div>
              <strong>{student.name}</strong>
              <span>{student.username}</span>
            </div>
            <button
              onClick={() => toast.info(`${student.name} profili`)}
              aria-label={`${student.name} profilini ochish`}
            >
              Ko‘rish
            </button>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
