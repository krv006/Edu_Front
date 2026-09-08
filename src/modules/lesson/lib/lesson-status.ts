import { useTranslation } from "react-i18next";
import type { Lesson, LessonStatus } from "@/shared/types";

export interface LessonStatusMeta {
  label: string;
  /** CSS modifikatori: `.lesson-status--live` va h.k. */
  tone: "scheduled" | "live" | "finished" | "cancelled";
}

const STATUS_TONES: Record<LessonStatus, LessonStatusMeta["tone"]> = {
  scheduled: "scheduled",
  live: "live",
  finished: "finished",
  cancelled: "cancelled",
};

/**
 * Dars holatining ko'rinishi — kalendar ham, ro'yxat ham shu yerdan oladi,
 * shuning uchun rang va yorliq ikki joyda ajralib ketmaydi. Hook — tanlangan
 * til o'zgarganda yorliq ham darhol yangilanishi uchun.
 */
export function useLessonStatusMeta() {
  const { t } = useTranslation("lesson");
  return (status: LessonStatus): LessonStatusMeta => ({
    label: t(`status.${status}`, t("status.unknown")),
    tone: STATUS_TONES[status] ?? "scheduled",
  });
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
