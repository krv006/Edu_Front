import {
  Circle,
  Eraser,
  Highlighter,
  Minus,
  MoveRight,
  PenLine,
  Sigma,
  Square,
  Type,
} from "lucide-react";
import type { ComponentType } from "react";
import { BOARD_COLORS, BOARD_WIDTHS } from "../constants/board.constants";
import type { DrawKind } from "../lib/board.geometry";

/**
 * Sudrab chiziladigan asboblar + bosib joylashtiriladigan `text`/`math`
 * + biror elementni bosib o'chiradigan `erase` rejimi.
 *
 * Avval o'chirish alohida "Tanlash" rejimi + pastdagi disabled lastik
 * tugmasi orqali ikki bosqichda ishlardi ("tanlash" nima ekani
 * tushunarsiz edi — o'qituvchilar to'g'ridan-to'g'ri lastikni bosib,
 * hech narsa sodir bo'lmasligidan chalkashardi). Endi lastik — oddiy
 * asbob: bosilgach, istalgan elementga bosish uni darhol o'chirishga
 * yuboradi.
 */
export type BoardTool = DrawKind | "text" | "math" | "erase";

interface ToolDefinition {
  id: BoardTool;
  label: string;
  icon: ComponentType<{ size?: number }>;
}

const TOOLS: ToolDefinition[] = [
  { id: "erase", label: "Lastik", icon: Eraser },
  { id: "pen", label: "Qalam", icon: PenLine },
  { id: "marker", label: "Marker", icon: Highlighter },
  { id: "line", label: "Chiziq", icon: Minus },
  { id: "arrow", label: "Strelka", icon: MoveRight },
  { id: "rect", label: "To‘rtburchak", icon: Square },
  { id: "ellipse", label: "Ellips", icon: Circle },
  { id: "text", label: "Matn", icon: Type },
];

/** Formula bloki faqat `math_enabled` kurslarda — boshqasida server 400 beradi. */
const MATH_TOOL: ToolDefinition = { id: "math", label: "Formula", icon: Sigma };

export interface BoardToolbarProps {
  tool: BoardTool;
  color: string;
  width: number;
  canDraw: boolean;
  /** `GET /board/<id>/` javobidagi `math_enabled` — formula vositasini ko'rsatadi. */
  mathEnabled: boolean;
  onToolChange: (tool: BoardTool) => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
}

export function BoardToolbar({
  tool,
  color,
  width,
  canDraw,
  mathEnabled,
  onToolChange,
  onColorChange,
  onWidthChange,
}: BoardToolbarProps) {
  const tools = mathEnabled ? [...TOOLS, MATH_TOOL] : TOOLS;

  return (
    <div className="board-tools" role="toolbar" aria-label="Doska asboblari">
      <div className="board-tool-group">
        {tools.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`${tool === id ? "is-active" : ""} ${id === "erase" ? "is-erase-tool" : ""}`}
            disabled={!canDraw}
            title={label}
            aria-label={label}
            aria-pressed={tool === id}
            onClick={() => onToolChange(id)}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      <div className="board-tool-group board-colors">
        {BOARD_COLORS.map((value) => (
          <button
            key={value}
            type="button"
            className={color === value ? "is-active" : ""}
            style={{ background: value }}
            disabled={!canDraw}
            title={`Rang ${value}`}
            aria-label={`Rang ${value}`}
            aria-pressed={color === value}
            onClick={() => onColorChange(value)}
          />
        ))}
      </div>

      <div className="board-tool-group board-widths">
        {BOARD_WIDTHS.map((value) => (
          <button
            key={value}
            type="button"
            className={width === value ? "is-active" : ""}
            disabled={!canDraw}
            title={`Qalinlik ${value}`}
            aria-label={`Qalinlik ${value}`}
            aria-pressed={width === value}
            onClick={() => onWidthChange(value)}
          >
            <span style={{ height: Math.min(value, 10) }} />
          </button>
        ))}
      </div>
    </div>
  );
}
