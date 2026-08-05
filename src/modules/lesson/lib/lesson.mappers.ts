import {
  normalizeMediaUrl,
  normalizePagination,
  type Page,
  type PaginationOptions,
} from "@/shared/api";
import type { Lesson, LessonRecording, LessonRecordingStatus } from "@/shared/types";
import { lessonEndpoints } from "../api/lesson.endpoints";
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

function resolveRecordingStatus(dto: LessonRecordingDto): LessonRecordingStatus {
  const raw = dto.status?.toLowerCase();
  if (raw === "failed" || raw === "error") return "failed";
  if (raw === "ready" || raw === "done" || raw === "complete") return "ready";
  if (raw === "processing" || raw === "recording" || raw === "active") return "processing";
  // Holat nomi kelmasa — havola bor-yo'qligiga qarab hukm qilamiz.
  return dto.ready || dto.stream_url || dto.url || dto.token || dto.t ? "ready" : "processing";
}

export function mapLessonRecordingDto(dto: LessonRecordingDto, lessonId: string): LessonRecording {
  const token = dto.token ?? dto.t ?? null;
  const streamUrl =
    dto.stream_url ??
    dto.url ??
    // Server faqat imzolangan token bergan bo'lsa, havolani o'zimiz yig'amiz.
    (token ? `${lessonEndpoints.recording(lessonId)}stream/?t=${encodeURIComponent(token)}` : null);

  return {
    status: resolveRecordingStatus(dto),
    title: dto.title ?? dto.recording_title ?? "Dars yozuvi",
    // `<video src>` uchun to'liq havola kerak — apiClient bazasi qo'llanadi.
    streamUrl: normalizeMediaUrl(streamUrl),
    durationSeconds: Number(dto.duration ?? dto.duration_sec ?? 0),
    sizeBytes: Number(dto.size ?? dto.size_bytes ?? 0),
    createdAt: dto.created_at ?? null,
    expiresAt: dto.expires_at ?? null,
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
