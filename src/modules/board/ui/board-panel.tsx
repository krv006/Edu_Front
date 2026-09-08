import { useState, type FormEvent } from "react";
import { Calculator, Check, Eye, FilePlus2, Pencil, UserCheck, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCourseStudents } from "@/modules/course";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
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
  /** O'quvchining LiveKit identity'si — `board_granted` signalini o'ziga tegishli deb aniqlash uchun. */
  currentUserId?: string | null;
}

export function BoardPanel({ lessonId, courseId, currentUserId }: BoardPanelProps) {
  const { t } = useTranslation("board");
  const realtime = useBoardRealtime(lessonId, true, currentUserId);
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

  // Matn/formula editori aynan foydalanuvchi bosgan doska koordinatasida ochiladi.
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
    if (!realtime.sendStroke(sheet, stroke)) addStroke.mutate({ sheet, stroke });
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

  /**
   * Lastik asbobi bosilgan holda elementga bosilganda darhol shu yerga
   * keladi — avval alohida "Tanlash" rejimi kerak edi, bu tushunarsiz
   * bo'lib, "lastik ishlamayapti" degan shikoyatlarga sabab bo'lgan edi.
   */
  function handleStrokeClick(id: string) {
    if (tool !== "erase" || !canDraw) return;
    setSelected(id);
    setReason("");
    setReasonOpen(true);
  }

  /** Oyna yopilganda tanlov ham tozalanadi — aks holda keyingi ochilishda eskisi qolib ketardi. */
  function closeReasonDialog() {
    setReasonOpen(false);
    setSelected(null);
    setReason("");
  }

  async function removeSelected(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !reason.trim()) return;
    try {
      await erase.mutateAsync({ sheet, strokeIds: [selected], reason: reason.trim() });
      closeReasonDialog();
      toast.success(t("eraseDialog.deleted"));
    } catch {
      // Xato bo'lsa oyna ochiq qoladi (qayta urinish uchun) — xabar
      // `useEraseStrokes`ning `onError`i orqali allaqachon ko'rsatiladi.
    }
  }

  async function solveFormula(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSolution(await solve.mutateAsync(formula));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("formulaDialog.solveError"));
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

  if (board.isLoading) return <div className="board-loading">{t("status.loading")}</div>;
  if (board.isError || !state)
    return (
      <div className="board-error">
        <p>{board.error?.message}</p>
        <Button onClick={() => board.refetch()}>{t("status.retry")}</Button>
      </div>
    );

  // Chizilayotgan element server javobini kutmasdan darhol ko'rinadi.
  const preview =
    draft && tool !== "erase" && tool !== "text" && tool !== "math"
      ? buildStroke({ kind: tool, ...draft, color, width: strokeWidth })
      : null;

  return (
    <div className="board-panel">
      <div className="board-toolbar">
        <div className="board-status">
          <span
            className={`board-permission ${canDraw ? "is-can-draw" : ""}`}
            title={canDraw ? t("status.canDrawTitle") : t("status.viewOnlyTitle")}
          >
            {canDraw ? <Pencil size={13} /> : <Eye size={13} />}
            {canDraw ? t("status.canDraw") : t("status.viewOnly")}
          </span>
          <span
            className="board-live"
            title={realtime.connected ? t("status.liveConnectedTitle") : t("status.liveDisconnectedTitle")}
          >
            <i className={`board-live-dot ${realtime.connected ? "is-live" : ""}`} aria-hidden="true" />
            {realtime.connected ? t("status.live") : t("status.slowMode")}
          </span>
        </div>

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
              <FilePlus2 size={15} /> {t("sheet.addSheet")}
            </Button>
          ) : null}
        </div>

        <div className="board-toolbar-actions">
          {state.isTeacher ? (
            <Button size="sm" variant="secondary" onClick={() => setGrantOpen(true)}>
              <UserCheck size={15} /> {t("permission.grantButton")}
            </Button>
          ) : null}
          {/* Formula yechuvchi faqat matematika kurslarida ishlaydi (docs/README). */}
          {state.mathEnabled ? (
            <Button size="sm" variant="secondary" onClick={() => setFormulaOpen(true)}>
              <Calculator size={15} /> {t("solver.button")}
            </Button>
          ) : null}
        </div>
      </div>

      <BoardToolbar
        tool={tool}
        color={color}
        width={strokeWidth}
        canDraw={canDraw}
        mathEnabled={state.mathEnabled}
        onToolChange={setTool}
        onColorChange={setColor}
        onWidthChange={setStrokeWidth}
      />

      <div className="board-canvas-wrap">
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
              onSelect={handleStrokeClick}
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

        {placement ? (
          <form
            className={`board-inline-editor ${placement.point[0] > state.width * 0.72 ? "is-right" : ""}`}
            style={{
              left: `${(placement.point[0] / state.width) * 100}%`,
              top: `${(placement.point[1] / state.height) * 100}%`,
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onSubmit={placeBlock}
          >
            <span>{placement.tool === "math" ? t("inline.formula") : t("inline.text")}</span>
            {placement.tool === "math" ? (
              <MathFieldInput value={draftText} onChange={setDraftText} />
            ) : (
              <input
                autoFocus
                value={draftText}
                placeholder={t("inline.placeholder")}
                aria-label={t("inline.textAria")}
                onChange={(event) => setDraftText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setPlacement(null);
                }}
              />
            )}
            <div className="board-inline-actions">
              <button type="button" onClick={() => setPlacement(null)} aria-label={t("inline.cancelAria")}>
                <X size={15} />
              </button>
              <button
                type="submit"
                className="is-primary"
                disabled={!draftText.trim() || addStroke.isPending}
                aria-label={t("inline.addAria")}
              >
                <Check size={15} />
              </button>
            </div>
          </form>
        ) : null}
      </div>

      <Dialog
        open={reasonOpen}
        onOpenChange={(open) => (open ? setReasonOpen(true) : closeReasonDialog())}
      >
        {reasonOpen && (
          <DialogContent
            title={t("eraseDialog.title")}
            description={t("eraseDialog.description")}
          >
            <form className="dialog-form" onSubmit={removeSelected}>
              <label className="field-group">
                <span>{t("eraseDialog.reasonLabel")}</span>
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
                <Button type="button" variant="secondary" onClick={closeReasonDialog}>
                  {t("eraseDialog.cancel")}
                </Button>
                <Button type="submit" loading={erase.isPending}>
                  {t("eraseDialog.confirm")}
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        {grantOpen && (
          <DialogContent
            title={t("grantDialog.title")}
            description={t("grantDialog.description")}
          >
            <div className="board-student-list">
              {(members.data?.items ?? []).map(({ student }) => (
                <button
                  key={student.id}
                  disabled={grant.isPending}
                  onClick={() =>
                    grant.mutate(student.id, {
                      onSuccess: () => toast.success(t("grantDialog.granted", { name: student.name })),
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
              {!members.isLoading && !members.data?.items?.length ? <p>{t("grantDialog.noStudents")}</p> : null}
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={formulaOpen} onOpenChange={setFormulaOpen}>
        {formulaOpen && (
          <DialogContent title={t("formulaDialog.title")} description={t("formulaDialog.description")}>
            <form className="dialog-form" onSubmit={solveFormula}>
              <label className="field-group">
                <span>{t("formulaDialog.formulaLabel")}</span>
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
                  {t("formulaDialog.solve")}
                </Button>
                {solution && canDraw ? (
                  <Button type="button" loading={addStroke.isPending} onClick={placeSolution}>
                    {t("formulaDialog.place")}
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
