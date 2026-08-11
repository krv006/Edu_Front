import { ArrowLeft, BookOpen, CalendarDays, Clock3 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/modules/auth";
import {
  LessonRatingForm,
  LessonRecordingPlayer,
  RatingSummary,
  useLesson,
  useLessonRecording,
} from "@/modules/lesson";
import { ROLES } from "@/shared/constants";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";

const LESSON_DATE = new Intl.DateTimeFormat("uz-UZ", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Dars tugagach backend kurs chatiga ".../recordings/<lesson_id>" havolasini yuboradi
 * (docs/PROJECT.md §10) — shu havola aynan shu sahifaga tushadi.
 */
export function RecordingPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const lesson = useLesson(lessonId ?? null);
  const recording = useLessonRecording(lessonId ?? null);

  if (lesson.isLoading || (!lesson.isError && !lesson.data))
    return <LoadingFallback label="Dars yuklanmoqda" />;

  if (lesson.isError)
    return (
      <RouteState
        eyebrow="DARS YOZUVI"
        title="Darsni topib bo‘lmadi"
        description={lesson.error?.message}
        actionLabel="Qayta urinish"
        onAction={lesson.refetch}
      />
    );

  const data = lesson.data!;
  const isStudent = user?.role === ROLES.STUDENT;

  return (
    <div className="portal-page recording-page">
      <div className="portal-page-heading">
        <div>
          <span className="portal-eyebrow">DARS YOZUVI</span>
          <h1>{data.title}</h1>
          {/* Har ma'lumot alohida nishonda — ikonkalar matn oqimini buzmaydi */}
          <div className="page-meta">
            <span>
              <BookOpen size={14} /> {data.courseTitle}
            </span>
            <span>
              <CalendarDays size={14} /> {LESSON_DATE.format(new Date(data.startsAt))}
            </span>
            <span>
              <Clock3 size={14} /> {data.time} · {data.durationMinutes} daqiqa
            </span>
            <RatingSummary average={data.avgRating} count={data.ratingCount} />
          </div>
        </div>
        <button className="button button--secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={17} /> Orqaga
        </button>
      </div>

      <section className="portal-card recording-page-card">
        {recording.isLoading ? (
          <LoadingFallback label="Yozuv yuklanmoqda" />
        ) : recording.isError ? (
          <RouteState
            title="Yozuvni yuklab bo‘lmadi"
            description={recording.error?.message}
            actionLabel="Qayta urinish"
            onAction={recording.refetch}
          />
        ) : (
          <LessonRecordingPlayer
            lessonId={data.id}
            recording={recording.data}
            canDelete={user?.role === ROLES.TEACHER}
          />
        )}
      </section>

      {/* Dars tugagach o'quvchi o'qituvchini baholaydi (docs/COMPLETED_WORK.md — baholash API). */}
      {isStudent ? (
        <section className="portal-card recording-page-card">
          <div className="portal-section-head">
            <div>
              <span>FIKR-MULOHAZA</span>
              <h2>Darsni baholang</h2>
            </div>
          </div>
          <LessonRatingForm lesson={data} currentUserId={user?.id} />
        </section>
      ) : null}
    </div>
  );
}
