import { Star } from "lucide-react";
import { formatDateTime } from "@/shared/lib";
import type { Lesson } from "@/shared/types";
import { Avatar, Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { useLessonRatings } from "../model/lesson.queries";
import { StarRating } from "./star-rating";

export interface LessonRatingsDialogProps {
  /** `null` — dialog yopiq. */
  lesson: Lesson | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Darsga qo'yilgan baholar (o'qituvchi ko'rinishi).
 *
 * Baholar anonim emas, shuning uchun har qatorda o'quvchi ismi turadi.
 * O'rtacha ko'rsatkich darslar ro'yxatidan keladi — bu yerda qayta hisoblanmaydi.
 */
export function LessonRatingsDialog({ lesson, onOpenChange }: LessonRatingsDialogProps) {
  const ratings = useLessonRatings(lesson?.id ?? null);
  const rows = ratings.data ?? [];

  return (
    <Dialog open={Boolean(lesson)} onOpenChange={onOpenChange}>
      {lesson ? (
        <DialogContent
          title="Dars baholari"
          description={`“${lesson.title}” bo‘yicha o‘quvchilar fikri.`}
        >
          <div className="rating-panel">
            <div className="rating-panel-head">
              <span className="rating-average">
                <Star size={16} className="is-filled" />
                {lesson.avgRating === null ? "—" : lesson.avgRating.toFixed(1)}
              </span>
              <small>{lesson.ratingCount} ta baho</small>
            </div>

            {ratings.isLoading ? (
              <div className="student-tab-loading">
                <span />
              </div>
            ) : ratings.data === null ? (
              <div className="rating-empty">
                <p>Baholash serverda hali yoqilmagan.</p>
              </div>
            ) : ratings.isError ? (
              <div className="rating-empty">
                <p>Baholarni yuklab bo‘lmadi.</p>
                <Button size="sm" variant="secondary" onClick={() => ratings.refetch()}>
                  Qayta urinish
                </Button>
              </div>
            ) : rows.length ? (
              <ul className="rating-list">
                {rows.map((row) => (
                  <li key={row.id}>
                    <Avatar name={row.studentName} size="sm" />
                    <div>
                      <strong>{row.studentName}</strong>
                      <StarRating value={row.stars} readOnly size={14} />
                      {row.description ? <p>{row.description}</p> : null}
                    </div>
                    <time>{formatDateTime(row.createdAt)}</time>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rating-empty">
                <p>Bu darsni hali hech kim baholamagan.</p>
              </div>
            )}
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
