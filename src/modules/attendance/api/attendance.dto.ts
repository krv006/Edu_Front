import type { UserDto } from "@/shared/types";

/** `GET /api/v1/attendance/` — bitta davomat yozuvi. */
export interface AttendanceDto {
  id: string | number;
  lesson: string | number;
  lesson_title: string;
  student: UserDto;
  joined_at: string | null;
  left_at: string | null;
  minutes: number;
  attention_total: number;
  attention_answered: number;
  focus_exits: number;
}
