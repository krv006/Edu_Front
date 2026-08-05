import { useRef, useState, type PointerEvent } from "react";
import type { Point, StrokeShapeDto } from "../api/board.dto";
import { buildStroke, type DrawKind } from "../lib/board.geometry";
import type { BoardTool } from "../ui/board-toolbar";

const PLACED_TOOLS = new Set<BoardTool>(["text", "math"]);

export interface UseBoardDrawingInit {
  width: number;
  height: number;
  tool: BoardTool;
  color: string;
  strokeWidth: number;
  enabled: boolean;
  onCommit: (stroke: StrokeShapeDto) => void;
  /** Matn/formula asboblari bosilganda — dialog ochish uchun nuqta beriladi. */
  onPlacePoint: (point: Point) => void;
}

export interface BoardDraft {
  from: Point;
  to: Point;
  points: Point[];
}

/**
 * Doskadagi sudrash → stroke mantig'i.
 *
 * SVG viewBox koordinatalari ekran o'lchamidan farq qiladi, shuning uchun har bir
 * pointer hodisasi doska koordinata tizimiga o'giriladi. Chizilayotgan element
 * `draft` sifatida qaytadi — panel uni oldindan ko'rsatadi (server javobini kutmasdan).
 */
export function useBoardDrawing({
  width,
  height,
  tool,
  color,
  strokeWidth,
  enabled,
  onCommit,
  onPlacePoint,
}: UseBoardDrawingInit) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draft, setDraft] = useState<BoardDraft | null>(null);

  function toBoardPoint(event: PointerEvent<SVGSVGElement>): Point {
    const rect = svgRef.current!.getBoundingClientRect();
    return [
      Math.round(((event.clientX - rect.left) * width) / rect.width),
      Math.round(((event.clientY - rect.top) * height) / rect.height),
    ];
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    if (!enabled || tool === "select") return;
    const point = toBoardPoint(event);

    // Matn va formula sudrab emas, bitta bosish bilan joylashtiriladi.
    if (PLACED_TOOLS.has(tool)) {
      onPlacePoint(point);
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDraft({ from: point, to: point, points: [point] });
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!draft) return;
    const point = toBoardPoint(event);
    setDraft((current) =>
      current ? { ...current, to: point, points: [...current.points, point] } : current
    );
  }

  function handlePointerUp() {
    if (!draft) return;
    const stroke = buildStroke({
      kind: tool as DrawKind,
      from: draft.from,
      to: draft.to,
      points: draft.points,
      color,
      width: strokeWidth,
    });
    if (stroke) onCommit(stroke);
    setDraft(null);
  }

  return { svgRef, draft, handlePointerDown, handlePointerMove, handlePointerUp };
}
