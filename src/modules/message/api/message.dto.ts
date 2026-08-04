import type { UserDto } from "@/shared/types";

/** `GET /api/v1/chat/rooms/<id>/messages/` — bitta xabar. */
export interface MessageDto {
  id: string | number;
  room: string | number;
  sender?: UserDto;
  text: string;
  created_at: string;
}

// ─── WebSocket shartnomasi (docs/PROJECT.md §5) ─────────────────────────────
export interface SocketMessageEventDto {
  type: "message";
  message: MessageDto;
}

export interface SocketTypingEventDto {
  type: "typing";
  user_id: string | number;
  name: string;
}

export interface SocketErrorEventDto {
  type: "error";
  detail?: string;
}

export type SocketEventDto = SocketMessageEventDto | SocketTypingEventDto | SocketErrorEventDto;
