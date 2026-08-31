import { BarChart3, BookOpen, ListChecks, TrendingUp } from "lucide-react";
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
  const rate = Math.min(100, Math.max(0, course.submissionRate));
  return (
    <article className="homework-report-row">
      <div className="homework-report-row-head">
        <strong>{course.courseTitle}</strong>
        <span className={scoreToneClass(course.averageScore)}>
          {course.averageScore == null ? "Baho yo‘q" : `${scoreLabel(course.averageScore)} ball`}
        </span>
      </div>
      <div
        className="homework-report-progress"
        role="progressbar"
        aria-valuenow={rate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${course.courseTitle}: topshirilgan vazifalar ${rate}%`}
      >
        <span style={{ width: `${rate}%` }} />
      </div>
      <small>
        {course.submittedCount}/{course.assignedCount} vazifa topshirilgan · {rate}%
      </small>
    </article>
  );
}

export interface HomeworkReportViewProps {
  report: HomeworkReport;
}

/** O'quvchi/ota-ona reyting sahifasida qayta ishlatiladi. */
export function HomeworkReportView({ report }: HomeworkReportViewProps) {
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
            <small>Berilgan vazifalar</small>
          </div>
        </article>
        <article className="portal-metric portal-metric--violet">
          <span>
            <ListChecks size={20} />
          </span>
          <div>
            <strong>{overall.submissionRate}%</strong>
            <small>
              Topshirilgan ({overall.submittedCount}/{overall.assignedCount})
            </small>
          </div>
        </article>
        <article className="portal-metric portal-metric--emerald">
          <span>
            <TrendingUp size={20} />
          </span>
          <div>
            <strong>{scoreLabel(overall.averageScore)}</strong>
            <small>O‘rtacha ball</small>
          </div>
        </article>
        <article className="portal-metric portal-metric--amber">
          <span>
            <BarChart3 size={20} />
          </span>
          <div>
            <strong>{courses.length}</strong>
            <small>Fanlar soni</small>
          </div>
        </article>
      </section>

      <section className="portal-card homework-report-list">
        <div className="portal-section-head">
          <div>
            <span>FANLAR BO‘YICHA</span>
            <h2>Har bir kurs statistikasi</h2>
          </div>
        </div>
        {courses.map((course) => (
          <CourseReportRow key={course.courseId} course={course} />
        ))}
        {!courses.length ? (
          <div className="portal-empty">
            <BookOpen size={28} />
            <h2>Hali statistika yo‘q</h2>
            <p>Kursga yozilib, vazifa topshirgach shu yerda ko‘rinadi.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
