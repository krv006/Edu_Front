import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/legacy";
import type { MockAttempt } from "../api/mock-test.dto";
import { useSubmitMockTest } from "../model/mock-test.queries";

function remainingSeconds(deadline: string): number {
  return Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000));
}

function formatClock(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export interface MockTestRunnerProps {
  mockTestId: string;
  attempt: MockAttempt;
  onFinished: (score: { total: number; max: number }) => void;
  onCancel: () => void;
}

export function MockTestRunner({ mockTestId, attempt, onFinished, onCancel }: MockTestRunnerProps) {
  const { t } = useTranslation("mocktest");
  const submit = useSubmitMockTest();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [left, setLeft] = useState(() => remainingSeconds(attempt.deadline));
  const autoSubmitted = useRef(false);

  const payload = useMemo(
    () => ({
      sections: attempt.sections.map((section) => ({
        quiz: section.quizId,
        answers: section.questions
          .filter((question) => answers[question.id])
          .map((question) => ({ question: question.id, selected_option: answers[question.id] })),
      })),
    }),
    [attempt.sections, answers]
  );
  const payloadRef = useRef(payload);
  useEffect(() => {
    payloadRef.current = payload;
  }, [payload]);

  const finishRef = useRef<() => void>(() => undefined);

  const totalQuestions = attempt.sections.reduce((sum, s) => sum + s.questions.length, 0);
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    finishRef.current = () => {
      if (autoSubmitted.current) return;
      autoSubmitted.current = true;
      submit
        .mutateAsync({ id: mockTestId, attemptId: attempt.id, payload: payloadRef.current })
        .then((result) => onFinished({ total: result.totalScore, max: result.totalMaxScore }))
        .catch(() => undefined);
    };
  }, [attempt.id, mockTestId, onFinished, submit]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = remainingSeconds(attempt.deadline);
      setLeft(next);
      if (next === 0) finishRef.current();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [attempt.deadline]);

  async function handleSubmit() {
    if (autoSubmitted.current) return;
    autoSubmitted.current = true;
    try {
      const result = await submit.mutateAsync({ id: mockTestId, attemptId: attempt.id, payload });
      onFinished({ total: result.totalScore, max: result.totalMaxScore });
    } catch {
      autoSubmitted.current = false;
    }
  }

  return (
    <div className="mock-runner">
      <div className="mock-runner-bar">
        <div>
          <span>{t("runner.progress", { answered: answeredCount, total: totalQuestions })}</span>
        </div>
        <strong className={left <= 60 ? "is-urgent" : ""}>{formatClock(left)}</strong>
        <div className="mock-runner-bar-actions">
          <Button variant="secondary" onClick={onCancel}>
            {t("runner.cancel")}
          </Button>
          <Button loading={submit.isPending} onClick={handleSubmit}>
            {t("runner.submit")}
          </Button>
        </div>
      </div>

      {attempt.sections.map((section, sectionIndex) => (
        <section key={section.quizId} className="mock-runner-section">
          <h3>
            {sectionIndex + 1}. {section.quizTitle}
          </h3>
          <div className="quiz-attempt-form">
            {section.questions.map((question, index) => (
              <div key={question.id} className="quiz-attempt-question">
                <div className="quiz-attempt-question-head">
                  <span>{t("runner.questionNumber", { number: index + 1 })}</span>
                  <b>{t("runner.pointsSuffix", { count: question.points })}</b>
                </div>
                <p>{question.text}</p>
                <div className="quiz-option-list" role="radiogroup" aria-label={question.text}>
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
          </div>
        </section>
      ))}
    </div>
  );
}
