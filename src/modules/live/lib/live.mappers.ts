import type { AttentionCheck, AttentionResponseDto, RoomToken, RoomTokenDto } from "../api/live.dto";

export function mapRoomTokenDto(dto: RoomTokenDto): RoomToken {
  return { token: dto.token, serverUrl: dto.url, roomName: dto.room, isTeacher: Boolean(dto.is_teacher) };
}

export function mapAttentionDto(dto: AttentionResponseDto | null | undefined): AttentionCheck | null {
  return dto?.check ? { id: String(dto.check.id), dueAt: dto.check.due_at } : null;
}
