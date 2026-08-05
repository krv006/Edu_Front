import {
  Circle,
  Eraser,
  Highlighter,
  Minus,
  MoveRight,
  MousePointer2,
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
 * + o'chirish uchun element belgilaydigan `select` rejimi.
 */
export type BoardTool = DrawKind | "text" | "math" | "select";

interface ToolDefinition {
  id: BoardTool;
  label: string;
  icon: ComponentType<{ size?: number }>;
}

const TOOLS: ToolDefinition[] = [
  { id: "select", label: "Tanlash", icon: MousePointer2 },
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
  /** Tanlangan element bor — o'chirish tugmasi faollashadi. */
  hasSelection: boolean;
  onToolChange: (tool: BoardTool) => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onErase: () => void;
}

export function BoardToolbar({
  tool,
  color,
  width,
  canDraw,
  mathEnabled,
  hasSelection,
  onToolChange,
  onColorChange,
  onWidthChange,
  onErase,
}: BoardToolbarProps) {
  const tools = mathEnabled ? [...TOOLS, MATH_TOOL] : TOOLS;

  return (
    <div className="board-tools" role="toolbar" aria-label="Doska asboblari">
      <div className="board-tool-group">
        {tools.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={tool === id ? "is-active" : ""}
            disabled={!canDraw && id !== "select"}
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

      <button
        type="button"
        className="board-erase"
        disabled={!hasSelection || !canDraw}
        title="Tanlangan elementni o‘chirish"
        aria-label="Tanlangan elementni o‘chirish"
        onClick={onErase}
      >
        <Eraser size={16} />
      </button>
    </div>
  );
}
