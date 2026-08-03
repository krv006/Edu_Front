import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, MessageCircle, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCourses } from "@/modules/course";

export function StudentEnrollmentDialog({ open, onOpenChange }) {
  const courses = useCourses();
  const navigate = useNavigate();
  const available = (courses.data ?? []).filter((course) => course.status === "available");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent title="Yangi muloqot" description="O‘qituvchiga yozing yoki ochiq kursga qo‘shiling.">
          <motion.div className="student-enrollment-dialog" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}>
            <span className="dialog-section-label">O‘QITUVCHIGA YOZISH</span>
            <div className="teacher-contact">
              <Avatar name="Madina Yusupova" tone="violet" size="md" status="online" />
              <div><strong>Madina Yusupova</strong><small>Ingliz tili o‘qituvchisi · onlayn</small></div>
              <Button size="sm" onClick={() => { onOpenChange(false); navigate("/student/chats/madina"); }}><MessageCircle size={16} /> Yozish</Button>
            </div>
            <span className="dialog-section-label">KURSLARGA QO‘SHILISH</span>
            <div className="student-enrollment-list">
              {available.map((course) => (
                <article key={course.id}>
                  <span><BookOpen size={18} /></span>
                  <div><strong>{course.title}</strong><small>{course.teacher} · <UsersRound size={12} /> {course.students} o‘quvchi</small></div>
                  <Button size="sm" variant="secondary" onClick={() => toast.success("Kursga qo‘shilish so‘rovi yuborildi")}>Qo‘shilish</Button>
                </article>
              ))}
              {!courses.isLoading && available.length === 0 ? <p className="student-enrollment-empty"><CheckCircle2 size={18} /> Hozircha yangi ochiq kurs yo‘q.</p> : null}
            </div>
          </motion.div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
