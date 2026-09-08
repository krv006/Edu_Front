import { useMemo, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLessons } from "@/modules/lesson";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { DatePicker, SelectPicker } from "@/shared/ui/legacy/form-pickers";
import type { QuizFormValues } from "@/shared/types";

interface QuizOptionDraft {
  key: string;
  text: string;
}

interface QuizQuestionDraft {
  key: string;
  text: string;
  points: string;
  options: QuizOptionDraft[];
  /** Tanlangan variant kaliti — bitta savolda faqat bitta to'g'ri javob bo'ladi. */
  correctKey: string | null;
}

export interface AddQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: QuizFormValues) => void;
  /** Test bog'lanadigan kurslar — o'qituvchining o'z kurslari. */
  courses: Array<{ id: string; title: string }>;
}

function emptyOption(key: string): QuizOptionDraft {
  return { key, text: "" };
}

function emptyQuestion(key: string, option1: string, option2: string): QuizQuestionDraft {
  return {
    key,
    text: "",
    points: "1",
    options: [emptyOption(option1), emptyOption(option2)],
    correctKey: null,
  };
}

export function AddQuizDialog({ open, onOpenChange, onCreate, courses }: AddQuizDialogProps) {
  const { t } = useTranslation("quiz");
  const nextKey = useRef(0);
  function newKey() {
    nextKey.current += 1;
    return `k${nextKey.current}`;
  }

  const [courseId, setCourseId] = useState(() => courses[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [opensAt, setOpensAt] = useState("");
  // Boshlang'ich savol statik kalitlar bilan — `newKey()` (ref) faqat event
  // handler'larda chaqiriladi, render paytida ref'ga murojaat qilinmaydi.
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>(() => [
    emptyQuestion("q-initial", "o-initial-1", "o-initial-2"),
  ]);
  const [error, setError] = useState<string | null>(null);

  const courseOptions = useMemo(
    () => courses.map((course) => ({ value: course.id, label: course.title })),
    [courses]
  );

  // Testni bog'lash mumkin bo'lgan darslar — faqat tanlangan kurs bo'yicha, dialog ochilganda.
  const lessons = useLessons({ course: courseId || null, page_size: 100 }, open && Boolean(courseId));
  const lessonOptions = useMemo(() => {
    const finished = (lessons.data ?? [])
      .filter((lesson) => lesson.status === "finished")
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
      .map((lesson) => ({ value: lesson.id, label: `${lesson.title} · ${lesson.date}` }));
    return [{ value: "", label: t("createDialog.notLinkedToLesson") }, ...finished];
  }, [lessons.data, t]);

  function reset() {
    setTitle("");
    setDescription("");
    setLessonId("");
    setDueAt("");
    setOpensAt("");
    setQuestions([emptyQuestion(newKey(), newKey(), newKey())]);
    setError(null);
  }

  function addQuestion() {
    setQuestions((current) => [...current, emptyQuestion(newKey(), newKey(), newKey())]);
  }

  function removeQuestion(questionKey: string) {
    setQuestions((current) => current.filter((question) => question.key !== questionKey));
  }

  function updateQuestion(questionKey: string, patch: Partial<QuizQuestionDraft>) {
    setQuestions((current) =>
      current.map((question) => (question.key === questionKey ? { ...question, ...patch } : question))
    );
  }

  function addOption(questionKey: string) {
    setQuestions((current) =>
      current.map((question) =>
        question.key === questionKey
          ? { ...question, options: [...question.options, emptyOption(newKey())] }
          : question
      )
    );
  }

  function removeOption(questionKey: string, optionKey: string) {
    setQuestions((current) =>
      current.map((question) => {
        if (question.key !== questionKey || question.options.length <= 2) return question;
        return {
          ...question,
          options: question.options.filter((option) => option.key !== optionKey),
          correctKey: question.correctKey === optionKey ? null : question.correctKey,
        };
      })
    );
  }

  function updateOptionText(questionKey: string, optionKey: string, text: string) {
    setQuestions((current) =>
      current.map((question) =>
        question.key === questionKey
          ? {
              ...question,
              options: question.options.map((option) =>
                option.key === optionKey ? { ...option, text } : option
              ),
            }
          : question
      )
    );
  }

  function validate(): string | null {
    if (!courseId) return t("createDialog.validation.chooseCourse");
    if (!title.trim()) return t("createDialog.validation.enterTitle");
    if (!questions.length) return t("createDialog.validation.addQuestion");
    for (const question of questions) {
      if (!question.text.trim()) return t("createDialog.validation.questionTextRequired");
      if (question.options.length < 2) return t("createDialog.validation.minTwoOptions");
      if (question.options.some((option) => !option.text.trim()))
        return t("createDialog.validation.allOptionsRequired");
      if (!question.correctKey) return t("createDialog.validation.markCorrect");
    }
    return null;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    onCreate({
      courseId,
      lessonId: lessonId || null,
      title: title.trim(),
      description: description.trim(),
      dueAt: dueAt || null,
      opensAt: opensAt || null,
      questions: questions.map((question) => ({
        text: question.text.trim(),
        points: Number(question.points) || 1,
        options: question.options.map((option) => ({
          text: option.text.trim(),
          isCorrect: option.key === question.correctKey,
        })),
      })),
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent
          className="group-action-dialog quiz-dialog"
          title={t("createDialog.title")}
          description={t("createDialog.description")}
        >
          <motion.form
            className="group-action-form"
            onSubmit={submit}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SelectPicker
              label={t("createDialog.courseLabel")}
              icon={BookOpen}
              value={courseId}
              onChange={(value) => {
                setCourseId(value);
                setLessonId("");
              }}
              options={courseOptions}
            />
            <label>
              <span>{t("createDialog.titleLabel")}</span>
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t("createDialog.titlePlaceholder")}
              />
            </label>
            <label>
              <span>{t("createDialog.descriptionLabel")}</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t("createDialog.descriptionPlaceholder")}
                rows={2}
              />
            </label>

            <div className="form-grid-two">
              <DatePicker
                label={t("createDialog.dueLabel")}
                value={dueAt}
                onChange={setDueAt}
                includeTime
                optional
              />
              <DatePicker
                label={t("createDialog.opensLabel")}
                value={opensAt}
                onChange={setOpensAt}
                includeTime
                optional
              />
            </div>
            <SelectPicker
              label={t("createDialog.lessonLabel")}
              icon={CalendarDays}
              value={lessonId}
              onChange={setLessonId}
              options={lessonOptions}
            />

            <div className="quiz-questions">
              {questions.map((question, index) => (
                <div key={question.key} className="quiz-question-card">
                  <div className="quiz-question-head">
                    <label>
                      <span>{t("createDialog.questionNumber", { number: index + 1 })}</span>
                      <input
                        value={question.text}
                        onChange={(event) => updateQuestion(question.key, { text: event.target.value })}
                        placeholder={t("createDialog.optionPlaceholder")}
                      />
                    </label>
                    <label>
                      <span>{t("createDialog.pointsLabel")}</span>
                      <input
                        inputMode="numeric"
                        value={question.points}
                        onChange={(event) =>
                          updateQuestion(question.key, {
                            points: event.target.value.replace(/[^\d]/g, ""),
                          })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="icon-button destructive-icon"
                      aria-label={t("createDialog.deleteQuestionAria", { number: index + 1 })}
                      disabled={questions.length <= 1}
                      onClick={() => removeQuestion(question.key)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div
                    className="quiz-option-list"
                    role="radiogroup"
                    aria-label={t("createDialog.correctAnswerGroupAria", { number: index + 1 })}
                  >
                    {question.options.map((option) => {
                      const active = question.correctKey === option.key;
                      return (
                        <div key={option.key} className="quiz-option-row">
                          <button
                            type="button"
                            role="radio"
                            aria-checked={active}
                            aria-label={t("createDialog.markCorrectAria")}
                            className={`quiz-option-radio ${active ? "is-active" : ""}`}
                            onClick={() => updateQuestion(question.key, { correctKey: option.key })}
                          />
                          <input
                            value={option.text}
                            onChange={(event) =>
                              updateOptionText(question.key, option.key, event.target.value)
                            }
                            placeholder={t("createDialog.optionPlaceholder")}
                          />
                          <button
                            type="button"
                            className="icon-button destructive-icon"
                            aria-label={t("createDialog.deleteOptionAria")}
                            disabled={question.options.length <= 2}
                            onClick={() => removeOption(question.key, option.key)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="quiz-add-option"
                    onClick={() => addOption(question.key)}
                  >
                    <Plus size={13} /> {t("createDialog.addOption")}
                  </button>
                </div>
              ))}
              <button type="button" className="quiz-add-question" onClick={addQuestion}>
                <Plus size={14} /> {t("createDialog.addQuestion")}
              </button>
            </div>

            {error ? <div className="form-alert">{error}</div> : null}

            <div className="dialog-actions">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                {t("createDialog.cancel")}
              </Button>
              <Button type="submit">{t("createDialog.create")}</Button>
            </div>
          </motion.form>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
