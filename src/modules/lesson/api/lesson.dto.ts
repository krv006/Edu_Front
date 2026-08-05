import type { LessonStatus } from "@/shared/types";

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
}

/** `POST/PATCH /api/v1/lessons/` tanasi. */
export interface LessonRequestDto {
  course: string | null;
  title: string;
  starts_at: string;
  duration_min: number;
}

/**
 * `GET /api/v1/lessons/<id>/recording/` javobi.
 *
 * Backend maydon nomlari hujjatda qat'iy belgilanmagan (`recording_info` deb ataladi),
 * shuning uchun mapper bir necha ehtimoliy nomni qabul qiladi va yozuv bo'lmasa 404 keladi.
 */
export interface LessonRecordingDto {
  status?: string | null;
  ready?: boolean | null;
  title?: string | null;
  recording_title?: string | null;
  /** To'liq havola yoki faqat imzolangan token — ikkalasi ham qo'llab-quvvatlanadi. */
  stream_url?: string | null;
  url?: string | null;
  token?: string | null;
  t?: string | null;
  duration?: number | null;
  duration_sec?: number | null;
  size?: number | null;
  size_bytes?: number | null;
  created_at?: string | null;
  expires_at?: string | null;
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
