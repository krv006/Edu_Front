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
