import { useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import type { QuizAttemptResult, QuizDetail } from "@/shared/types";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { useQuiz, useSubmitQuizAttempt } from "../model/quiz.queries";

export interface QuizAttemptDialogProps {
  quizId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * O'quvchi testni yechadi. `Quiz` obyekti bu yerda `is_correct`siz keladi
 * (backend yashiradi) — javob kaliti faqat submit javobida (`correctOption`)
 * ochiladi, shu bilan oldindan ko'rib qo'yish imkonsiz.
 */
export function QuizAttemptDialog({ quizId, open, onOpenChange }: QuizAttemptDialogProps) {
  const quiz = useQuiz(open ? quizId : null);
  const submit = useSubmitQuizAttempt();
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);

  /** Yopilganda draft va natija tozalanadi — keyingi ochilish toza boshlansin. */
  function handleOpenChange(next: boolean) {
    if (!next) {
      setAnswers({});
      setResult(null);
    }
    onOpenChange(next);
  }

  function submitAttempt(quizData: QuizDetail) {
    const payload = quizData.questions.map((question) => ({
      questionId: question.id,
      selectedOptionId: answers[question.id] ?? null,
    }));
    submit.mutate(
      { quizId: quizData.id, answers: payload },
      { onSuccess: setResult }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {open ? (
        <DialogContent
          className="quiz-attempt-dialog"
          title={quiz.data?.title ?? "Test"}
          description={quiz.data?.description || "Savollarga javob bering — vaqt chegarasi yo‘q."}
        >
          {!quiz.data ? (
            <div className="hw-result-state">
              <Clock3 size={26} />
              <p>Yuklanmoqda…</p>
            </div>
          ) : result ? (
            <QuizResultView
              result={result}
              onRetry={() => {
                setAnswers({});
                setResult(null);
              }}
              onClose={() => handleOpenChange(false)}
            />
          ) : (
            <div className="quiz-attempt-form">
              {quiz.data.questions.map((question, index) => (
                <div key={question.id} className="quiz-attempt-question">
                  <div className="quiz-attempt-question-head">
                    <span>{index + 1}-savol</span>
                    <b>{question.points} ball</b>
                  </div>
                  <p>{question.text}</p>
                  <div
                    className="quiz-option-list"
                    role="radiogroup"
                    aria-label={`${index + 1}-savol javoblari`}
                  >
                    {question.options.map((option) => {
                      const active = answers[question.id] === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          className={`quiz-attempt-option ${active ? "is-active" : ""}`}
                          onClick={() =>
                            setAnswers((current) => ({ ...current, [question.id]: option.id }))
                          }
                        >
                          <span className={`quiz-option-radio ${active ? "is-active" : ""}`} aria-hidden="true" />
                          {option.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="dialog-actions">
                <Button variant="secondary" onClick={() => handleOpenChange(false)}>
                  Yopish
                </Button>
                <Button loading={submit.isPending} onClick={() => submitAttempt(quiz.data)}>
                  Topshirish
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function QuizResultView({
  result,
  onRetry,
  onClose,
}: {
  result: QuizAttemptResult;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="quiz-result">
      <div className="quiz-result-score">
        <strong>
          {result.score}
          <small>/{result.maxScore}</small>
        </strong>
        <span>Natija</span>
      </div>
      <div className="quiz-attempt-question-list">
        {result.answers.map((answer, index) => (
          <div
            key={answer.questionId}
            className={`quiz-result-row ${answer.isCorrect ? "is-correct" : "is-wrong"}`}
          >
            <div className="quiz-result-row-head">
              {answer.isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <p>
                {index + 1}. {answer.questionText}
              </p>
            </div>
            <small>Sizning javobingiz: {answer.selectedOptionText ?? "Javob berilmagan"}</small>
            {!answer.isCorrect && answer.correctOption ? (
              <small className="quiz-result-correct">To‘g‘ri javob: {answer.correctOption.text}</small>
            ) : null}
          </div>
        ))}
      </div>
      {/* Cheklanmagan qayta urinish — o'quvchi shu yerdan darhol qayta boshlashi mumkin. */}
      <div className="dialog-actions">
        <Button variant="secondary" onClick={onRetry}>
          Qayta urinish
        </Button>
        <Button onClick={onClose}>Yopish</Button>
      </div>
    </div>
  );
}
