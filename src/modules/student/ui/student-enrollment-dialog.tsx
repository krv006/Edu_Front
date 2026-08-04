import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, MessageCircle, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { useCourseCatalog, useCreateEnrollment } from "@/modules/course";
import { DIRECT_STATUS, directStatusLabel, useRequestDirect, useTeachersForDirect } from "@/modules/conversation";
import { useParentLinks, useRespondParentLink } from "@/modules/parent";
import type { DirectTeacher } from "@/modules/conversation";

export interface StudentEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentEnrollmentDialog({ open, onOpenChange }: StudentEnrollmentDialogProps) {
  const catalog = useCourseCatalog({ page_size: 100 }); const teachers = useTeachersForDirect(); const links = useParentLinks(); const enroll = useCreateEnrollment(); const direct = useRequestDirect(); const respondLink = useRespondParentLink(); const navigate = useNavigate();
  async function requestTeacher(teacher: DirectTeacher) { if (teacher.roomId && teacher.directStatus === DIRECT_STATUS.ACTIVE) { onOpenChange(false); navigate(`/student/chats/${teacher.roomId}`); return; } const room = await direct.mutateAsync(teacher.id); onOpenChange(false); if (room.directStatus === DIRECT_STATUS.ACTIVE) navigate(`/student/chats/${room.id}`); }
  const pendingLinks = (links.data ?? []).filter((item) => item.status === "pending");
  return <Dialog open={open} onOpenChange={onOpenChange}>{open ? <DialogContent title="Yangi muloqot" description="O‘qituvchiga so‘rov yuboring yoki ochiq kursga qo‘shiling."><motion.div className="student-enrollment-dialog" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}>
    {pendingLinks.length ? <><span className="dialog-section-label">OTA-ONA SO‘ROVLARI</span><div className="student-enrollment-list">{pendingLinks.map((link) => <article key={link.id}><Avatar name={link.parent.name} tone="amber" size="md" /><div><strong>{link.parent.name}</strong><small>@{link.parent.username} · profilga bog‘lanmoqchi</small></div><div className="inline-actions"><Button size="sm" variant="secondary" loading={respondLink.isPending} onClick={() => respondLink.mutate({ id: link.id, action: "decline" })}>Rad etish</Button><Button size="sm" loading={respondLink.isPending} onClick={() => respondLink.mutate({ id: link.id, action: "approve" })}>Tasdiqlash</Button></div></article>)}</div></> : null}
    <span className="dialog-section-label">O‘QITUVCHIGA YOZISH</span><div className="student-enrollment-list">{(teachers.data ?? []).map((teacher) => <article key={teacher.id}><Avatar name={teacher.name} tone="violet" size="md" /><div><strong>{teacher.name}</strong><small>@{teacher.username} · {directStatusLabel(teacher.directStatus)}</small></div><Button size="sm" disabled={teacher.directStatus === DIRECT_STATUS.BLOCKED} loading={direct.isPending} onClick={() => requestTeacher(teacher)}><MessageCircle size={16} /> {teacher.directStatus === DIRECT_STATUS.ACTIVE ? "Ochish" : "So‘rov"}</Button></article>)}</div>
    <span className="dialog-section-label">KURSLARGA QO‘SHILISH</span><div className="student-enrollment-list">{(catalog.data?.items ?? []).map((course) => <article key={course.id}><span><BookOpen size={18} /></span><div><strong>{course.title}</strong><small>{course.teacher} · <UsersRound size={12} /> {course.students} o‘quvchi</small></div><Button size="sm" variant="secondary" disabled={Boolean(course.enrollmentStatus)} loading={enroll.isPending} onClick={() => enroll.mutate({ courseId: course.id, payload: {} })}>{course.enrollmentStatus === "pending" ? "Kutilmoqda" : course.enrollmentStatus === "approved" ? "A’zo" : "Qo‘shilish"}</Button></article>)}{!catalog.isLoading && !(catalog.data?.items?.length) ? <p className="student-enrollment-empty"><CheckCircle2 size={18} /> Hozircha ochiq kurs yo‘q.</p> : null}</div>
    {catalog.isError || teachers.isError || links.isError ? <div className="form-alert">Ma’lumotlarni yuklab bo‘lmadi</div> : null}
  </motion.div></DialogContent> : null}</Dialog>;
}
