import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CalendarDays, CheckCircle2, Clock3, ListChecks, MessageCircle, Send, UsersRound } from "lucide-react";
import { useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCourse } from "@/modules/course";
import { LoadingFallback } from "@/shared/ui";

const tabs = [{ id: "chat", label: "Chat", icon: MessageCircle }, { id: "lessons", label: "Darslar", icon: CalendarDays }, { id: "assignments", label: "Vazifalar", icon: ListChecks }];

export function StudentCoursePage() {
  const { courseId } = useParams();
  const courseQuery = useCourse(courseId);
  const [params, setParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const activeTab = tabs.some((tab) => tab.id === params.get("tab")) ? params.get("tab") : "chat";
  if (courseQuery.isLoading) return <LoadingFallback label="Kurs yuklanmoqda" />;
  if (!courseQuery.data) return <Navigate to="/student/courses" replace />;
  const course = courseQuery.data;
  const messages = [...course.messages, ...localMessages];

  function submitMessage(event) { event.preventDefault(); const text = message.trim(); if (!text) return; setLocalMessages((current) => [...current, { id: crypto.randomUUID(), author: "Siz", text, time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }), own: true }]); setMessage(""); }

  return (
    <div className="portal-page student-course-page">
      <section className="course-workspace-head"><div className="course-workspace-mark"><BookOpen size={24} /></div><div><span>{course.subject}</span><h1>{course.title}</h1><p>{course.teacher} · <UsersRound size={14} /> {course.members} o‘quvchi</p></div></section>
      <nav className="course-workspace-tabs">{tabs.map((tab) => { const Icon = tab.icon; const active = tab.id === activeTab; return <button key={tab.id} className={active ? "is-active" : ""} onClick={() => setParams(tab.id === "chat" ? {} : { tab: tab.id })}>{active && <motion.i layoutId="student-course-tab" />}<Icon size={16} /> {tab.label}</button>; })}</nav>
      <AnimatePresence mode="wait"><motion.section key={activeTab} className="course-workspace-content" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
        {activeTab === "chat" && <div className="student-course-chat"><div className="student-message-list">{messages.map((item) => <article key={item.id} className={item.own ? "is-own" : ""}><div><strong>{item.author}</strong><p>{item.text}</p><time>{item.time}</time></div></article>)}</div><form onSubmit={submitMessage}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Xabar yozing..." /><button aria-label="Xabarni yuborish"><Send size={18} /></button></form></div>}
        {activeTab === "lessons" && <div className="student-workspace-list">{course.lessons.map((lesson) => <article key={lesson.id}><span className="workspace-list-icon"><CalendarDays size={20} /></span><div><strong>{lesson.title}</strong><p>{lesson.date} · {lesson.time} · <Clock3 size={14} /> {lesson.duration}</p></div><Button size="sm" variant={lesson.status === "today" ? "primary" : "secondary"}>{lesson.status === "today" ? "Darsga kirish" : "Rejada"}</Button></article>)}</div>}
        {activeTab === "assignments" && <div className="student-workspace-list">{course.assignments.map((assignment) => <article key={assignment.id}><span className="workspace-list-icon"><ListChecks size={20} /></span><div><strong>{assignment.title}</strong><p>Muddat: {assignment.due}</p></div>{assignment.status === "graded" ? <span className="grade-pill"><CheckCircle2 size={15} /> {assignment.score} ball</span> : <Button size="sm">Topshirish</Button>}</article>)}</div>}
      </motion.section></AnimatePresence>
    </div>
  );
}
