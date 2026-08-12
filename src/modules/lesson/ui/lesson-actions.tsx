import { Pencil, PlayCircle, Star, Trash2, Video } from "lucide-react";
import type { Lesson } from "@/shared/types";
import { Button } from "@/shared/ui/legacy";
import { isLessonClosed } from "../lib/lesson-status";

export interface LessonActionsProps {
  lesson: Lesson;
  onJoin: (lesson: Lesson) => void;
  /**
   * Quyidagilar IXTIYORIY: berilmasa tugmasi umuman chizilmaydi.
   * O'quvchi darsni yakunlay, tahrirlay yoki o'chira olmaydi, shuning uchun
   * u faqat kerakli amallarni uzatadi va ro'yxat/kalendar ikkala rolda ham
   * bir xil ko'rinadi.
   */
  onFinish?: (lesson: Lesson) => void;
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lesson: Lesson) => void;
  /** Berilsa — baholar nishoni bosiladigan bo'ladi (o'qituvchi ro'yxatni ochadi). */
  onRatings?: (lesson: Lesson) => void;
  /** Tugagan darsning video yozuvi. */
  onRecording?: (lesson: Lesson) => void;
  /** O'quvchi tugagan darsga baho qo'yadi. */
  onRate?: (lesson: Lesson) => void;
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
  onRecording,
  onRate,
  compact = false,
}: LessonActionsProps) {
  const finished = lesson.status === "finished";
  /** Baho nishoni: o'qituvchida bosiladi, o'quvchida shunchaki ko'rsatiladi. */
  const ratingChip =
    finished && (onRatings || lesson.ratingCount > 0) ? (
      <>
        <Star size={14} className="is-filled" />
        {lesson.avgRating === null ? "—" : lesson.avgRating.toFixed(1)}
        {compact ? null : <small>{lesson.ratingCount} ta</small>}
      </>
    ) : null;

  return (
    <div className={`lesson-actions ${compact ? "lesson-actions--compact" : ""}`}>
      {ratingChip && onRatings ? (
        <button
          type="button"
          className="rating-chip"
          onClick={() => onRatings(lesson)}
          aria-label={`Dars baholari — ${lesson.ratingCount} ta`}
        >
          {ratingChip}
        </button>
      ) : ratingChip ? (
        <span className="rating-chip rating-chip--static">{ratingChip}</span>
      ) : null}

      {!finished ? (
        <Button size="sm" disabled={isLessonClosed(lesson)} onClick={() => onJoin(lesson)}>
          <Video size={16} />
          {compact ? null : " Kirish"}
        </Button>
      ) : null}

      {lesson.status === "live" && onFinish ? (
        <Button size="sm" variant="secondary" onClick={() => onFinish(lesson)}>
          Yakunlash
        </Button>
      ) : null}

      {finished && onRecording ? (
        <Button size="sm" variant="secondary" onClick={() => onRecording(lesson)}>
          <PlayCircle size={16} />
          {compact ? null : " Yozuv"}
        </Button>
      ) : null}

      {finished && onRate ? (
        <Button size="sm" variant="secondary" onClick={() => onRate(lesson)}>
          <Star size={16} />
          {compact ? null : " Baholash"}
        </Button>
      ) : null}

      {onEdit ? (
        <button className="icon-button" onClick={() => onEdit(lesson)} aria-label="Darsni tahrirlash">
          <Pencil size={16} />
        </button>
      ) : null}
      {onDelete ? (
        <button
          className="icon-button destructive-icon"
          onClick={() => onDelete(lesson)}
          aria-label="Darsni o‘chirish"
        >
          <Trash2 size={16} />
        </button>
      ) : null}
    </div>
  );
}
