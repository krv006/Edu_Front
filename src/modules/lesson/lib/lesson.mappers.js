import { normalizePagination } from "@/shared/api";

export function mapLessonDto(dto) {
  return {
    id: String(dto.id), courseId: String(dto.course), courseTitle: dto.course_title,
    title: dto.title, topic: dto.title, startsAt: dto.starts_at,
    durationMinutes: Number(dto.duration_min), duration: Number(dto.duration_min),
    status: dto.status, roomName: dto.room_name, createdAt: dto.created_at,
    date: dto.starts_at?.slice(0, 10) ?? "", time: dto.starts_at?.slice(11, 16) ?? "",
  };
}
export function mapLessonPage(dto, options) { const page = normalizePagination(dto, options); return { ...page, items: page.items.map(mapLessonDto) }; }
export function mapLessonRequest(form) {
  const startsAt = form.startsAt ?? `${form.date || new Date().toISOString().slice(0, 10)}T${form.time || "00:00"}:00`;
  return { course: form.courseId, title: form.topic ?? form.title, starts_at: startsAt, duration_min: Number(form.duration ?? form.durationMinutes ?? 45) };
}
