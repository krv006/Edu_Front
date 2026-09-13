import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, BarChart3, ShieldCheck, Users } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApproveTeacher, usePendingTeachers, useTeachers } from "@/modules/auth";
import { RatingSummary } from "@/modules/lesson";
import { ROUTES } from "@/shared/config";
import type { AuthUser } from "@/shared/types";
import { Avatar, Button, LoadingFallback } from "@/shared/ui/legacy";
import { TeacherStatsDialog } from "./teacher-stats-dialog";

function useTeacherHighlight(teacherId: string | null, ready: boolean) {
  useEffect(() => {
    if (!teacherId || !ready) return;
    document
      .querySelector(`[data-teacher-id="${CSS.escape(teacherId)}"]`)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [teacherId, ready]);
}

function TeacherRow({
  teacher,
  action,
  onStats,
}: {
  teacher: AuthUser;
  action?: ReactNode;
  onStats?: (teacher: AuthUser) => void;
}) {
  const { t } = useTranslation("admin");
  return (
    <article className="admin-teacher-row" data-teacher-id={teacher.id}>
      <Avatar name={teacher.name} src={teacher.avatarUrl} size="sm" />
      <div>
        <strong>{teacher.name}</strong>
        <small>@{teacher.username}</small>
      </div>
      <RatingSummary average={teacher.avgRating} count={teacher.ratingCount ?? 0} compact />
      {onStats ? (
        <button
          className="icon-button"
          onClick={() => onStats(teacher)}
          aria-label={t("stats.openAria", { name: teacher.name })}
          title={t("stats.open")}
        >
          <BarChart3 size={16} />
        </button>
      ) : null}
      {action}
    </article>
  );
}

export function AdminTeachersPage() {
  const { t } = useTranslation("admin");
  const pending = usePendingTeachers();
  const teachers = useTeachers();
  const approve = useApproveTeacher();
  const [statsTarget, setStatsTarget] = useState<AuthUser | null>(null);
  const [params] = useSearchParams();
  const highlightId = params.get("teacher");
  useTeacherHighlight(highlightId, (pending.data?.length ?? 0) > 0);

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
              onStats={setStatsTarget}
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
            <TeacherRow key={teacher.id} teacher={teacher} onStats={setStatsTarget} />
          ))}
          {!teachers.isLoading && !teachers.data?.length ? (
            <p className="portal-muted">{t("teachers.noTeachers")}</p>
          ) : null}
        </div>
      </section>

      <TeacherStatsDialog teacher={statsTarget} onClose={() => setStatsTarget(null)} />
    </main>
  );
}
