import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CalendarClock, CheckCircle2, Clock3, GraduationCap, ListChecks, PlayCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/providers";
import { ROUTES } from "@/app/router/route-paths";
import { useStudentDashboard } from "@/modules/student";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";

const metricIcons: Record<string, typeof BookOpen> = { courses: BookOpen, lessons: CalendarClock, assignments: ListChecks, progress: TrendingUp };

export function StudentDashboardPage() {
  const { user } = useAuth();
  const dashboard = useStudentDashboard();
  if (dashboard.isLoading) return <LoadingFallback label="O‘quvchi paneli yuklanmoqda" />;
  if (dashboard.isError || !dashboard.data) return <RouteState title="Ma’lumotlarni yuklab bo‘lmadi" actionLabel="Qayta urinish" onAction={dashboard.refetch} />;
  const { metrics, nextLesson, assignments } = dashboard.data;

  return (
    <div className="portal-page">
      <section className="portal-welcome">
        <div><span className="portal-eyebrow">O‘QUVCHI KABINETI</span><h1>Xayrli kun, {user?.name?.split(" ")[0]}! 👋</h1><p>Bugungi darslar va vazifalaringiz bir joyda.</p></div>
        <div className="welcome-orbit"><GraduationCap size={29} /></div>
      </section>
      <section className="portal-metric-grid">
        {metrics.map((metric, index) => { const Icon = metricIcons[metric.id]; return (
          <motion.article className={`portal-metric portal-metric--${metric.tone}`} key={metric.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <span><Icon size={20} /></span><div><strong>{metric.value}</strong><small>{metric.label}</small></div>
          </motion.article>
        ); })}
      </section>
      <div className="student-dashboard-grid">
        <section className="portal-card next-lesson-card">
          <div className="portal-section-head"><div><span>KEYINGI DARS</span><h2>Bugungi reja</h2></div><Link to={ROUTES.student.schedule}>Jadval <ArrowRight size={15} /></Link></div>
          {nextLesson ? (
            <div className="lesson-hero"><span className="lesson-hero-icon"><PlayCircle size={27} /></span><div><small>{nextLesson.date} · {nextLesson.time}</small><h3>{nextLesson.title}</h3><p>{nextLesson.teacher} · <Clock3 size={14} /> {nextLesson.duration}</p></div><Link className="portal-primary-link" to={ROUTES.student.course(nextLesson.id)}>Kursga kirish</Link></div>
          ) : (
            <p className="portal-muted">Rejalashtirilgan dars yo‘q.</p>
          )}
        </section>
        <section className="portal-card student-task-card">
          <div className="portal-section-head"><div><span>VAZIFALAR</span><h2>Yaqin muddatlar</h2></div><Link to={ROUTES.student.assignments}>Barchasi <ArrowRight size={15} /></Link></div>
          <div className="portal-list">{assignments.map((task) => <article key={task.id}><span className={task.status === "urgent" ? "is-urgent" : ""}><CheckCircle2 size={17} /></span><div><strong>{task.title}</strong><small>{task.course}</small></div><time>{task.due}</time></article>)}</div>
        </section>
      </div>
    </div>
  );
}
