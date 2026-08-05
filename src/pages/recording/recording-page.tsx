import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/modules/auth";
import { LessonRecordingPlayer, useLesson, useLessonRecording } from "@/modules/lesson";
import { ROLES } from "@/shared/constants";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";

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

  return (
    <div className="portal-page recording-page">
      <div className="portal-page-heading">
        <div>
          <span className="portal-eyebrow">DARS YOZUVI</span>
          <h1>{data.title}</h1>
          <p>
            {data.courseTitle} · <CalendarDays size={14} /> {data.date} · <Clock3 size={14} />{" "}
            {data.time}
          </p>
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
    </div>
  );
}
