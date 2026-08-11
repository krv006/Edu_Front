import type { LessonStatus, UserDto } from "@/shared/types";

/** `GET /api/v1/lessons/` — bitta dars. */
export interface LessonDto {
  id: string | number;
  course: string | number;
  course_title: string;
  title: string;
  starts_at: string;
  duration_min: number;
  status: LessonStatus;
  room_name: string;
  created_at: string;
  /** DRF `DecimalField`ni matn sifatida ham qaytarishi mumkin — ikkalasi ham qabul qilinadi. */
  avg_rating?: number | string | null;
  rating_count?: number | null;
}

/** `POST/PATCH /api/v1/lessons/` tanasi. */
export interface LessonRequestDto {
  course: string | null;
  title: string;
  starts_at: string;
  duration_min: number;
}

/** `status`: egress hali yozmoqda / tugadi / xato (docs/COMPLETED_WORK.md §1). */
export type RecordingStatusDto = "recording" | "completed" | "failed";

/**
 * `GET /api/v1/lessons/<id>/recording/` javobi.
 *
 * Yozuv bo'lmasa backend 404 qaytaradi. `stream_url` faqat `ready: true` bo'lganda
 * keladi va u MUDDATLI imzolangan havola (3 soat) — saqlab qo'yib bo'lmaydi.
 */
export interface LessonRecordingDto {
  lesson_id?: string;
  title?: string | null;
  status?: RecordingStatusDto | null;
  ready?: boolean | null;
  created_at?: string | null;
  ended_at?: string | null;
  error?: string | null;
  stream_url?: string | null;
}

/**
 * `GET /api/v1/lessons/{id}/ratings/` — bitta baho.
 *
 * Baho anonim emas, shuning uchun `student` keladi. Ba'zi backend versiyalari
 * to'liq obyekt o'rniga faqat `student_name` beradi — ikkalasi ham qo'llanadi.
 */
export interface LessonRatingDto {
  id: string | number;
  lesson?: string | number;
  student?: UserDto | null;
  student_name?: string | null;
  stars: number;
  description?: string | null;
  created_at: string;
}

/** `POST /api/v1/lessons/{id}/rate/` tanasi. */
export interface LessonRateRequestDto {
  stars: number;
  description?: string;
}

/** Baholash formasi — `LessonRatingForm` yuboradigan shakl. */
export interface LessonRatingInput {
  stars: number;
  description?: string;
}

/** Dars formasi — `AddLessonDialog` yuboradigan shakl. */
export interface LessonFormInput {
  courseId?: string | null;
  topic?: string;
  title?: string;
  startsAt?: string;
  date?: string;
  time?: string;
  duration?: string | number;
  durationMinutes?: string | number;
}
