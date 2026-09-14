import { useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useQuizzes } from "@/modules/quiz";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { useCreateMockTest } from "../model/mock-test.queries";

const DEFAULT_MINUTES = 30;

export interface MockTestCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string | null;
}

export function MockTestCreateDialog({ open, onOpenChange, courseId }: MockTestCreateDialogProps) {
  const { t } = useTranslation("mocktest");
  const quizzes = useQuizzes(courseId, open && Boolean(courseId));
  const create = useCreateMockTest();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minutes, setMinutes] = useState(String(DEFAULT_MINUTES));
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(() => quizzes.data ?? [], [quizzes.data]);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!courseId) return;
    if (!title.trim()) {
      setError(t("create.errorTitle"));
      return;
    }
    if (selected.length < 1) {
      setError(t("create.errorQuizzes"));
      return;
    }
    setError(null);
    create
      .mutateAsync({
        courseId,
        title,
        description,
        timeLimitMinutes: Number(minutes) || DEFAULT_MINUTES,
        quizIds: selected,
      })
      .then(() => {
        setTitle("");
        setDescription("");
        setMinutes(String(DEFAULT_MINUTES));
        setSelected([]);
        onOpenChange(false);
      })
      .catch(() => undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent
          className="group-action-dialog"
          title={t("create.title")}
          description={t("create.description")}
        >
          <form className="group-action-form" onSubmit={submit}>
            <label>
              <span>{t("create.nameLabel")}</span>
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t("create.namePlaceholder")}
              />
            </label>
            <label>
              <span>{t("create.descriptionLabel")}</span>
              <textarea
                rows={2}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t("create.descriptionPlaceholder")}
              />
            </label>
            <label>
              <span>{t("create.minutesLabel")}</span>
              <input
                inputMode="numeric"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value.replace(/[^\d]/g, ""))}
                placeholder={String(DEFAULT_MINUTES)}
              />
            </label>

            <div className="mock-quiz-picker">
              <span className="info-section-title">{t("create.quizzesLabel")}</span>
              {options.length ? (
                <div className="mock-quiz-list">
                  {options.map((quiz) => {
                    const active = selected.includes(quiz.id);
                    return (
                      <button
                        key={quiz.id}
                        type="button"
                        className={`mock-quiz-item ${active ? "is-active" : ""}`}
                        aria-pressed={active}
                        onClick={() => toggle(quiz.id)}
                      >
                        <span>{quiz.title}</span>
                        <small>{t("create.questionCount", { count: quiz.questionCount })}</small>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="portal-muted">{t("create.noQuizzes")}</p>
              )}
            </div>

            {error ? <div className="form-alert">{error}</div> : null}

            <div className="dialog-actions">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                {t("create.cancel")}
              </Button>
              <Button type="submit" loading={create.isPending}>
                {t("create.submit")}
              </Button>
            </div>
          </form>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
