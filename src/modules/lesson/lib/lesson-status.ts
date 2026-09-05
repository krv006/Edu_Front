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

/**
 * Bugun yoki kelajakka rejalashtirilgan "scheduled" darsga istalgan vaqt
 * kirish mumkin (aniq soatini kutish shart emas — o'qituvchi xonani oldindan
 * tayyorlab qo'yishi uchun). Faqat KUNI allaqachon o'tib ketgan, hech qachon
 * boshlanmagan (hamon "scheduled") darslar bloklanadi — aks holda ular
 * abadiy "kirish mumkin" bo'lib qolar edi (2026-09-05, foydalanuvchi
 * xabar bergan xato: teskari ishlagan — eskilariga kirsa bo'lardi, yangi/
 * kelajakdagilarga kirib bo'lmasdi).
 */
export function isLessonJoinable(lesson: Lesson, now = new Date()): boolean {
  if (isLessonClosed(lesson)) return false;
  if (lesson.status === "scheduled") {
    const lessonDay = startOfDay(new Date(lesson.startsAt));
    return lessonDay >= startOfDay(now);
  }
  return true;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Jonli ketayotgan darsning ma'lumotlarini tahrirlab bo'lmaydi — faqat tugagan/hali boshlanmagan. */
export function isLessonEditable(lesson: Lesson): boolean {
  return lesson.status !== "live";
}
