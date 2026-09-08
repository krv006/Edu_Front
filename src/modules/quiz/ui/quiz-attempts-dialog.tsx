import { Clock3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toIntlLocale } from "@/shared/i18n";
import { Dialog, DialogContent } from "@/shared/ui/legacy";
import { useQuizAttempts } from "../model/quiz.queries";

export interface QuizAttemptsDialogProps {
  quizId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

/**
 * Urinishlar tarixi. O'quvchi faqat o'zinikini, o'qituvchi/admin/ota-ona
 * barchasini ko'radi — bu backend RBAC orqali cheklanadi, shu yerda
 * qo'shimcha filtr shart emas.
 */
export function QuizAttemptsDialog({ quizId, open, onOpenChange, title }: QuizAttemptsDialogProps) {
  const { t, i18n } = useTranslation("quiz");
  const attempts = useQuizAttempts(quizId, open);
  const dateFormat = new Intl.DateTimeFormat(toIntlLocale(i18n.language), {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent
          title={title ?? t("attemptsDialog.defaultTitle")}
          description={t("attemptsDialog.description")}
        >
          {attempts.isLoading ? (
            <div className="hw-result-state">
              <Clock3 size={26} />
              <p>{t("attemptsDialog.loading")}</p>
            </div>
          ) : null}
          <div className="quiz-attempt-history">
            {(attempts.data ?? []).map((attempt) => (
              <article key={attempt.id}>
                <div>
                  <strong>{attempt.studentName}</strong>
                  <small>{dateFormat.format(new Date(attempt.createdAt))}</small>
                </div>
                <span className="grade-pill">
                  {attempt.score}/{attempt.maxScore}
                </span>
              </article>
            ))}
            {!attempts.isLoading && !attempts.data?.length ? (
              <p className="portal-muted">{t("attemptsDialog.empty")}</p>
            ) : null}
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
