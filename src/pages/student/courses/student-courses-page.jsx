import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, MessageCircle, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ROUTES } from "@/app/router/route-paths";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCourses } from "@/modules/course";
import { LoadingFallback, RouteState } from "@/shared/ui";

export function StudentCoursesPage() {
  const coursesQuery = useCourses();
  const [search, setSearch] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const courses = useMemo(() => (coursesQuery.data ?? []).filter((course) => `${course.title} ${course.subject} ${course.teacher}`.toLowerCase().includes(search.toLowerCase())), [coursesQuery.data, search]);
  if (coursesQuery.isLoading) return <LoadingFallback label="Kurslar yuklanmoqda" />;
  if (coursesQuery.isError) return <RouteState title="Kurslarni yuklab bo‘lmadi" actionLabel="Qayta urinish" onAction={coursesQuery.refetch} />;

  return (
    <div className="portal-page">
      <div className="portal-page-heading"><div><span className="portal-eyebrow">MENING TA’LIMIM</span><h1>Kurslar</h1><p>Faol kurslaringizni davom ettiring yoki yangi guruhga qo‘shiling.</p></div><Button onClick={() => setJoinOpen(true)}>Kursga qo‘shilish</Button></div>
      <label className="portal-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Kurs, fan yoki o‘qituvchini qidirish" /></label>
      <div className="course-card-grid">{courses.map((course, index) => <motion.article className={`student-course-card student-course-card--${course.color}`} key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
        <div className="course-card-cover"><BookOpen size={25} /><span>{course.subject}</span></div>
        <div className="course-card-body"><h2>{course.title}</h2><p>{course.teacher}</p><span className="course-member"><UsersRound size={15} /> {course.students} o‘quvchi</span>{course.status === "joined" ? <><div className="course-progress"><span><i style={{ width: `${course.progress}%` }} /></span><small>{course.progress}%</small></div><Link className="portal-primary-link" to={ROUTES.student.course(course.id)}>Davom ettirish</Link></> : <Button variant="secondary" onClick={() => { toast.success("Kursga qo‘shilish so‘rovi yuborildi"); }}>Qo‘shilish</Button>}</div>
      </motion.article>)}</div>
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>{joinOpen && <DialogContent title="Kursga qo‘shilish" description="O‘qituvchiga yozing yoki ochiq guruhlardan birini tanlang.">
        <div className="join-course-dialog"><div className="teacher-contact"><Avatar name="Malika Karimova" tone="violet" size="md" status="online" /><div><strong>Malika Karimova</strong><small>Ingliz tili o‘qituvchisi</small></div><Button size="sm" onClick={() => toast.success("Shaxsiy suhbat ochildi")}><MessageCircle size={16} /> Yozish</Button></div><span className="dialog-section-label">MAVJUD GURUHLAR</span>{coursesQuery.data.filter((course) => course.status === "available").map((course) => <div className="join-course-row" key={course.id}><span><CheckCircle2 size={18} /></span><div><strong>{course.title}</strong><small>{course.teacher} · {course.students} o‘quvchi</small></div><Button size="sm" variant="secondary" onClick={() => toast.success("So‘rov yuborildi")}>Qo‘shilish</Button></div>)}</div>
      </DialogContent>}</Dialog>
    </div>
  );
}
