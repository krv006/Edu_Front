import { Clock3 } from "lucide-react";
import { Dialog, DialogContent } from "@/shared/ui/legacy";
import { useQuizAttempts } from "../model/quiz.queries";

export interface QuizAttemptsDialogProps {
  quizId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

const DATE_FORMAT = new Intl.DateTimeFormat("uz-UZ", { dateStyle: "medium", timeStyle: "short" });

/**
 * Urinishlar tarixi. O'quvchi faqat o'zinikini, o'qituvchi/admin/ota-ona
 * barchasini ko'radi — bu backend RBAC orqali cheklanadi, shu yerda
 * qo'shimcha filtr shart emas.
 */
export function QuizAttemptsDialog({
  quizId,
  open,
  onOpenChange,
  title = "Urinishlar tarixi",
}: QuizAttemptsDialogProps) {
  const attempts = useQuizAttempts(quizId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent title={title} description="Cheklanmagan qayta urinish — har biri alohida qatorda.">
          {attempts.isLoading ? (
            <div className="hw-result-state">
              <Clock3 size={26} />
              <p>Yuklanmoqda…</p>
            </div>
          ) : null}
          <div className="quiz-attempt-history">
            {(attempts.data ?? []).map((attempt) => (
              <article key={attempt.id}>
                <div>
                  <strong>{attempt.studentName}</strong>
                  <small>{DATE_FORMAT.format(new Date(attempt.createdAt))}</small>
                </div>
                <span className="grade-pill">
                  {attempt.score}/{attempt.maxScore}
                </span>
              </article>
            ))}
            {!attempts.isLoading && !attempts.data?.length ? (
              <p className="portal-muted">Hali urinish yo‘q.</p>
            ) : null}
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
