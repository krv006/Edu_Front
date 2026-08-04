/** `POST /api/v1/live/token/` javobi. */
export interface RoomTokenDto {
  token: string;
  url: string;
  room: string;
  is_teacher: boolean;
}

/** `GET /api/v1/live/attention/` javobi — tekshiruv bo'lmasa `check` null. */
export interface AttentionResponseDto {
  check: { id: string | number; due_at: string } | null;
}

export interface AttentionAnswerDto {
  answered_at: string;
}

/** Fokus jurnali hodisasi: oynadan chiqish / qaytish. */
export type FocusKind = "exit" | "return";

// ─── Domen ko'rinishlari ────────────────────────────────────────────────────
export interface RoomToken {
  token: string;
  serverUrl: string;
  roomName: string;
  isTeacher: boolean;
}

export interface AttentionCheck {
  id: string;
  dueAt: string;
}
