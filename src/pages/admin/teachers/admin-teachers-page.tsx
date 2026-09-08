import type { ReactNode } from "react";
import { ArrowLeft, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApproveTeacher, usePendingTeachers, useTeachers } from "@/modules/auth";
import { RatingSummary } from "@/modules/lesson";
import { ROUTES } from "@/shared/config";
import type { AuthUser } from "@/shared/types";
import { Avatar, Button, LoadingFallback } from "@/shared/ui/legacy";

function TeacherRow({ teacher, action }: { teacher: AuthUser; action?: ReactNode }) {
  return (
    <article className="admin-teacher-row">
      <Avatar name={teacher.name} src={teacher.avatarUrl} size="sm" />
      <div>
        <strong>{teacher.name}</strong>
        <small>@{teacher.username}</small>
      </div>
      <RatingSummary average={teacher.avgRating} count={teacher.ratingCount ?? 0} compact />
      {action}
    </article>
  );
}

export function AdminTeachersPage() {
  const { t } = useTranslation("admin");
  const pending = usePendingTeachers();
  const teachers = useTeachers();
  const approve = useApproveTeacher();

  return (
    <main className="portal-page admin-page">
      <div className="portal-page-heading">
        <div>
          <span className="portal-eyebrow">
            <ShieldCheck size={14} /> {t("teachers.eyebrow")}
          </span>
          <h1>{t("teachers.title")}</h1>
          <p>{t("teachers.subtitle")}</p>
        </div>
        <Link className="portal-primary-link" to={ROUTES.admin.dashboard}>
          <ArrowLeft size={15} /> {t("teachers.backToDashboard")}
        </Link>
      </div>

      <section className="portal-card admin-teacher-panel">
        <div className="portal-section-head">
          <div>
            <span>{t("teachers.pendingEyebrow")}</span>
            <h2>{t("teachers.pendingTitle")}</h2>
          </div>
        </div>
        {pending.isLoading ? <LoadingFallback label={t("teachers.loading")} /> : null}
        <div className="admin-teacher-list">
          {(pending.data ?? []).map((teacher) => (
            <TeacherRow
              key={teacher.id}
              teacher={teacher}
              action={
                <Button
                  size="sm"
                  loading={approve.isPending && approve.variables === teacher.id}
                  onClick={() => approve.mutate(teacher.id)}
                >
                  {t("teachers.approve")}
                </Button>
              }
            />
          ))}
          {!pending.isLoading && !pending.data?.length ? (
            <p className="portal-muted">{t("teachers.noPending")}</p>
          ) : null}
        </div>
      </section>

      <section className="portal-card admin-teacher-panel">
        <div className="portal-section-head">
          <div>
            <span>
              <Users size={13} /> {t("teachers.allEyebrow")}
            </span>
            <h2>{t("teachers.allTitle")}</h2>
          </div>
        </div>
        {teachers.isLoading ? <LoadingFallback label={t("teachers.loading")} /> : null}
        <div className="admin-teacher-list">
          {(teachers.data ?? []).map((teacher) => (
            <TeacherRow key={teacher.id} teacher={teacher} />
          ))}
          {!teachers.isLoading && !teachers.data?.length ? (
            <p className="portal-muted">{t("teachers.noTeachers")}</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
