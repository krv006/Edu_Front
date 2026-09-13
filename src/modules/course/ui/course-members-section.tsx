import { useMemo, useState } from "react";
import { Search, UserMinus, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DomainUser } from "@/shared/types";
import { Avatar, Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { useCourseStudents, useUnenrollStudent } from "../model/course.queries";
import { AddStudentDialog } from "./add-student-dialog";

export interface CourseMembersSectionProps {
  courseId: string | null;
  canManage: boolean;
}

const SEARCH_THRESHOLD = 8;

export function CourseMembersSection({ courseId, canManage }: CourseMembersSectionProps) {
  const { t } = useTranslation("group");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<DomainUser | null>(null);
  const studentsQuery = useCourseStudents(courseId, { page_size: 100 });
  const unenroll = useUnenrollStudent();

  const all = useMemo(
    () => (studentsQuery.data?.items ?? []).map((item) => item.student),
    [studentsQuery.data]
  );
  const students = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return all;
    return all.filter((item) => `${item.name} ${item.username}`.toLowerCase().includes(query));
  }, [all, search]);

  function confirmRemove() {
    if (!removeTarget || !courseId) return;
    unenroll.mutate(
      { courseId, studentId: removeTarget.id },
      { onSuccess: () => setRemoveTarget(null) }
    );
  }

  return (
    <div className="info-section info-members">
      <div className="info-members-head">
        <span className="info-section-title">{t("students.title")}</span>
        <span className="info-members-count">
          {t("students.countSuffix", { count: studentsQuery.data?.total ?? all.length })}
        </span>
      </div>

      {canManage ? (
        <button type="button" className="info-members-add" onClick={() => setAddOpen(true)}>
          <UserPlus size={16} /> {t("students.addStudent")}
        </button>
      ) : null}

      {all.length > SEARCH_THRESHOLD ? (
        <label className="info-members-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("students.searchPlaceholder")}
          />
        </label>
      ) : null}

      {studentsQuery.isLoading ? (
        <div className="student-tab-loading">
          <span />
        </div>
      ) : (
        <div className="info-members-list">
          {students.map((student) => (
            <div className="info-member-row" key={student.id}>
              <Avatar name={student.name} tone={student.avatarTone} size="sm" />
              <span className="info-member-identity">
                <strong>{student.name}</strong>
                <small>@{student.username}</small>
              </span>
              {canManage ? (
                <button
                  type="button"
                  className="info-member-remove"
                  aria-label={t("students.removeAria", { name: student.name })}
                  onClick={() => setRemoveTarget(student)}
                >
                  <UserMinus size={16} />
                </button>
              ) : null}
            </div>
          ))}
          {!students.length ? <p className="info-description">{t("students.empty")}</p> : null}
        </div>
      )}

      {canManage ? <AddStudentDialog courseId={courseId} open={addOpen} onOpenChange={setAddOpen} /> : null}
      <Dialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        {removeTarget && (
          <DialogContent
            title={t("students.removeDialogTitle")}
            description={t("students.removeDialogDescription", { name: removeTarget.name })}
          >
            <div className="dialog-actions">
              <Button variant="secondary" onClick={() => setRemoveTarget(null)}>
                {t("students.cancel")}
              </Button>
              <Button loading={unenroll.isPending} onClick={confirmRemove}>
                {t("students.remove")}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
