import { FileQuestion, Pencil, PlayCircle, Star, Trash2, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Lesson } from "@/shared/types";
import { Button } from "@/shared/ui/legacy";
import { isLessonClosed, isLessonEditable, isLessonJoinable } from "../lib/lesson-status";

export interface LessonActionsProps {
  lesson: Lesson;
  onJoin: (lesson: Lesson) => void;
  onFinish?: (lesson: Lesson) => void;
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lesson: Lesson) => void;
  onRatings?: (lesson: Lesson) => void;
  onRecording?: (lesson: Lesson) => void;
  onRate?: (lesson: Lesson) => void;
  onCreateQuiz?: (lesson: Lesson) => void;
  compact?: boolean;
}

export function LessonActions({
  lesson,
  onJoin,
  onFinish,
  onEdit,
  onDelete,
  onRatings,
  onRecording,
  onRate,
  onCreateQuiz,
  compact = false,
}: LessonActionsProps) {
  const { t } = useTranslation("lesson");
  const finished = lesson.status === "finished";
  const joinDisabled = !isLessonJoinable(lesson);
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
          aria-label={t("actions.ratingsAria", { count: lesson.ratingCount })}
        >
          {ratingChip}
        </button>
      ) : ratingChip ? (
        <span className="rating-chip rating-chip--static">{ratingChip}</span>
      ) : null}

      {!finished ? (
        <Button
          size="sm"
          disabled={joinDisabled}
          title={joinDisabled && !isLessonClosed(lesson) ? t("actions.joinDisabledTitle") : undefined}
          onClick={() => onJoin(lesson)}
        >
          <Video size={16} />
          {compact ? null : ` ${t("actions.join")}`}
        </Button>
      ) : onRecording ? (
        <Button size="sm" onClick={() => onRecording(lesson)}>
          <PlayCircle size={16} />
          {compact ? null : ` ${t("actions.view")}`}
        </Button>
      ) : null}

      {lesson.status === "live" && onFinish ? (
        <Button size="sm" variant="secondary" onClick={() => onFinish(lesson)}>
          {t("actions.finish")}
        </Button>
      ) : null}

      {finished && onRate ? (
        <Button size="sm" variant="secondary" onClick={() => onRate(lesson)}>
          <Star size={16} />
          {compact ? null : ` ${t("actions.rate")}`}
        </Button>
      ) : null}

      {onCreateQuiz ? (
        <button
          className="icon-button"
          onClick={() => onCreateQuiz(lesson)}
          aria-label={t("actions.createQuizAria")}
          title={t("actions.createQuiz")}
        >
          <FileQuestion size={16} />
        </button>
      ) : null}
      {onEdit && isLessonEditable(lesson) ? (
        <button className="icon-button" onClick={() => onEdit(lesson)} aria-label={t("actions.editAria")}>
          <Pencil size={16} />
        </button>
      ) : null}
      {onDelete ? (
        <button
          className="icon-button destructive-icon"
          onClick={() => onDelete(lesson)}
          aria-label={t("actions.deleteAria")}
        >
          <Trash2 size={16} />
        </button>
      ) : null}
    </div>
  );
}
