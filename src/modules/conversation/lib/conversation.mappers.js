import { normalizePagination } from "@/shared/api";

const tones = ["violet", "blue", "emerald", "amber", "rose"];
export function mapConversationDto(dto) {
  const other = dto.other_user;
  return {
    id: String(dto.id), type: dto.kind === "course" ? "group" : "direct", kind: dto.kind,
    courseId: dto.course ? String(dto.course) : null, title: dto.title,
    participantId: other?.id ? String(other.id) : null,
    participant: other ? { id: String(other.id), username: other.username, name: [other.first_name, other.last_name].filter(Boolean).join(" ") || other.username, phone: other.phone ?? null } : null,
    directStatus: dto.direct_status, lastMessage: dto.last_message?.text ?? "Hozircha xabar yo‘q",
    lastSender: dto.last_message?.sender ?? null, updatedAt: dto.last_message?.created_at ?? dto.updated_at,
    unreadCount: Number(dto.unread ?? 0), status: "offline", typing: false,
    avatarTone: tones[Math.abs(String(dto.id).charCodeAt(0) || 0) % tones.length], memberCount: 0,
  };
}
export function mapConversationPage(dto, options) { const page = normalizePagination(dto, options); return { ...page, items: page.items.map(mapConversationDto) }; }
export function mapTeacherDto(dto) { return { id: String(dto.id), username: dto.username, name: [dto.first_name, dto.last_name].filter(Boolean).join(" ") || dto.username, phone: dto.phone ?? null, directStatus: dto.direct_status ?? null, roomId: dto.room_id ? String(dto.room_id) : null }; }
