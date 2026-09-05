import { useEffect, useMemo, useState } from "react";
import { FileQuestion, History, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useCourses } from "@/modules/course";
import {
  AddQuizDialog,
  QuizAttemptsDialog,
  useCreateQuiz,
  useDeleteQuiz,
  useQuizzes,
} from "@/modules/quiz";
import type { QuizSummary } from "@/shared/types";
import { Button, Dialog, DialogContent, LoadingFallback, RouteState } from "@/shared/ui/legacy";

/** Bildirishnomadan kelingan testni ajratib ko'rsatadi. */
function useQuizHighlight(quizId: string | null, ready: boolean) {
  useEffect(() => {
    if (!quizId || !ready) return;
    document
      .querySelector(`[data-quiz-id="${CSS.escape(quizId)}"]`)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [quizId, ready]);
}

export function TeacherQuizzesPage() {
  const courses = useCourses();
  const quizzes = useQuizzes(null);
  const create = useCreateQuiz();
  const remove = useDeleteQuiz();
  const [dialog, setDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<QuizSummary | null>(null);
  const [attemptsOf, setAttemptsOf] = useState<QuizSummary | null>(null);
  const [params] = useSearchParams();
  const highlightId = params.get("quiz");
  useQuizHighlight(highlightId, (quizzes.data?.length ?? 0) > 0);

  const courseTitleById = useMemo(
    () => new Map((courses.data ?? []).map((course) => [course.id, course.title])),
    [courses.data]
  );
  const courseOptions = useMemo(
    () => (courses.data ?? []).map((course) => ({ id: course.id, title: course.title })),
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
          <p>Variantli savollar — baholash avtomatik va darhol.</p>
        </div>
        <Button onClick={() => setDialog(true)} disabled={!courseOptions.length}>
          <Plus size={17} /> Test yaratish
        </Button>
      </div>

      {list.length ? (
        <div className="assignment-list">
          {list.map((item) => (
            <motion.article
              key={item.id}
              data-quiz-id={item.id}
              className={`assignment-card ${item.id === highlightId ? "is-highlighted" : ""}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="assignment-card-icon">
                <FileQuestion size={20} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <small>
                  {courseTitleById.get(item.courseId) ?? "Kurs"} ·{" "}
                  {item.dueAt
                    ? `Muddat: ${new Intl.DateTimeFormat("uz-UZ", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(item.dueAt))}`
                    : "Muddat belgilanmagan"}{" "}
                  · {item.questionCount} ta savol
                </small>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setAttemptsOf(item)}>
                <History size={15} /> Urinishlar
              </Button>
              <button
                className="icon-button destructive-icon"
                onClick={() => setDeleteTarget(item)}
                aria-label="Testni o‘chirish"
              >
                <Trash2 size={16} />
              </button>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="premium-empty">
          <FileQuestion size={30} />
          <h3>Hali test yaratilmagan</h3>
          {courseOptions.length ? (
            <Button onClick={() => setDialog(true)}>Birinchi testni yaratish</Button>
          ) : (
            <p className="portal-muted">Avval kursga ega bo‘lishingiz kerak.</p>
          )}
        </div>
      )}

      <AddQuizDialog
        open={dialog}
        onOpenChange={setDialog}
        courses={courseOptions}
        onCreate={(form) => {
          create.mutateAsync(form).then(() => setDialog(false));
        }}
      />
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        {deleteTarget && (
          <DialogContent
            title="Testni o‘chirish"
            description={`“${deleteTarget.title}” va unga bog‘liq urinishlar o‘chadi.`}
          >
            <div className="dialog-actions">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Bekor
              </Button>
              <Button
                loading={remove.isPending}
                onClick={() => remove.mutateAsync(deleteTarget.id).then(() => setDeleteTarget(null))}
              >
                O‘chirish
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
      <QuizAttemptsDialog
        quizId={attemptsOf?.id ?? null}
        open={Boolean(attemptsOf)}
        onOpenChange={(open) => {
          if (!open) setAttemptsOf(null);
        }}
        title={attemptsOf ? `“${attemptsOf.title}” — urinishlar` : undefined}
      />
    </div>
  );
}
