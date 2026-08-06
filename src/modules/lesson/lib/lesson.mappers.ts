import {
  normalizeMediaUrl,
  normalizePagination,
  type Page,
  type PaginationOptions,
} from "@/shared/api";
import type { Lesson, LessonRecording, LessonRecordingStatus } from "@/shared/types";
import type {
  LessonDto,
  LessonFormInput,
  LessonRecordingDto,
  LessonRequestDto,
} from "../api/lesson.dto";

export function mapLessonDto(dto: LessonDto): Lesson {
  return {
    id: String(dto.id),
    courseId: String(dto.course),
    courseTitle: dto.course_title,
    title: dto.title,
    topic: dto.title,
    startsAt: dto.starts_at,
    durationMinutes: Number(dto.duration_min),
    duration: Number(dto.duration_min),
    status: dto.status,
    roomName: dto.room_name,
    createdAt: dto.created_at,
    date: dto.starts_at?.slice(0, 10) ?? "",
    time: dto.starts_at?.slice(11, 16) ?? "",
  };
}

export function mapLessonPage(dto: unknown, options?: PaginationOptions): Page<Lesson> {
  const page = normalizePagination<LessonDto>(dto, options);
  return { ...page, items: page.items.map(mapLessonDto) };
}

const RECORDING_STATUSES: LessonRecordingStatus[] = ["recording", "completed", "failed"];

export function mapLessonRecordingDto(dto: LessonRecordingDto): LessonRecording {
  const status = RECORDING_STATUSES.includes(dto.status as LessonRecordingStatus)
    ? (dto.status as LessonRecordingStatus)
    : "recording";

  return {
    status,
    // `stream_url` faqat `ready` bo'lganda keladi — ikkalasini ham talab qilamiz.
    ready: Boolean(dto.ready && dto.stream_url),
    title: dto.title || "Dars yozuvi",
    // `<video src>` uchun to'liq havola kerak — apiClient bazasi qo'llanadi.
    streamUrl: normalizeMediaUrl(dto.stream_url),
    createdAt: dto.created_at ?? null,
    endedAt: dto.ended_at ?? null,
    error: dto.error ?? null,
  };
}

export function mapLessonRequest(form: LessonFormInput): LessonRequestDto {
  const startsAt =
    form.startsAt ??
    `${form.date || new Date().toISOString().slice(0, 10)}T${form.time || "00:00"}:00`;
  return {
    course: form.courseId ?? null,
    title: form.topic ?? form.title ?? "",
    starts_at: startsAt,
    duration_min: Number(form.duration ?? form.durationMinutes ?? 45),
  };
}
