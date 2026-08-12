import { Pencil, Star, Trash2, Video } from "lucide-react";
import type { Lesson } from "@/shared/types";
import { Button } from "@/shared/ui/legacy";
import { isLessonClosed } from "../lib/lesson-status";

export interface LessonActionsProps {
  lesson: Lesson;
  onJoin: (lesson: Lesson) => void;
  onFinish: (lesson: Lesson) => void;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
  /** Berilsa — tugagan darsda o'quvchilar baholari nishoni ko'rinadi. */
  onRatings?: (lesson: Lesson) => void;
  /** Tor joyda (kalendar kataklari ostida) faqat ikonkalar ko'rsatiladi. */
  compact?: boolean;
}

/**
 * Dars ustidagi amallar. Kalendar ham, ro'yxat ham shu bitta blokni ishlatadi —
 * "Yakunlash faqat live darsda" qoidasi kalendar va ro‘yxat uchun bir joyda turadi.
 */
export function LessonActions({
  lesson,
  onJoin,
  onFinish,
  onEdit,
  onDelete,
  onRatings,
  compact = false,
}: LessonActionsProps) {
  return (
    <div className={`lesson-actions ${compact ? "lesson-actions--compact" : ""}`}>
      {lesson.status === "finished" && onRatings ? (
        <button
          type="button"
          className="rating-chip"
          onClick={() => onRatings(lesson)}
          aria-label={`Dars baholari — ${lesson.ratingCount} ta`}
        >
          <Star size={14} className="is-filled" />
          {lesson.avgRating === null ? "—" : lesson.avgRating.toFixed(1)}
          {compact ? null : <small>{lesson.ratingCount} ta</small>}
        </button>
      ) : null}

      {lesson.status !== "finished" ? (
        <Button size="sm" disabled={isLessonClosed(lesson)} onClick={() => onJoin(lesson)}>
          <Video size={16} />
          {compact ? null : " Kirish"}
        </Button>
      ) : null}

      {lesson.status === "live" ? (
        <Button size="sm" variant="secondary" onClick={() => onFinish(lesson)}>
          Yakunlash
        </Button>
      ) : null}

      <button className="icon-button" onClick={() => onEdit(lesson)} aria-label="Darsni tahrirlash">
        <Pencil size={16} />
      </button>
      <button
        className="icon-button destructive-icon"
        onClick={() => onDelete(lesson)}
        aria-label="Darsni o‘chirish"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
