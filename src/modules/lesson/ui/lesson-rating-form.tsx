import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/shared/lib";
import type { Lesson } from "@/shared/types";
import { Button } from "@/shared/ui/legacy";
import { useLessonRatings, useRateLesson } from "../model/lesson.queries";
import { StarRating } from "./star-rating";

const MAX_DESCRIPTION = 500;

export interface LessonRatingFormProps {
  lesson: Lesson;
  /** O'z bahosini topish uchun — topilsa forma o'rniga "rahmat" holati chiqadi. */
  currentUserId?: string;
  /** Baho yuborilgandan keyin (dialogni yopish uchun). */
  onSubmitted?: () => void;
  /** Bekor tugmasi — dialogda kerak, sahifa ichida emas. */
  onCancel?: () => void;
}

/**
 * O'quvchining dars bahosi: yulduz + izoh.
 *
 * Faqat tugagan darsda ochiladi — backend ham shuni talab qiladi, shuning uchun
 * boshqa holatda forma o'rniga tushuntirish ko'rsatiladi. Baho anonim emas va
 * bu forma tepasida ochiq aytiladi.
 */
export function LessonRatingForm({
  lesson,
  currentUserId,
  onSubmitted,
  onCancel,
}: LessonRatingFormProps) {
  const [draft, setDraft] = useState<{ stars: number; description: string } | null>(null);
  const ratings = useLessonRatings(lesson.id, lesson.status === "finished");
  const rate = useRateLesson();

  // Ro'yxatni ko'rish huquqi bo'lmasa `data` bo'sh qoladi — forma baribir ochiladi,
  // takroriy bahoni backend rad etadi va xabari shu yerda ko'rinadi.
  const mine = currentUserId
    ? (ratings.data?.find((item) => item.studentId === currentUserId) ?? null)
    : null;
  const value = draft ?? { stars: 0, description: "" };

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.stars) return;
    rate.mutate(
      { id: lesson.id, input: { stars: value.stars, description: value.description } },
      {
        onSuccess: () => {
          setDraft(null);
          onSubmitted?.();
        },
      }
    );
  }

  if (lesson.status !== "finished") {
    return <p className="portal-muted">Dars tugagach baholay olasiz.</p>;
  }

  if (ratings.isLoading) {
    return (
      <div className="student-tab-loading">
        <span />
      </div>
    );
  }

  // `null` — baholash API bu backendda hali yo'q: formani ko'rsatishdan ma'no yo'q.
  if (ratings.data === null) {
    return <p className="portal-muted">Baholash serverda hali yoqilmagan.</p>;
  }

  if (mine) {
    return (
      <div className="rating-thanks">
        <span className="rating-thanks-icon">
          <CheckCircle2 size={20} />
        </span>
        <div>
          <strong>Bahoyingiz qabul qilingan</strong>
          <StarRating value={mine.stars} readOnly size={17} />
          {mine.description ? <p>{mine.description}</p> : null}
          <small>{formatDateTime(mine.createdAt)}</small>
        </div>
      </div>
    );
  }

  return (
    <form className="rating-form" onSubmit={submit}>
      <div className="rating-form-stars">
        <StarRating
          value={value.stars}
          disabled={rate.isPending}
          onChange={(stars) => setDraft({ ...value, stars })}
        />
        <span>{value.stars ? `${value.stars} / 5` : "Yulduzni tanlang"}</span>
      </div>

      <label className="field-group">
        <span>Izoh</span>
        <textarea
          rows={3}
          maxLength={MAX_DESCRIPTION}
          value={value.description}
          placeholder="Dars qanday o‘tdi? O‘qituvchida nima yoqdi, nimani yaxshilash mumkin?"
          disabled={rate.isPending}
          onChange={(event) => setDraft({ ...value, description: event.target.value })}
        />
      </label>

      <p className="portal-muted">Baho anonim emas — o‘qituvchi kim yozganini ko‘radi.</p>

      {rate.isError ? <p className="rating-form-error">{rate.error.message}</p> : null}

      <div className="dialog-actions">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Keyinroq
          </Button>
        ) : null}
        <Button type="submit" disabled={!value.stars} loading={rate.isPending}>
          Bahoni yuborish
        </Button>
      </div>
    </form>
  );
}
