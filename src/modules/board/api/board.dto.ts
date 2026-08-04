/** Doskadagi chizma: yo polyline, yo matn bloki. */
export interface StrokeDto {
  id: string;
  type?: "text";
  /** Polyline uchun: [[x, y], ...] */
  points?: Array<[number, number]>;
  color?: string;
  width?: number;
  /** Matn bloki uchun. */
  text?: string;
  x?: number;
  y?: number;
  size?: number;
}

export interface BoardSheetDto {
  index: number | string;
  strokes?: StrokeDto[];
}

/** `GET /api/v1/board/<lesson_id>/` javobi. */
export interface BoardStateDto {
  sheets?: BoardSheetDto[];
  can_draw?: boolean;
  is_teacher?: boolean;
  /** [kenglik, balandlik] */
  size?: [number, number];
  subject?: string;
}

/** `POST /api/v1/board/<lesson_id>/solve/` javobi (SymPy). */
export interface FormulaSolutionDto {
  pretty: string;
  result: string;
  steps?: string[];
}

// ─── Domen ko'rinishi ───────────────────────────────────────────────────────
export interface BoardSheet {
  index: number;
  strokes: StrokeDto[];
}

export interface BoardState {
  sheets: BoardSheet[];
  canDraw: boolean;
  isTeacher: boolean;
  width: number;
  height: number;
  subject: string;
}

/** Yangi chizma yuborishda `id` hali yo'q. */
export type StrokeInput = Omit<StrokeDto, "id">;
