import { normalizePagination } from "@/shared/api";

function time(value) { return value ? new Intl.DateTimeFormat("uz-UZ", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—"; }
export function mapAttendanceDto(dto) {
  const studentName = [dto.student?.first_name, dto.student?.last_name].filter(Boolean).join(" ") || dto.student?.username || "O‘quvchi";
  return {
    id: String(dto.id), lessonId: String(dto.lesson), lesson: dto.lesson_title,
    studentId: String(dto.student?.id), student: dto.student, child: studentName,
    joinedAt: dto.joined_at, leftAt: dto.left_at, entered: time(dto.joined_at), exited: time(dto.left_at),
    minutes: Number(dto.minutes ?? 0), duration: `${Number(dto.minutes ?? 0)} daqiqa`,
    attentionTotal: Number(dto.attention_total ?? 0), attentionAnswered: Number(dto.attention_answered ?? 0),
    focusExits: Number(dto.focus_exits ?? 0), status: dto.left_at ? "completed" : "active",
  };
}
export function mapAttendancePage(dto, options) { const page = normalizePagination(dto, options); return { ...page, items: page.items.map(mapAttendanceDto) }; }
