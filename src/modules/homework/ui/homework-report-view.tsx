import { BarChart3, BookOpen, ListChecks, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CourseHomeworkReport, HomeworkReport } from "@/shared/types";

function scoreLabel(score: number | null): string {
  return score == null ? "—" : String(Math.round(score));
}

function scoreToneClass(score: number | null): string {
  if (score == null) return "grade-pill";
  if (score >= 80) return "grade-pill";
  if (score >= 50) return "grade-pill grade-pill--checking";
  return "grade-pill grade-pill--error";
}

function CourseReportRow({ course }: { course: CourseHomeworkReport }) {
  const { t } = useTranslation("homework");
  const rate = Math.min(100, Math.max(0, course.submissionRate));
  return (
    <article className="homework-report-row">
      <div className="homework-report-row-head">
        <strong>{course.courseTitle}</strong>
        <span className={scoreToneClass(course.averageScore)}>
          {course.averageScore == null
            ? t("report.noGrade")
            : `${scoreLabel(course.averageScore)} ${t("report.pointsSuffix")}`}
        </span>
      </div>
      <div
        className="homework-report-progress"
        role="progressbar"
        aria-valuenow={rate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("report.progressAria", { course: course.courseTitle, rate })}
      >
        <span style={{ width: `${rate}%` }} />
      </div>
      <small>
        {t("report.submittedOf", {
          submitted: course.submittedCount,
          assigned: course.assignedCount,
          rate,
        })}
      </small>
    </article>
  );
}

export interface HomeworkReportViewProps {
  report: HomeworkReport;
}

/** O'quvchi/ota-ona reyting sahifasida qayta ishlatiladi. */
export function HomeworkReportView({ report }: HomeworkReportViewProps) {
  const { t } = useTranslation("homework");
  const { overall, courses } = report;

  return (
    <div className="homework-report">
      <section className="portal-metric-grid">
        <article className="portal-metric portal-metric--blue">
          <span>
            <BookOpen size={20} />
          </span>
          <div>
            <strong>{overall.assignedCount}</strong>
            <small>{t("report.assignedCount")}</small>
          </div>
        </article>
        <article className="portal-metric portal-metric--violet">
          <span>
            <ListChecks size={20} />
          </span>
          <div>
            <strong>{overall.submissionRate}%</strong>
            <small>
              {t("report.submittedRate", {
                submitted: overall.submittedCount,
                assigned: overall.assignedCount,
              })}
            </small>
          </div>
        </article>
        <article className="portal-metric portal-metric--emerald">
          <span>
            <TrendingUp size={20} />
          </span>
          <div>
            <strong>{scoreLabel(overall.averageScore)}</strong>
            <small>{t("report.averageScore")}</small>
          </div>
        </article>
        <article className="portal-metric portal-metric--amber">
          <span>
            <BarChart3 size={20} />
          </span>
          <div>
            <strong>{courses.length}</strong>
            <small>{t("report.subjectsCount")}</small>
          </div>
        </article>
      </section>

      <section className="portal-card homework-report-list">
        <div className="portal-section-head">
          <div>
            <span>{t("report.bySubjectEyebrow")}</span>
            <h2>{t("report.bySubjectTitle")}</h2>
          </div>
        </div>
        {courses.map((course) => (
          <CourseReportRow key={course.courseId} course={course} />
        ))}
        {!courses.length ? (
          <div className="portal-empty">
            <BookOpen size={28} />
            <h2>{t("report.emptyTitle")}</h2>
            <p>{t("report.emptyDescription")}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
