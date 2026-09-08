import { useNavigate } from "react-router-dom";
import { Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/shared/config";
import { useLiveLesson } from "../model/lesson.queries";

export interface LiveLessonBarProps {
  courseId: string | null;
}

/**
 * Chat tepasidagi "dars ketmoqda" chizig'i (Telegram video chat uslubi).
 *
 * Jonli dars bo'lmasa umuman render qilinmaydi — chat balandligi bekorga
 * qisqarmaydi va tepada bo'sh joy qolmaydi.
 */
export function LiveLessonBar({ courseId }: LiveLessonBarProps) {
  const { t } = useTranslation("lesson");
  const navigate = useNavigate();
  const lesson = useLiveLesson(courseId).data;

  if (!lesson) return null;

  return (
    <div className="live-lesson-bar" role="status">
      <span className="live-lesson-bar-dot" aria-hidden="true" />
      <span className="live-lesson-bar-text">
        <strong>{t("liveBar.inProgress")}</strong>
        <small>{lesson.title}</small>
      </span>
      <button type="button" onClick={() => navigate(ROUTES.live(lesson.id))}>
        <Video size={15} /> {t("liveBar.join")}
      </button>
    </div>
  );
}
