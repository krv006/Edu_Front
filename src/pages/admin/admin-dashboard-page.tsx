import { BookOpen, CalendarDays, CheckCircle2, LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth";
import { Button } from "@/shared/ui/legacy";
import { useAttendancePage } from "@/modules/attendance";
import { useCoursePage } from "@/modules/course";
import { useLessonPage } from "@/modules/lesson";

export function AdminDashboardPage() {
  const { user, logout } = useAuth(); const navigate = useNavigate();
  const courses = useCoursePage({ page_size: 10 }); const lessons = useLessonPage({ page_size: 10 }); const attendance = useAttendancePage({ page_size: 10 });
  async function signOut() { await logout(); navigate("/login", { replace: true }); }
  const hasError = courses.isError || lessons.isError || attendance.isError;
  return <main className="portal-page admin-page"><div className="portal-page-heading"><div><span className="portal-eyebrow"><ShieldCheck size={14} /> ADMINISTRATOR</span><h1>Xush kelibsiz, {user?.name}</h1><p>Backendda mavjud bo‘lgan kurs, dars va davomat ma’lumotlari.</p></div><Button variant="secondary" onClick={signOut}><LogOut size={17} /> Chiqish</Button></div>
    {hasError && <div className="form-alert">Ayrim ma’lumotlarni yuklash uchun administrator ruxsati yetarli emas.</div>}
    <section className="admin-metric-grid"><article><BookOpen /><strong>{courses.data?.total ?? courses.data?.items?.length ?? 0}</strong><span>Kurslar</span></article><article><CalendarDays /><strong>{lessons.data?.total ?? lessons.data?.items?.length ?? 0}</strong><span>Darslar</span></article><article><CheckCircle2 /><strong>{attendance.data?.total ?? attendance.data?.items?.length ?? 0}</strong><span>Davomat yozuvlari</span></article></section>
    <section className="portal-panel"><div className="portal-section-heading"><div><span className="portal-eyebrow">SO‘NGGI KURSLAR</span><h2>Kurslar</h2></div></div><div className="admin-course-list">{(courses.data?.items ?? []).map((course) => <article key={course.id}><div><strong>{course.title}</strong><small>{course.subject} · {course.teacher}</small></div><span>{course.students} o‘quvchi</span></article>)}{!courses.isLoading && !courses.data?.items?.length ? <p className="portal-muted">Kurs topilmadi.</p> : null}</div></section>
  </main>;
}
