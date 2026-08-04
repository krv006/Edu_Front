import { useRef, useState, type FormEvent, type PointerEvent } from "react";
import { Calculator, Download, Eraser, FilePlus2, PenLine, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useCourseStudents } from "@/modules/course";
import { downloadBlob } from "@/shared/lib";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { boardApi } from "../api/board.api";
import type { FormulaSolutionDto } from "../api/board.dto";
import {
  useAddSheet,
  useAddStroke,
  useBoard,
  useEraseStrokes,
  useGrantDraw,
  useSolveFormula,
} from "../model/board.queries";

const STROKE_COLOR = "#5b5cf0";
const TEXT_COLOR = "#1c1e3a";
const SELECTED_COLOR = "#ef4444";

export interface BoardPanelProps {
  lessonId: string;
  courseId: string | null;
}

export function BoardPanel({ lessonId, courseId }: BoardPanelProps) {
  const board = useBoard(lessonId);
  const addStroke = useAddStroke(lessonId);
  const addSheet = useAddSheet(lessonId);
  const erase = useEraseStrokes(lessonId);
  const grant = useGrantDraw(lessonId);
  const solve = useSolveFormula(lessonId);
  const members = useCourseStudents(board.data?.isTeacher ? courseId : null, { page_size: 100 });

  const [sheet, setSheet] = useState(0);
  const [draft, setDraft] = useState<Array<[number, number]>>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [grantOpen, setGrantOpen] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [formula, setFormula] = useState("");
  const [solution, setSolution] = useState<FormulaSolutionDto | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const state = board.data;
  const active = state?.sheets.find((item) => item.index === sheet) ?? state?.sheets[0];

  /** Ekran koordinatasini doska koordinata tizimiga o'tkazadi. */
  function point(event: PointerEvent<SVGSVGElement>): [number, number] {
    const rect = svgRef.current!.getBoundingClientRect();
    return [
      Math.round(((event.clientX - rect.left) * state!.width) / rect.width),
      Math.round(((event.clientY - rect.top) * state!.height) / rect.height),
    ];
  }

  function endDraw() {
    if (draft.length > 1) {
      addStroke.mutate({ sheet, stroke: { points: draft, color: STROKE_COLOR, width: 4 } });
    }
    setDraft([]);
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
          size: 22,
          color: TEXT_COLOR,
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

  return (
    <div className="board-panel">
      <div className="board-toolbar">
        <span>
          <PenLine size={17} /> {state.canDraw ? "Chizish mumkin" : "Faqat ko‘rish"}
        </span>
        {state.sheets.map((item) => (
          <button
            className={sheet === item.index ? "is-active" : ""}
            key={item.index}
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
        {state.isTeacher ? (
          <Button size="sm" variant="secondary" onClick={() => setGrantOpen(true)}>
            <UserCheck size={15} /> Ruxsat
          </Button>
        ) : null}
        <Button size="sm" variant="secondary" onClick={() => setFormulaOpen(true)}>
          <Calculator size={15} /> Formula
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!selected || !state.canDraw}
          onClick={() => setReasonOpen(true)}
        >
          <Eraser size={15} />
        </Button>
        <Button size="sm" variant="secondary" onClick={download}>
          <Download size={15} /> PDF
        </Button>
      </div>

      <svg
        ref={svgRef}
        className="board-canvas"
        viewBox={`0 0 ${state.width} ${state.height}`}
        onPointerDown={(event) => {
          if (state.canDraw) setDraft([point(event)]);
        }}
        onPointerMove={(event) => {
          if (draft.length) setDraft((items) => [...items, point(event)]);
        }}
        onPointerUp={endDraw}
        onPointerLeave={endDraw}
      >
        {active?.strokes.map((stroke) =>
          stroke.type === "text" ? (
            <text
              key={stroke.id}
              x={stroke.x}
              y={stroke.y}
              fontSize={stroke.size}
              fill={stroke.color}
              onClick={() => setSelected(stroke.id)}
            >
              {stroke.text}
            </text>
          ) : (
            <polyline
              key={stroke.id}
              points={(stroke.points ?? []).map((item) => item.join(",")).join(" ")}
              fill="none"
              stroke={selected === stroke.id ? SELECTED_COLOR : stroke.color}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              onClick={() => setSelected(stroke.id)}
            />
          )
        )}
        {draft.length > 1 ? (
          <polyline
            points={draft.map((item) => item.join(",")).join(" ")}
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth="4"
          />
        ) : null}
      </svg>

      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        {reasonOpen && (
          <DialogContent title="Elementni o‘chirish" description="Audit uchun o‘chirish sababini kiriting.">
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
                {solution && state.canDraw ? (
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
