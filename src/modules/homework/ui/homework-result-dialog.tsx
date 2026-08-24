import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  Lightbulb,
  ListChecks,
  PencilLine,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import {
  useDownloadSubmissionFile,
  useRecheckSubmission,
  useReviewSubmission,
  useSubmission,
} from "../model/homework.queries";
import type { AiQuestion, Submission } from "@/shared/types";
import type { ComponentType, ReactNode } from "react";

export interface HomeworkResultDialogProps {
  submissionId?: string | null;
  initial?: Submission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canRecheck?: boolean;
  canDownloadFile?: boolean;
  /** O‘qituvchi AI bahosini tuzata oladimi. */
  canReview?: boolean;
  title?: string;
}

/** Backend matnlarni string yoki obyekt sifatida qaytarishi mumkin — ikkalasini ham xavfsiz ko‘rsatamiz. */
function asText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value : JSON.stringify(value);
}

function ChipList({ icon: Icon, title, items, tone }: { icon: ComponentType<{ size?: number }>; title: string; items?: unknown[]; tone: string }): ReactNode {
  const values = (items ?? []).map(asText).filter(Boolean);
  if (!values.length) return null;
  return (
    <section className={`hw-summary-card hw-summary-card--${tone}`}>
      <h4>
        <Icon size={16} /> {title}
      </h4>
      <ul>
        {values.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function QuestionCard({
  question,
  index,
  scoreDraft,
  onScoreChange,
}: {
  question: AiQuestion;
  index: number;
  /** `undefined` — tahrirlash rejimi yoqilmagan. */
  scoreDraft?: string;
  onScoreChange?: (value: string) => void;
}) {
  const editing = scoreDraft !== undefined;
  const number = question.questionNumber ?? index + 1;
  const mistakes = (question.mistakes ?? []).map(asText).filter(Boolean);
  const suggestions = (question.suggestions ?? []).map(asText).filter(Boolean);
  const categories = (question.errorCategories ?? []).map(asText).filter(Boolean);
  const correct = asText(question.correctAnswer) || asText(question.expectedSolution);

  return (
    <details className="hw-question" open={editing || index === 0}>
      <summary>
        <span className="hw-question-number">{number}</span>
        <span className="hw-question-title">
          {asText(question.question) || `${number}-savol`}
        </span>
        <span className="hw-question-meta">
          {question.difficulty ? <em>{asText(question.difficulty)}</em> : null}
          {question.score !== null && question.score !== undefined ? (
            <strong>{question.score} ball</strong>
          ) : null}
        </span>
      </summary>
      <div className="hw-question-body">
        {/* Ball aynan shu yerda: `summary` ichidagi input bosilganda savol
            yopilib-ochilib ketardi. */}
        {editing ? (
          <label className="hw-score-field">
            <span>Ball</span>
            <input
              inputMode="numeric"
              value={scoreDraft}
              onChange={(event) => onScoreChange?.(event.target.value.replace(/[^\d]/g, ""))}
            />
          </label>
        ) : null}
        {question.studentAnswer ? (
          <p>
            <span className="hw-label">O‘quvchi javobi</span>
            {asText(question.studentAnswer)}
          </p>
        ) : null}
        {correct ? (
          <p>
            <span className="hw-label">To‘g‘ri yechim</span>
            {correct}
          </p>
        ) : null}
        {question.analysis ? (
          <p>
            <span className="hw-label">Tahlil</span>
            {asText(question.analysis)}
          </p>
        ) : null}
        {mistakes.length ? (
          <div className="hw-question-list hw-question-list--error">
            <span className="hw-label">
              <TriangleAlert size={13} /> Xatolar
            </span>
            <ul>
              {mistakes.map((item, i) => (
                <li key={`m-${i}`}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {suggestions.length ? (
          <div className="hw-question-list">
            <span className="hw-label">
              <Lightbulb size={13} /> Tavsiyalar
            </span>
            <ul>
              {suggestions.map((item, i) => (
                <li key={`s-${i}`}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {categories.length ? (
          <div className="hw-tag-row">
            {categories.map((item, i) => (
              <span key={`c-${i}`}>{item}</span>
            ))}
          </div>
        ) : null}
      </div>
    </details>
  );
}

export function HomeworkResultDialog({
  submissionId,
  initial = null,
  open,
  onOpenChange,
  canRecheck = false,
  canDownloadFile = false,
  canReview = false,
  title = "AI tekshiruv natijasi",
}: HomeworkResultDialogProps) {
  const query = useSubmission(open ? submissionId : null, {
    poll: initial?.status !== "done",
  });
  const recheck = useRecheckSubmission();
  const download = useDownloadSubmissionFile();
  const review = useReviewSubmission();
  const submission = query.data ?? initial;

  /** `null` — tahrirlash rejimi yopiq. Kalitlar — savol tartib raqami. */
  const [draft, setDraft] = useState<{
    score: string;
    grade: string;
    questions: Record<string, string>;
  } | null>(null);

  function beginEdit() {
    if (!submission) return;
    setDraft({
      score: submission.overallScore == null ? "" : String(submission.overallScore),
      grade: submission.grade ?? "",
      questions: Object.fromEntries(
        (submission.result?.questions ?? []).map((item, index) => [
          String(index),
          item.score == null ? "" : String(item.score),
        ])
      ),
    });
  }

  /**
   * Tahrirlangan natija ASL JSON asosida yig‘iladi: mapper bilmaydigan
   * maydonlar (AI yangi kalit qo‘shsa) saqlanib qolishi kerak.
   */
  function buildResult(edited: NonNullable<typeof draft>, score: number | null) {
    const raw = submission?.rawResult;
    if (!raw) return undefined;
    const questions = Array.isArray(raw.questions) ? raw.questions : null;
    return {
      ...raw,
      overall_score: score,
      grade: edited.grade,
      ...(questions
        ? {
            questions: questions.map((item, index) => {
              const value = edited.questions[String(index)];
              if (value === undefined) return item;
              return {
                ...(item as Record<string, unknown>),
                score: value.trim() === "" ? null : Number(value),
              };
            }),
          }
        : {}),
    };
  }

  function saveReview() {
    if (!submission || !draft) return;
    const score = draft.score.trim() === "" ? null : Number(draft.score);
    review.mutate(
      {
        id: submission.id,
        input: { overallScore: score, grade: draft.grade, result: buildResult(draft, score) },
      },
      { onSuccess: () => setDraft(null) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent
          className="homework-result-dialog"
          title={title}
          description={
            submission?.studentName
              ? `${submission.studentName} · ${submission.fileName ?? ""}`
              : "Gemini savolma-savol baholadi."
          }
        >
          {!submission ? (
            <div className="hw-result-state">
              <Clock3 size={26} />
              <p>Natija yuklanmoqda…</p>
            </div>
          ) : (
            <div className="hw-result">
              <header className="hw-result-head">
                {draft ? (
                  <div className="hw-score hw-score--edit">
                    <label className="hw-score-field">
                      <span>Umumiy ball</span>
                      <input
                        inputMode="numeric"
                        autoFocus
                        value={draft.score}
                        onChange={(event) =>
                          setDraft({ ...draft, score: event.target.value.replace(/[^\d]/g, "") })
                        }
                      />
                    </label>
                    <label className="hw-score-field">
                      <span>Baho</span>
                      <input
                        value={draft.grade}
                        onChange={(event) => setDraft({ ...draft, grade: event.target.value })}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="hw-score">
                    <strong>
                      {submission.overallScore ?? "—"}
                      <small>ball</small>
                    </strong>
                    <span>{submission.grade || "Baho yo‘q"}</span>
                  </div>
                )}
                <div className="hw-result-badges">
                  {submission.isLate ? (
                    <span className="hw-badge hw-badge--warn">
                      <Clock3 size={13} /> Kech topshirilgan
                    </span>
                  ) : null}
                  {submission.checkedAt ? (
                    <span className="hw-badge">
                      <CheckCircle2 size={13} />
                      {new Intl.DateTimeFormat("uz-UZ", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(submission.checkedAt))}
                    </span>
                  ) : null}
                </div>
                <div className="hw-result-actions">
                  {canReview && draft ? (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => setDraft(null)}>
                        Bekor
                      </Button>
                      <Button size="sm" loading={review.isPending} onClick={saveReview}>
                        Saqlash
                      </Button>
                    </>
                  ) : null}
                  {/* Tuzatish faqat tekshiruv tugagach mantiqiy — AI hali
                      ishlayotgan bo‘lsa natijasi ustiga yozib yuborardi. */}
                  {canReview && !draft && submission.status === "done" ? (
                    <Button size="sm" variant="secondary" onClick={beginEdit}>
                      <PencilLine size={15} /> Bahoni tuzatish
                    </Button>
                  ) : null}
                  {canDownloadFile ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={download.isPending}
                      onClick={() =>
                        download.mutate({
                          id: submission.id,
                          fileName: submission.fileName,
                        })
                      }
                    >
                      <Download size={15} /> Fayl
                    </Button>
                  ) : null}
                  {canRecheck ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={recheck.isPending}
                      disabled={submission.status === "checking"}
                      onClick={() => recheck.mutate(submission.id)}
                    >
                      <RefreshCw size={15} /> Qayta tekshirish
                    </Button>
                  ) : null}
                </div>
              </header>

              {submission.status === "checking" ? (
                <div className="hw-result-state">
                  <Sparkles size={26} className="spin" />
                  <p>AI tekshirmoqda… natija tayyor bo‘lishi bilan yangilanadi.</p>
                </div>
              ) : null}

              {submission.status === "error" ? (
                <div className="hw-result-state hw-result-state--error">
                  <AlertTriangle size={26} />
                  <p>{submission.error || "Tekshiruvda xatolik yuz berdi."}</p>
                </div>
              ) : null}

              {submission.result?.summary ? (
                <div className="hw-summary-grid">
                  <ChipList
                    icon={CheckCircle2}
                    tone="good"
                    title="Kuchli tomonlar"
                    items={submission.result.summary.strengths}
                  />
                  <ChipList
                    icon={TriangleAlert}
                    tone="warn"
                    title="Zaif tomonlar"
                    items={submission.result.summary.weaknesses}
                  />
                  <ChipList
                    icon={ListChecks}
                    tone="info"
                    title="Takrorlash kerak"
                    items={submission.result.summary.topicsToReview}
                  />
                  <ChipList
                    icon={Lightbulb}
                    tone="info"
                    title="Tavsiyalar"
                    items={submission.result.summary.recommendations}
                  />
                </div>
              ) : null}

              {submission.result?.questions?.length ? (
                <section className="hw-questions">
                  <span className="dialog-section-label">
                    SAVOLLAR ({submission.result.questions.length})
                  </span>
                  {submission.result.questions.map((question, index) => (
                    <QuestionCard
                      key={question.questionNumber ?? index}
                      question={question}
                      index={index}
                      scoreDraft={draft?.questions[String(index)]}
                      onScoreChange={(value) =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                questions: { ...current.questions, [String(index)]: value },
                              }
                            : current
                        )
                      }
                    />
                  ))}
                </section>
              ) : submission.status === "done" ? (
                <div className="hw-result-state">
                  <ListChecks size={26} />
                  <p>AI savollarni ajrata olmadi — faqat umumiy baho mavjud.</p>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
