import { useTranslation } from "react-i18next";
import { useTeacherRatings, useTeacherStats } from "@/modules/auth";
import type { AuthUser } from "@/shared/types";
import { Dialog, DialogContent, LoadingFallback, RouteState } from "@/shared/ui/legacy";

const STAR_LEVELS = ["5", "4", "3", "2", "1"];

export interface TeacherStatsDialogProps {
  teacher: AuthUser | null;
  onClose: () => void;
}

export function TeacherStatsDialog({ teacher, onClose }: TeacherStatsDialogProps) {
  const { t } = useTranslation("admin");
  const open = Boolean(teacher);
  const stats = useTeacherStats(teacher?.id ?? null, open);
  const ratings = useTeacherRatings(teacher?.id ?? null, open);
  const data = stats.data;
  const maxCount = data
    ? Math.max(1, ...STAR_LEVELS.map((level) => Number(data.ratingBreakdown[level] ?? 0)))
    : 1;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : onClose())}>
      {teacher ? (
        <DialogContent
          className="teacher-stats-dialog"
          title={t("stats.title", { name: teacher.name })}
          description={t("stats.description")}
        >
          {stats.isLoading ? <LoadingFallback label={t("stats.loading")} /> : null}

          {stats.isError ? (
            <RouteState
              title={t("stats.loadError")}
              actionLabel={t("stats.retry")}
              onAction={stats.refetch}
            />
          ) : null}

          {data ? (
            <>
              <div className="teacher-stats-grid">
                <article>
                  <strong>{data.avgRating === null ? "—" : data.avgRating.toFixed(1)}</strong>
                  <small>{t("stats.avgRating")}</small>
                </article>
                <article>
                  <strong>{data.ratingCount}</strong>
                  <small>{t("stats.ratingCount")}</small>
                </article>
                <article>
                  <strong>{data.courseCount}</strong>
                  <small>{t("stats.courseCount")}</small>
                </article>
                <article>
                  <strong>{data.studentCount}</strong>
                  <small>{t("stats.studentCount")}</small>
                </article>
                <article>
                  <strong>{data.lessonsFinished}</strong>
                  <small>{t("stats.lessonsFinished")}</small>
                </article>
                <article>
                  <strong>{data.lessonsScheduled}</strong>
                  <small>{t("stats.lessonsScheduled")}</small>
                </article>
                <article>
                  <strong>{data.lessonsCancelled}</strong>
                  <small>{t("stats.lessonsCancelled")}</small>
                </article>
                <article>
                  <strong>{data.reliability === null ? "—" : `${data.reliability.toFixed(1)}%`}</strong>
                  <small>{t("stats.reliability")}</small>
                </article>
              </div>

              <section className="teacher-stats-breakdown">
                <span className="info-section-title">{t("stats.breakdown")}</span>
                {STAR_LEVELS.map((level) => {
                  const count = Number(data.ratingBreakdown[level] ?? 0);
                  return (
                    <div key={level} className="teacher-stats-bar">
                      <span>{level}★</span>
                      <i>
                        <b style={{ width: `${(count / maxCount) * 100}%` }} />
                      </i>
                      <small>{count}</small>
                    </div>
                  );
                })}
              </section>
            </>
          ) : null}

          {ratings.data?.items.length ? (
            <section className="teacher-stats-comments">
              <span className="info-section-title">{t("stats.comments")}</span>
              <ul className="rating-feed">
                {ratings.data.items.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <div>
                      <span className="rating-feed-head">
                        <strong>{item.studentName}</strong>
                        <span className="rating-feed-stars">{item.stars}★</span>
                      </span>
                      {item.description ? <p>{item.description}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
