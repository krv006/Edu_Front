export type StrokeKind = "pen" | "marker" | "line" | "rect" | "ellipse" | "text" | "math";

export type Point = [number, number];

interface StrokeBase {
  color?: string;
  width?: number;
}

export interface FreehandStrokeDto extends StrokeBase {
  type?: undefined;
  points: Point[];
  opacity?: number;
}

export interface LineStrokeDto extends StrokeBase {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  arrow?: boolean;
}

export interface RectStrokeDto extends StrokeBase {
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface EllipseStrokeDto extends StrokeBase {
  type: "ellipse";
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextStrokeDto extends StrokeBase {
  type: "text";
  text: string;
  x: number;
  y: number;
  size?: number;
}

export interface MathStrokeDto extends StrokeBase {
  type: "math";
  latex: string;
  x: number;
  y: number;
  size?: number;
}

export type StrokeShapeDto =
  | FreehandStrokeDto
  | LineStrokeDto
  | RectStrokeDto
  | EllipseStrokeDto
  | TextStrokeDto
  | MathStrokeDto;

export type StrokeDto = StrokeShapeDto & { id: string };

export type StrokeInput = StrokeShapeDto;

export interface BoardSheetDto {
  index: number | string;
  strokes?: StrokeDto[];
}

export interface BoardStateDto {
  sheets?: BoardSheetDto[];
  can_draw?: boolean;
  is_teacher?: boolean;
  size?: [number, number];
  subject?: string;
  math_enabled?: boolean;
  away_students?: Array<{ student_id: string | number; name: string }>;
  pending_mic_requests?: Array<{ student_id: string | number; name: string }>;
  pending_camera_requests?: Array<{ student_id: string | number; name: string }>;
}

export interface FormulaSolutionDto {
  pretty: string;
  result: string;
  steps?: string[];
}

export interface BoardSheet {
  index: number;
  strokes: StrokeDto[];
}

export interface AwayStudent {
  id: string;
  name: string;
}

export interface PendingMicRequest {
  id: string;
  name: string;
}

export interface PendingCameraRequest {
  id: string;
  name: string;
}

export interface BoardState {
  sheets: BoardSheet[];
  canDraw: boolean;
  isTeacher: boolean;
  width: number;
  height: number;
  subject: string;
  mathEnabled: boolean;
  awayStudents: AwayStudent[];
  pendingMicRequests: PendingMicRequest[];
  pendingCameraRequests: PendingCameraRequest[];
}
