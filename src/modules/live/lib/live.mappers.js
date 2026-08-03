export function mapRoomTokenDto(dto) { return { token: dto.token, serverUrl: dto.url, roomName: dto.room, isTeacher: Boolean(dto.is_teacher) }; }
export function mapAttentionDto(dto) { return dto?.check ? { id: String(dto.check.id), dueAt: dto.check.due_at } : null; }
