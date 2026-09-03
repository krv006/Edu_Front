import { useEffect, useMemo, useState } from "react";
import { FileQuestion, History } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useCourses } from "@/modules/course";
import { QuizAttemptDialog, QuizAttemptsDialog, useQuizzes } from "@/modules/quiz";
import type { QuizSummary } from "@/shared/types";
import { Button, LoadingFallback, RouteState } from "@/shared/ui/legacy";

/** Bildirishnomadan kelingan testni ajratib ko'rsatadi. */
function useQuizHighlight(quizId: string | null, ready: boolean) {
  useEffect(() => {
    if (!quizId || !ready) return;
    document
      .querySelector(`[data-quiz-id="${CSS.escape(quizId)}"]`)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [quizId, ready]);
}

export function StudentQuizzesPage() {
  const courses = useCourses();
  const quizzes = useQuizzes(null);
  const [attemptOf, setAttemptOf] = useState<QuizSummary | null>(null);
  const [historyOf, setHistoryOf] = useState<QuizSummary | null>(null);
  const [params] = useSearchParams();
  const highlightId = params.get("quiz");
  useQuizHighlight(highlightId, (quizzes.data?.length ?? 0) > 0);

  const courseTitleById = useMemo(
    () => new Map((courses.data ?? []).map((course) => [course.id, course.title])),
    [courses.data]
  );

  if (quizzes.isLoading) return <LoadingFallback label="Testlar yuklanmoqda" />;
  if (quizzes.isError)
    return (
      <RouteState
        eyebrow="TESTLAR"
        title="Testlarni yuklab bo‘lmadi"
        description={quizzes.error?.message}
        actionLabel="Qayta urinish"
        onAction={quizzes.refetch}
      />
    );

  const list = quizzes.data ?? [];

  return (
    <div className="portal-page">
      <div className="portal-page-heading">
        <div>
          <span className="portal-eyebrow">BARCHA KURSLAR</span>
          <h1>Testlar</h1>
          <p>Vaqt chegarasi yo‘q — cheklanmagan qayta urinish.</p>
        </div>
      </div>

      <div className="student-workspace-list">
        {list.map((item) => (
          <article
            key={item.id}
            data-quiz-id={item.id}
            className={item.id === highlightId ? "is-highlighted" : ""}
          >
            <span className="workspace-list-icon">
              <FileQuestion size={20} />
            </span>
            <div>
              <strong>{item.title}</strong>
              <p>
                {courseTitleById.get(item.courseId) ?? "Kurs"} ·{" "}
                {item.dueAt
                  ? `Muddat: ${new Intl.DateTimeFormat("uz-UZ", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(item.dueAt))}`
                  : "Muddat yo‘q"}{" "}
                · {item.questionCount} ta savol
              </p>
            </div>
            <button
              className="icon-button"
              aria-label="Urinishlar tarixi"
              onClick={() => setHistoryOf(item)}
            >
              <History size={16} />
            </button>
            <Button size="sm" onClick={() => setAttemptOf(item)}>
              Yechish
            </Button>
          </article>
        ))}
        {!list.length ? <p className="portal-muted">Hali test yo‘q.</p> : null}
      </div>

      <QuizAttemptDialog
        quizId={attemptOf?.id ?? null}
        open={Boolean(attemptOf)}
        onOpenChange={(open) => {
          if (!open) setAttemptOf(null);
        }}
      />
      <QuizAttemptsDialog
        quizId={historyOf?.id ?? null}
        open={Boolean(historyOf)}
        onOpenChange={(open) => {
          if (!open) setHistoryOf(null);
        }}
        title={historyOf ? `“${historyOf.title}” — urinishlaringiz` : undefined}
      />
    </div>
  );
}
