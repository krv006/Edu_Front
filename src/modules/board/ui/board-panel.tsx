import { useState, type FormEvent } from "react";
import { Calculator, Download, FilePlus2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useCourseStudents } from "@/modules/course";
import { downloadBlob } from "@/shared/lib";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { boardApi } from "../api/board.api";
import type { FormulaSolutionDto, Point, StrokeShapeDto } from "../api/board.dto";
import { BOARD_COLORS, BOARD_TEXT_SIZE, BOARD_WIDTHS } from "../constants/board.constants";
import { buildStroke } from "../lib/board.geometry";
import {
  useAddSheet,
  useAddStroke,
  useBoard,
  useEraseStrokes,
  useGrantDraw,
  useSolveFormula,
} from "../model/board.queries";
import { useBoardDrawing } from "../model/use-board-drawing";
import { useBoardRealtime } from "../model/use-board-realtime";
import { BoardStroke } from "./board-stroke";
import { BoardToolbar, type BoardTool } from "./board-toolbar";
import { MathFieldInput } from "./math-field-input";

export interface BoardPanelProps {
  lessonId: string;
  courseId: string | null;
}

export function BoardPanel({ lessonId, courseId }: BoardPanelProps) {
  const realtime = useBoardRealtime(lessonId);
  const board = useBoard(lessonId, { live: realtime.connected });
  const addStroke = useAddStroke(lessonId);
  const addSheet = useAddSheet(lessonId);
  const erase = useEraseStrokes(lessonId);
  const grant = useGrantDraw(lessonId);
  const solve = useSolveFormula(lessonId);
  const members = useCourseStudents(board.data?.isTeacher ? courseId : null, { page_size: 100 });

  const [sheet, setSheet] = useState(0);
  const [tool, setTool] = useState<BoardTool>("pen");
  const [color, setColor] = useState<string>(BOARD_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState<number>(BOARD_WIDTHS[1]);
  const [selected, setSelected] = useState<string | null>(null);

  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [grantOpen, setGrantOpen] = useState(false);

  // Matn/formula joylashtiriladigan nuqta — dialog shu koordinataga qo'yadi.
  const [placement, setPlacement] = useState<{ tool: "text" | "math"; point: Point } | null>(null);
  const [draftText, setDraftText] = useState("");

  const [formulaOpen, setFormulaOpen] = useState(false);
  const [formula, setFormula] = useState("");
  const [solution, setSolution] = useState<FormulaSolutionDto | null>(null);

  const state = board.data;
  const active = state?.sheets.find((item) => item.index === sheet) ?? state?.sheets[0];
  const canDraw = Boolean(state?.canDraw);

  /**
   * Chizmani real-time kanal orqali yuboramiz — server uni darhol hammaga tarqatadi.
   * Kanal yopiq bo'lsa REST `POST .../stroke/` ishlatiladi (docs: ikkalasi teng kuchli).
   */
  function commitStroke(stroke: StrokeShapeDto) {
    if (!realtime.socket?.sendStroke(sheet, stroke)) addStroke.mutate({ sheet, stroke });
  }

  const { svgRef, draft, handlePointerDown, handlePointerMove, handlePointerUp } = useBoardDrawing({
    width: state?.width ?? 1600,
    height: state?.height ?? 900,
    tool,
    color,
    strokeWidth,
    enabled: canDraw,
    onCommit: commitStroke,
    onPlacePoint: (point) => {
      if (tool !== "text" && tool !== "math") return;
      setDraftText("");
      setPlacement({ tool, point });
    },
  });

  function placeBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!placement || !draftText.trim()) return;
    const [x, y] = placement.point;
    const stroke: StrokeShapeDto =
      placement.tool === "math"
        ? { type: "math", latex: draftText.trim(), x, y, size: BOARD_TEXT_SIZE, color }
        : { type: "text", text: draftText, x, y, size: BOARD_TEXT_SIZE, color };

    // Bu yerda ataylab REST: server formulani rad etsa (`math_enabled` yo'q kursda)
    // 400 va tushunarli matn qaytaradi. WS orqali yuborilsa xato dialog yopilgach kelardi.
    addStroke.mutate(
      { sheet, stroke },
      {
        onSuccess: () => {
          setPlacement(null);
          setDraftText("");
        },
        onError: (error) => toast.error(error.message),
      }
    );
  }

  async function removeSelected(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !reason.trim()) return;
    await erase.mutateAsync({ sheet, strokeIds: [selected], reason: reason.trim() });
    setSelected(null);
    setReason("");
    setReasonOpen(false);
    toast.success("Element o‘chirildi");
  }

  async function download() {
    downloadBlob(await boardApi.downloadPdf(lessonId), "doska.pdf");
  }

  async function solveFormula(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSolution(await solve.mutateAsync(formula));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Formulani yechib bo‘lmadi");
    }
  }

  /** SymPy yechimini doskaga matn bloki sifatida qo'yadi. */
  function placeSolution() {
    if (!solution) return;
    const steps = solution.steps?.length ? `\n${solution.steps.join("\n")}` : "";
    addStroke.mutate(
      {
        sheet,
        stroke: {
          type: "text",
          text: `${solution.pretty}\n${solution.result}${steps}`,
          x: 60,
          y: 80,
          size: BOARD_TEXT_SIZE,
          color,
        },
      },
      {
        onSuccess: () => {
          setFormulaOpen(false);
          setFormula("");
          setSolution(null);
        },
      }
    );
  }

  if (board.isLoading) return <div className="board-loading">Doska yuklanmoqda…</div>;
  if (board.isError || !state)
    return (
      <div className="board-error">
        <p>{board.error?.message}</p>
        <Button onClick={() => board.refetch()}>Qayta urinish</Button>
      </div>
    );

  // Chizilayotgan element server javobini kutmasdan darhol ko'rinadi.
  const preview =
    draft && tool !== "select" && tool !== "text" && tool !== "math"
      ? buildStroke({ kind: tool, ...draft, color, width: strokeWidth })
      : null;

  return (
    <div className="board-panel">
      <div className="board-toolbar">
        <span className="board-mode">
          <i className={`board-live-dot ${realtime.connected ? "is-live" : ""}`} aria-hidden="true" />
          {canDraw ? "Chizish mumkin" : "Faqat ko‘rish"}
          {realtime.connected ? "" : " · sinxronlash sekin rejimda"}
        </span>

        <div className="board-sheets">
          {state.sheets.map((item) => (
            <button
              key={item.index}
              type="button"
              className={sheet === item.index ? "is-active" : ""}
              onClick={() => setSheet(item.index)}
            >
              #{item.index + 1}
            </button>
          ))}
          {state.isTeacher ? (
            <Button size="sm" variant="secondary" onClick={() => addSheet.mutate()}>
              <FilePlus2 size={15} /> Sahifa
            </Button>
          ) : null}
        </div>

        <div className="board-toolbar-actions">
          {state.isTeacher ? (
            <Button size="sm" variant="secondary" onClick={() => setGrantOpen(true)}>
              <UserCheck size={15} /> Ruxsat
            </Button>
          ) : null}
          {/* Formula yechuvchi faqat matematika kurslarida ishlaydi (docs/README). */}
          {state.mathEnabled ? (
            <Button size="sm" variant="secondary" onClick={() => setFormulaOpen(true)}>
              <Calculator size={15} /> Yechuvchi
            </Button>
          ) : null}
          <Button size="sm" variant="secondary" onClick={download}>
            <Download size={15} /> PDF
          </Button>
        </div>
      </div>

      <BoardToolbar
        tool={tool}
        color={color}
        width={strokeWidth}
        canDraw={canDraw}
        mathEnabled={state.mathEnabled}
        hasSelection={Boolean(selected)}
        onToolChange={setTool}
        onColorChange={setColor}
        onWidthChange={setStrokeWidth}
        onErase={() => setReasonOpen(true)}
      />

      <svg
        ref={svgRef}
        className={`board-canvas board-canvas--${tool}`}
        viewBox={`0 0 ${state.width} ${state.height}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {active?.strokes.map((stroke) => (
          <BoardStroke
            key={stroke.id}
            stroke={stroke}
            selected={selected === stroke.id}
            onSelect={setSelected}
          />
        ))}
        {preview ? (
          <BoardStroke
            stroke={{ ...preview, id: "draft" }}
            selected={false}
            onSelect={() => undefined}
          />
        ) : null}
      </svg>

      <Dialog open={Boolean(placement)} onOpenChange={(open) => !open && setPlacement(null)}>
        {placement ? (
          <DialogContent
            title={placement.tool === "math" ? "Formula qo‘shish" : "Matn qo‘shish"}
            description={
              placement.tool === "math"
                ? "MathLive tahrirlagichida formulani yozing."
                : "Doskaga qo‘yiladigan matnni kiriting."
            }
          >
            <form className="dialog-form" onSubmit={placeBlock}>
              <label className="field-group">
                <span>{placement.tool === "math" ? "Formula" : "Matn"}</span>
                {placement.tool === "math" ? (
                  <MathFieldInput value={draftText} onChange={setDraftText} />
                ) : (
                  <div className="input-shell">
                    <textarea
                      autoFocus
                      rows={3}
                      value={draftText}
                      onChange={(event) => setDraftText(event.target.value)}
                      required
                    />
                  </div>
                )}
              </label>
              <div className="dialog-actions">
                <Button type="button" variant="secondary" onClick={() => setPlacement(null)}>
                  Bekor
                </Button>
                <Button type="submit" loading={addStroke.isPending} disabled={!draftText.trim()}>
                  Qo‘yish
                </Button>
              </div>
            </form>
          </DialogContent>
        ) : null}
      </Dialog>

      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        {reasonOpen && (
          <DialogContent
            title="Elementni o‘chirish"
            description="Audit uchun o‘chirish sababini kiriting."
          >
            <form className="dialog-form" onSubmit={removeSelected}>
              <label className="field-group">
                <span>Sabab</span>
                <div className="input-shell">
                  <input
                    autoFocus
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    required
                  />
                </div>
              </label>
              <div className="dialog-actions">
                <Button type="button" variant="secondary" onClick={() => setReasonOpen(false)}>
                  Bekor
                </Button>
                <Button type="submit" loading={erase.isPending}>
                  O‘chirish
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        {grantOpen && (
          <DialogContent
            title="Doskada chizish ruxsati"
            description="Ruxsat beriladigan o‘quvchini tanlang."
          >
            <div className="board-student-list">
              {(members.data?.items ?? []).map(({ student }) => (
                <button
                  key={student.id}
                  disabled={grant.isPending}
                  onClick={() =>
                    grant.mutate(student.id, {
                      onSuccess: () => toast.success(`${student.name} doskada chiza oladi`),
                    })
                  }
                >
                  <span>
                    <strong>{student.name}</strong>
                    <small>@{student.username}</small>
                  </span>
                  <UserCheck size={17} />
                </button>
              ))}
              {!members.isLoading && !members.data?.items?.length ? <p>O‘quvchi topilmadi.</p> : null}
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={formulaOpen} onOpenChange={setFormulaOpen}>
        {formulaOpen && (
          <DialogContent title="Formula yordamchisi" description="Masalan: 2x^2 - 5x + 3 = 0">
            <form className="dialog-form" onSubmit={solveFormula}>
              <label className="field-group">
                <span>Formula</span>
                <div className="input-shell">
                  <input
                    autoFocus
                    value={formula}
                    onChange={(event) => setFormula(event.target.value)}
                    required
                  />
                </div>
              </label>
              {solution ? (
                <div className="formula-solution">
                  <pre>{solution.pretty}</pre>
                  <strong>{solution.result}</strong>
                  {solution.steps?.map((step) => <p key={step}>{step}</p>)}
                </div>
              ) : null}
              <div className="dialog-actions">
                <Button type="submit" variant="secondary" loading={solve.isPending}>
                  Yechish
                </Button>
                {solution && canDraw ? (
                  <Button type="button" loading={addStroke.isPending} onClick={placeSolution}>
                    Doskaga qo‘yish
                  </Button>
                ) : null}
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
