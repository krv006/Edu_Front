import type { Lesson, LessonStatus } from "@/shared/types";

export interface LessonStatusMeta {
  label: string;
  /** CSS modifikatori: `.lesson-status--live` va h.k. */
  tone: "scheduled" | "live" | "finished" | "cancelled";
}

/**
 * Dars holatining ko'rinishi — kalendar ham, ro'yxat ham shu yerdan oladi,
 * shuning uchun rang va yorliq ikki joyda ajralib ketmaydi.
 */
const STATUS_META: Record<LessonStatus, LessonStatusMeta> = {
  scheduled: { label: "Rejalashtirilgan", tone: "scheduled" },
  live: { label: "Jonli efirda", tone: "live" },
  finished: { label: "Tugagan", tone: "finished" },
  cancelled: { label: "Bekor qilingan", tone: "cancelled" },
};

const FALLBACK: LessonStatusMeta = { label: "Noma’lum", tone: "scheduled" };

export function lessonStatusMeta(status: LessonStatus): LessonStatusMeta {
  return STATUS_META[status] ?? FALLBACK;
}

/** Tugagan va bekor qilingan darsga qayta kirib bo'lmaydi. */
export const CLOSED_LESSON_STATUSES: LessonStatus[] = ["finished", "cancelled"];

export function isLessonClosed(lesson: Lesson): boolean {
  return CLOSED_LESSON_STATUSES.includes(lesson.status);
}

/** Boshlanish vaqti hali kelmagan "scheduled" darsga erta kirib bo'lmaydi. */
export function isLessonJoinable(lesson: Lesson, now = new Date()): boolean {
  if (isLessonClosed(lesson)) return false;
  if (lesson.status === "scheduled") return new Date(lesson.startsAt) <= now;
  return true;
}

/** Jonli ketayotgan darsning ma'lumotlarini tahrirlab bo'lmaydi — faqat tugagan/hali boshlanmagan. */
export function isLessonEditable(lesson: Lesson): boolean {
  return lesson.status !== "live";
}
