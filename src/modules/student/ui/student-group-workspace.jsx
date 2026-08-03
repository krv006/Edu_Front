import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CalendarDays, CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageComposer } from "@/components/chat/message-composer";
import { MessageList } from "@/components/chat/message-list";
import { Button } from "@/components/ui/button";
import { useCourse } from "@/modules/course";

const tabs = [
  { id: "chat", label: "Chat", icon: BookOpen },
  { id: "lessons", label: "Darslar", icon: CalendarDays },
  { id: "assignments", label: "Vazifalar", icon: ListChecks },
];

export function StudentGroupWorkspace({ conversation, messages, sendMessage, updateMessage, deleteMessage, toggleReaction, currentUserId }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [replyMessage, setReplyMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const course = useCourse(conversation.id);
  const activeTab = tabs.some((tab) => tab.id === searchParams.get("tab")) ? searchParams.get("tab") : "chat";

  async function handleSend(payload) {
    try {
      if (editingMessage) {
        await updateMessage.mutateAsync({ messageId: editingMessage.id, text: payload.text });
        setEditingMessage(null);
        toast.success("Xabar tahrirlandi");
        return;
      }
      await sendMessage.mutateAsync({ ...payload, replyTo: replyMessage ? { author: replyMessage.senderName || (replyMessage.senderId === currentUserId ? "Siz" : conversation.title), text: replyMessage.text } : undefined });
      setReplyMessage(null);
    } catch { toast.error("Xabar yuborilmadi"); }
  }

  async function handleDelete(message, scope) {
    try { await deleteMessage.mutateAsync({ messageId: message.id, scope }); toast.success("Xabar o‘chirildi"); }
    catch { toast.error("Xabarni o‘chirib bo‘lmadi"); }
  }

  return (
    <section className="chat-page group-workspace student-group-workspace">
      <ChatHeader conversation={conversation} backTo="/student/chats" />
      <nav className="group-tabs" aria-label="Kurs bo‘limlari">
        {tabs.map((tab) => { const Icon = tab.icon; const active = tab.id === activeTab; return <button key={tab.id} className={active ? "is-active" : ""} onClick={() => setSearchParams(tab.id === "chat" ? {} : { tab: tab.id })}>{active ? <motion.span layoutId="student-group-tab" className="group-tab-indicator" /> : null}<Icon size={16} /><span>{tab.label}</span></button>; })}
      </nav>
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} className="group-tab-content" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.18 }}>
          {activeTab === "chat" ? <MessageList messages={messages.data} conversation={conversation} loading={messages.isLoading} error={messages.isError} onRetry={messages.refetch} currentUserId={currentUserId} onReply={(message) => { setReplyMessage(message); setEditingMessage(null); }} onEdit={(message) => { setEditingMessage(message); setReplyMessage(null); }} onDelete={handleDelete} onReact={(message, emoji) => toggleReaction.mutate({ messageId: message.id, emoji })} /> : null}
          {activeTab === "lessons" ? <StudentLessons lessons={course.data?.lessons} loading={course.isLoading} /> : null}
          {activeTab === "assignments" ? <StudentAssignments assignments={course.data?.assignments} loading={course.isLoading} /> : null}
        </motion.div>
      </AnimatePresence>
      {activeTab === "chat" ? <MessageComposer key={editingMessage?.id ?? "student-compose"} onSend={handleSend} sending={sendMessage.isPending || updateMessage.isPending} replyTo={replyMessage} editingMessage={editingMessage} currentUserId={currentUserId} onCancelContext={() => { setReplyMessage(null); setEditingMessage(null); }} /> : null}
    </section>
  );
}

function StudentLessons({ lessons = [], loading }) {
  if (loading) return <div className="student-tab-loading"><span /></div>;
  return <div className="group-panel student-readonly-panel"><div className="group-panel-head"><div><span>KURS DARSLARI</span><h2>Darslar</h2><p>Rejalashtirilgan va yozib olingan mashg‘ulotlar.</p></div></div><div className="student-workspace-list">{lessons.map((lesson) => <article key={lesson.id}><span className="workspace-list-icon"><CalendarDays size={20} /></span><div><strong>{lesson.title}</strong><p>{lesson.date} · {lesson.time} · <Clock3 size={14} /> {lesson.duration}</p></div><Button size="sm" variant={lesson.status === "today" ? "primary" : "secondary"}>{lesson.status === "today" ? "Darsga kirish" : "Rejada"}</Button></article>)}</div></div>;
}

function StudentAssignments({ assignments = [], loading }) {
  if (loading) return <div className="student-tab-loading"><span /></div>;
  return <div className="group-panel student-readonly-panel"><div className="group-panel-head"><div><span>KURS VAZIFALARI</span><h2>Vazifalar</h2><p>Topshiriqlar, muddatlar va baholaringiz.</p></div></div><div className="student-workspace-list">{assignments.map((assignment) => <article key={assignment.id}><span className="workspace-list-icon"><ListChecks size={20} /></span><div><strong>{assignment.title}</strong><p>Muddat: {assignment.due}</p></div>{assignment.status === "graded" ? <span className="grade-pill"><CheckCircle2 size={15} /> {assignment.score} ball</span> : <Button size="sm">Topshirish</Button>}</article>)}</div></div>;
}
