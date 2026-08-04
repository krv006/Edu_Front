import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck2, CheckCircle2, Clock3, Hourglass, Timer, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth";
import { ROUTES } from "@/shared/config";
import { useAttendance } from "@/modules/attendance";
import { useParentDashboard, useSelectedChild } from "@/modules/parent";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";

const metricIcons: Record<string, typeof UsersRound> = { children: UsersRound, requests: Hourglass, lessons: CheckCircle2, minutes: Timer };
export function ParentDashboardPage() {
  const { user } = useAuth(); const { selectedChildId, selectedChild } = useSelectedChild(); const dashboard = useParentDashboard(selectedChildId); const attendance = useAttendance(selectedChildId ? { student: selectedChildId } : {});
  if (dashboard.isLoading || attendance.isLoading) return <LoadingFallback label="Ota-ona paneli yuklanmoqda" />;
  if (dashboard.isError || attendance.isError) return <RouteState title="Ma’lumotlarni yuklab bo‘lmadi" actionLabel="Qayta urinish" onAction={() => { dashboard.refetch(); attendance.refetch(); }} />;
  return <div className="portal-page"><section className="portal-welcome parent-welcome"><div><span className="portal-eyebrow">OTA-ONA KABINETI</span><h1>Xayrli tong, {user?.name?.split(" ")[0]}! 👋</h1><p>{selectedChild ? `${selectedChild.name}ning ta’lim jarayoni.` : "Farzandingizning ta’lim jarayonini kuzatib boring."}</p></div><div className="welcome-orbit"><UsersRound size={29} /></div></section>
    <section className="portal-metric-grid">{(dashboard.data?.metrics ?? []).map((metric, index) => { const Icon = metricIcons[metric.id]; return <motion.article className={`portal-metric portal-metric--${["violet", "amber", "emerald", "rose"][index]}`} key={metric.id} initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}><span><Icon size={20} /></span><div><strong>{metric.value}</strong><small>{metric.label}</small></div></motion.article>; })}</section>
    <section className="portal-card parent-recent-card"><div className="portal-section-head"><div><span>SO‘NGGI FAOLLIK</span><h2>Davomat</h2></div><Link to={ROUTES.parent.attendance}>Barcha davomat <ArrowRight size={15} /></Link></div><div className="parent-activity-list">{(attendance.data ?? []).slice(0, 5).map((item) => <article key={item.id}><span><CalendarCheck2 size={18} /></span><div><strong>{item.lesson}</strong><small>{item.child} · {item.entered}</small></div><time><Clock3 size={14} /> {item.duration}</time></article>)}{!attendance.data?.length ? <p className="portal-muted">Tanlangan farzand uchun davomat topilmadi.</p> : null}</div></section>
  </div>;
}
