import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CalendarClock, CheckCircle2, Clock3, GraduationCap, ListChecks, PlayCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/modules/auth";
import { ROUTES } from "@/shared/config";
import { useStudentDashboard } from "@/modules/student";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";

const metricIcons: Record<string, typeof BookOpen> = { courses: BookOpen, lessons: CalendarClock, assignments: ListChecks, progress: TrendingUp };

export function StudentDashboardPage() {
  const { t } = useTranslation("student");
  const { user } = useAuth();
  const dashboard = useStudentDashboard();
  if (dashboard.isLoading) return <LoadingFallback label={t("dashboard.loading")} />;
  if (dashboard.isError || !dashboard.data) return <RouteState title={t("dashboard.loadError")} actionLabel={t("dashboard.retry")} onAction={dashboard.refetch} />;
  const { metrics, nextLesson, assignments } = dashboard.data;

  return (
    <div className="portal-page">
      <section className="portal-welcome">
        <div><span className="portal-eyebrow">{t("dashboard.eyebrow")}</span><h1>{t("dashboard.greeting", { name: user?.name?.split(" ")[0] })}</h1><p>{t("dashboard.subtitle")}</p></div>
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
          <div className="portal-section-head"><div><span>{t("dashboard.nextLessonEyebrow")}</span><h2>{t("dashboard.nextLessonTitle")}</h2></div><Link to={ROUTES.student.schedule}>{t("dashboard.schedule")} <ArrowRight size={15} /></Link></div>
          {nextLesson ? (
            <div className="lesson-hero"><span className="lesson-hero-icon"><PlayCircle size={27} /></span><div><small>{nextLesson.date} · {nextLesson.time}</small><h3>{nextLesson.title}</h3><p>{nextLesson.teacher} · <Clock3 size={14} /> {nextLesson.duration}</p></div><Link className="portal-primary-link" to={ROUTES.student.course(nextLesson.id)}>{t("dashboard.enterCourse")}</Link></div>
          ) : (
            <p className="portal-muted">{t("dashboard.noPlannedLesson")}</p>
          )}
        </section>
        <section className="portal-card student-task-card">
          <div className="portal-section-head"><div><span>{t("dashboard.assignmentsEyebrow")}</span><h2>{t("dashboard.upcomingDeadlines")}</h2></div><Link to={ROUTES.student.assignments}>{t("dashboard.all")} <ArrowRight size={15} /></Link></div>
          <div className="portal-list">{assignments.map((task) => <article key={task.id}><span className={task.status === "urgent" ? "is-urgent" : ""}><CheckCircle2 size={17} /></span><div><strong>{task.title}</strong><small>{task.course}</small></div><time>{task.due}</time></article>)}</div>
        </section>
      </div>
    </div>
  );
}
