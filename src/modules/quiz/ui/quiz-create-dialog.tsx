import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, FileUp, ListChecks, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLessons } from "@/modules/lesson";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { DatePicker, SelectPicker } from "@/shared/ui/legacy/form-pickers";
import type { QuizFormValues, QuizImportWarning } from "@/shared/types";
import { useImportQuizDocx } from "../model/quiz.queries";

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

/** Yangi savol shablonidagi standart variantlar soni — A, B, C, D. */
const DEFAULT_OPTION_COUNT = 4;

function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

function emptyOption(key: string): QuizOptionDraft {
  return { key, text: "" };
}

function emptyQuestion(key: string, optionKeys: string[]): QuizQuestionDraft {
  return {
    key,
    text: "",
    points: "1",
    options: optionKeys.map(emptyOption),
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
    emptyQuestion(
      "q-initial",
      Array.from({ length: DEFAULT_OPTION_COUNT }, (_, i) => `o-initial-${i + 1}`)
    ),
  ]);
  const [questionCount, setQuestionCount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importWarnings, setImportWarnings] = useState<QuizImportWarning[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importDocx = useImportQuizDocx();

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

  function newQuestion() {
    return emptyQuestion(
      newKey(),
      Array.from({ length: DEFAULT_OPTION_COUNT }, () => newKey())
    );
  }

  function reset() {
    setTitle("");
    setDescription("");
    setLessonId("");
    setDueAt("");
    setOpensAt("");
    setQuestions([newQuestion()]);
    setQuestionCount("");
    setImportWarnings([]);
    setError(null);
  }

  function addQuestion() {
    setQuestions((current) => [...current, newQuestion()]);
  }

  /** "Nechta savol?" maydoniga son kiritib, o'shancha bo'sh shablon (savol +
   * 4 ta variant maydoni) bir zumda ochib beradi — o'qituvchi har bir
   * savolni/variantni birma-bir qo'lda qo'shishga majbur bo'lmaydi. */
  function generateTemplates() {
    const count = Math.max(1, Math.min(100, Math.trunc(Number(questionCount)) || 0));
    if (!count) return;
    const hasContent = questions.some(
      (question) => question.text.trim() || question.options.some((option) => option.text.trim())
    );
    if (
      hasContent &&
      !window.confirm(t("createDialog.generateConfirm", { count: questions.length, newCount: count }))
    ) {
      return;
    }
    setQuestions(Array.from({ length: count }, () => newQuestion()));
  }

  /** `.docx` faylni tanlagach — parse qilingan savollarni draft'ga yuklaydi.
   * Hech narsa saqlanmagan, o'qituvchi ko'rib chiqib "Test yaratish"ni bosishi kerak. */
  function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    importDocx.mutate(file, {
      onSuccess: (preview) => {
        if (!title.trim() && preview.title) setTitle(preview.title);
        if (!description.trim() && preview.description) setDescription(preview.description);
        setQuestions(
          preview.questions.map((question) => {
            const options = question.options.map((option) => ({ key: newKey(), text: option.text }));
            const correctIndex = question.options.findIndex((option) => option.isCorrect);
            return {
              key: newKey(),
              text: question.text,
              points: String(question.points),
              options,
              correctKey: correctIndex >= 0 ? options[correctIndex].key : null,
            };
          })
        );
        setImportWarnings(preview.warnings);
      },
    });
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

            <div className="quiz-template-gen">
              <label>
                <span>{t("createDialog.questionCountLabel")}</span>
                <input
                  inputMode="numeric"
                  value={questionCount}
                  onChange={(event) => setQuestionCount(event.target.value.replace(/[^\d]/g, ""))}
                  placeholder={t("createDialog.questionCountPlaceholder")}
                />
              </label>
              <button type="button" className="quiz-generate-button" onClick={generateTemplates}>
                <ListChecks size={14} /> {t("createDialog.generateButton")}
              </button>
              <span className="quiz-template-gen-or">{t("createDialog.importOr")}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                hidden
                onChange={handleImportFile}
              />
              <button
                type="button"
                className="quiz-generate-button quiz-generate-button--ghost"
                disabled={importDocx.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp size={14} />{" "}
                {importDocx.isPending ? t("createDialog.importButtonLoading") : t("createDialog.importButton")}
              </button>
            </div>
            {importWarnings.length ? (
              <div className="form-alert form-alert--warning">
                {importWarnings.map((warning) => (
                  <p key={warning.questionNumber}>
                    {t(
                      warning.reason === "answer_not_detected"
                        ? "createDialog.importWarningAnswerNotDetected"
                        : "createDialog.importWarningNotEnoughOptions",
                      { number: warning.questionNumber }
                    )}
                  </p>
                ))}
              </div>
            ) : null}

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

                  <span className="quiz-option-caption">{t("createDialog.markCorrectCaption")}</span>
                  <div
                    className="quiz-option-list"
                    role="radiogroup"
                    aria-label={t("createDialog.correctAnswerGroupAria", { number: index + 1 })}
                  >
                    {question.options.map((option, optionIndex) => {
                      const active = question.correctKey === option.key;
                      return (
                        <div key={option.key} className="quiz-option-row">
                          <span className="quiz-option-letter">{optionLetter(optionIndex)}</span>
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
                            placeholder={t("createDialog.optionPlaceholderLettered", {
                              letter: optionLetter(optionIndex),
                            })}
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
