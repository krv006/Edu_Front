import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, Users } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTeachers } from "@/modules/auth";
import { RatingSummary } from "@/modules/lesson";
import { ROUTES } from "@/shared/config";
import type { AuthUser } from "@/shared/types";
import { Avatar, LoadingFallback } from "@/shared/ui/legacy";
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
  onStats,
}: {
  teacher: AuthUser;
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
    </article>
  );
}

export function AdminTeachersPage() {
  const { t } = useTranslation("admin");
  const teachers = useTeachers();
  const [statsTarget, setStatsTarget] = useState<AuthUser | null>(null);
  const [params] = useSearchParams();
  const highlightId = params.get("teacher");
  useTeacherHighlight(highlightId, (teachers.data?.length ?? 0) > 0);

  return (
    <main className="portal-page admin-page">
      <div className="portal-page-heading">
        <div>
          <span className="portal-eyebrow">
            <Users size={14} /> {t("teachers.eyebrow")}
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
            <span>
              <Users size={13} /> {t("teachers.allEyebrow")}
            </span>
            <h2>{t("teachers.allTitle")}</h2>
          </div>
          <span className="admin-teacher-count">
            {t("teachers.countLabel", { count: teachers.data?.length ?? 0 })}
          </span>
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
