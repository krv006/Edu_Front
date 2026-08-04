import { useEffect, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Avatar, Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { useEnrollStudent, useSearchCourseStudents } from "../model/course.queries";
import type { EnrollmentStatus } from "@/shared/types";

export interface AddStudentDialogProps {
  courseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const enrollLabels: Record<EnrollmentStatus, string> = {
  approved: "A’zo",
  pending: "Kutilmoqda",
  declined: "Rad etilgan",
};

/** Faqat dialog ochiqligida mount bo‘ladi — yopilganda qidiruv holati o‘zi tozalanadi. */
function AddStudentBody({ courseId }: { courseId: string | null }) {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const results = useSearchCourseStudents(courseId, debounced);
  const enroll = useEnrollStudent();

  useEffect(() => {
    const id = globalThis.setTimeout(() => setDebounced(term), 350);
    return () => globalThis.clearTimeout(id);
  }, [term]);

  const items = results.data ?? [];
  const tooShort = debounced.trim().length < 2;

  return (
    <>
      <label className="student-search">
        <Search size={18} />
        <input
          autoFocus
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Kamida 2 ta belgi kiriting"
          aria-label="O‘quvchi qidirish"
        />
      </label>

      <div className="student-enrollment-list">
        {tooShort ? (
          <p className="portal-muted">Qidirish uchun ism yoki username yozing.</p>
        ) : results.isLoading ? (
          <div className="student-tab-loading">
            <span />
          </div>
        ) : results.isError ? (
          <div className="form-alert">{results.error.message}</div>
        ) : (
          items.map((student) => (
            <article key={student.id}>
              <Avatar name={student.name} tone={student.avatarTone} size="md" />
              <div>
                <strong>{student.name}</strong>
                <small>@{student.username}</small>
              </div>
              <Button
                size="sm"
                variant={student.enrollStatus ? "secondary" : "primary"}
                disabled={
                  Boolean(student.enrollStatus) && student.enrollStatus !== "declined"
                }
                loading={enroll.isPending && enroll.variables?.studentId === student.id}
                onClick={() => enroll.mutate({ courseId, studentId: student.id })}
              >
                <UserPlus size={15} /> {(student.enrollStatus && enrollLabels[student.enrollStatus]) ?? "Qo‘shish"}
              </Button>
            </article>
          ))
        )}
        {!tooShort && !results.isLoading && !results.isError && !items.length ? (
          <p className="portal-muted">O‘quvchi topilmadi.</p>
        ) : null}
      </div>
    </>
  );
}

export function AddStudentDialog({ courseId, open, onOpenChange }: AddStudentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent
          title="O‘quvchi qo‘shish"
          description="Username yoki ism bo‘yicha bazadan qidiring."
        >
          <AddStudentBody courseId={courseId} />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
