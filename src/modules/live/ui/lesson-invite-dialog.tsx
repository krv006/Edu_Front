import { useMemo, useState } from "react";
import { Search, Send, UserRoundX } from "lucide-react";
import { useCourseStudents } from "@/modules/course";
import { Avatar, Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { useBanFromLesson, useInviteToLesson } from "../model/live.queries";

export interface LessonInviteDialogProps {
  lessonId: string;
  courseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export function LessonInviteDialog({
  lessonId,
  courseId,
  open,
  onOpenChange,
}: LessonInviteDialogProps) {
  const [search, setSearch] = useState("");
  const students = useCourseStudents(courseId, { page_size: 100 }, open);
  const invite = useInviteToLesson(lessonId);
  const ban = useBanFromLesson(lessonId);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = (students.data?.items ?? []).map((item) => item.student);
    if (!query) return items;
    return items.filter((student) =>
      `${student.name} ${student.username}`.toLowerCase().includes(query)
    );
  }, [students.data, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent
          title="Darsga taklif qilish"
          description="Taklif — bu ogohlantirish; o‘quvchi darsga o‘zi kiradi."
        >
          <div className="invite-dialog">
            <Button
              loading={invite.isPending && invite.variables === undefined}
              onClick={() => invite.mutate(undefined)}
            >
              <Send size={16} /> Hammaga yuborish
            </Button>

            <label className="student-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Ism yoki username bo‘yicha"
              />
            </label>

            {students.isLoading ? (
              <div className="student-tab-loading">
                <span />
              </div>
            ) : (
              <div className="invite-list">
                {visible.map((student) => (
                  <article key={student.id}>
                    <Avatar name={student.name} tone={student.avatarTone} size="sm" />
                    <div>
                      <strong>{student.name}</strong>
                      <small>@{student.username}</small>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={invite.isPending && invite.variables === student.id}
                      onClick={() => invite.mutate(student.id)}
                    >
                      <Send size={15} /> Taklif
                    </Button>
                    <button
                      className="icon-button destructive-icon"
                      aria-label={`${student.name}ni darsdan chetlashtirish`}
                      title="Darsdan chetlashtirish"
                      disabled={ban.isPending}
                      onClick={() => ban.mutate(student.id)}
                    >
                      <UserRoundX size={16} />
                    </button>
                  </article>
                ))}
                {!visible.length ? <p className="portal-muted">O‘quvchi topilmadi.</p> : null}
              </div>
            )}

            <p className="portal-muted">
              Chetlashtirish faqat shu darsga tegishli — o‘quvchi kursda qoladi va
              keyingi darslarga kira oladi.
            </p>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
