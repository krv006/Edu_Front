import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { BoardPanel } from "@/modules/board";
import { useLesson } from "@/modules/lesson";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";

/**
 * Dars tugagach backend kurs chatiga ".../boards/<lesson_id>" havolasini yuboradi
 * (docs/README §Frontend integratsiyasi) — shu havola aynan shu sahifaga tushadi.
 */
export function BoardPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = useLesson(lessonId ?? null);

  if (lesson.isLoading || (!lesson.isError && !lesson.data))
    return <LoadingFallback label="Doska yuklanmoqda" />;
  if (lesson.isError)
    return (
      <RouteState
        eyebrow="DOSKA"
        title="Darsni topib bo‘lmadi"
        description={lesson.error?.message}
        actionLabel="Qayta urinish"
        onAction={lesson.refetch}
      />
    );

  const data = lesson.data!;

  return (
    <div className="portal-page board-page">
      <div className="portal-page-heading">
        <div>
          <span className="portal-eyebrow">DARS DOSKASI</span>
          <h1>{data.title}</h1>
          <p>
            {data.courseTitle} · <CalendarDays size={14} /> {data.date} ·{" "}
            <Clock3 size={14} /> {data.time}
          </p>
        </div>
        <button className="button button--secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={17} /> Orqaga
        </button>
      </div>
      <section className="portal-card board-page-canvas">
        <BoardPanel lessonId={data.id} courseId={data.courseId} />
      </section>
    </div>
  );
}
