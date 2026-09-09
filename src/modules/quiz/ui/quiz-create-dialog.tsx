import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, FileUp, X } from "lucide-react";
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

  const [step, setStep] = useState<"details" | "questions">("details");
  const [courseId, setCourseId] = useState(() => courses[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [opensAt, setOpensAt] = useState("");
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([]);
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
    setStep("details");
    setTitle("");
    setDescription("");
    setLessonId("");
    setDueAt("");
    setOpensAt("");
    setQuestions([]);
    setQuestionCount("");
    setImportWarnings([]);
    setError(null);
  }

  /** "Nechta savol?" maydoniga son kiritib davom etilsa — o'shancha bo'sh
   * shablon (savol + 4 ta variant) bilan alohida, sodda "qog'oz" sahifasiga
   * o'tiladi — o'qituvchi faqat yozadi, hech narsa qo'shish/o'chirish shart
   * emas. */
  function goToQuestions() {
    if (!courseId || !title.trim()) {
      setError(!courseId ? t("createDialog.validation.chooseCourse") : t("createDialog.validation.enterTitle"));
      return;
    }
    const count = Math.max(1, Math.min(100, Math.trunc(Number(questionCount)) || 0));
    const hasContent = questions.some(
      (question) => question.text.trim() || question.options.some((option) => option.text.trim())
    );
    if (
      questions.length &&
      hasContent &&
      !window.confirm(t("createDialog.generateConfirm", { count: questions.length, newCount: count }))
    ) {
      return;
    }
    setError(null);
    setQuestions(Array.from({ length: count }, () => newQuestion()));
    setImportWarnings([]);
    setStep("questions");
  }

  /** `.docx` faylni tanlagach — parse qilingan savollarni to'g'ridan-to'g'ri
   * savollar sahifasiga yuklaydi. Hech narsa saqlanmagan, o'qituvchi ko'rib
   * chiqib "Test yaratish"ni bosishi kerak. */
  function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!courseId || !title.trim()) {
      setError(!courseId ? t("createDialog.validation.chooseCourse") : t("createDialog.validation.enterTitle"));
      return;
    }
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
        setError(null);
        setStep("questions");
      },
    });
  }

  function updateQuestion(questionKey: string, patch: Partial<QuizQuestionDraft>) {
    setQuestions((current) =>
      current.map((question) => (question.key === questionKey ? { ...question, ...patch } : question))
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

  if (!open) return null;

  if (step === "questions") {
    return (
      <div className="quiz-page">
        <div className="quiz-page-header">
          <div>
            <span className="quiz-page-eyebrow">{title || t("createDialog.title")}</span>
            <h2>{t("createDialog.questionsPageTitle")}</h2>
          </div>
          <div className="quiz-page-header-actions">
            <Button type="button" variant="ghost" onClick={() => setStep("details")}>
              {t("createDialog.backButton")}
            </Button>
            <Button type="submit" form="quiz-questions-form">
              {t("createDialog.create")}
            </Button>
            <button
              type="button"
              className="icon-button"
              aria-label={t("createDialog.cancel")}
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {importWarnings.length ? (
          <div className="form-alert form-alert--warning quiz-page-alert">
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
        {error ? <div className="form-alert quiz-page-alert">{error}</div> : null}

        <form id="quiz-questions-form" className="quiz-page-body" onSubmit={submit}>
          {questions.map((question, index) => (
            <div key={question.key} className="quiz-page-question">
              <div className="quiz-page-question-head">
                <span className="quiz-page-question-number">{index + 1}.</span>
                <input
                  className="quiz-page-question-text"
                  value={question.text}
                  onChange={(event) => updateQuestion(question.key, { text: event.target.value })}
                  placeholder={t("createDialog.questionTextPlaceholder")}
                />
              </div>
              <div className="quiz-page-options">
                {question.options.map((option, optionIndex) => (
                  <div key={option.key} className="quiz-page-option">
                    <span className="quiz-page-option-letter">{optionLetter(optionIndex)})</span>
                    <input
                      value={option.text}
                      onChange={(event) => updateOptionText(question.key, option.key, event.target.value)}
                      placeholder={t("createDialog.optionPlaceholderLettered", {
                        letter: optionLetter(optionIndex),
                      })}
                    />
                  </div>
                ))}
              </div>
              <div
                className="quiz-page-answer-row"
                role="radiogroup"
                aria-label={t("createDialog.correctAnswerGroupAria", { number: index + 1 })}
              >
                <span className="quiz-page-answer-label">{t("createDialog.correctAnswerLabel")}</span>
                {question.options.map((option, optionIndex) => {
                  const active = question.correctKey === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={t("createDialog.markCorrectAria")}
                      className={`quiz-page-answer-letter ${active ? "is-correct" : ""}`}
                      onClick={() => updateQuestion(question.key, { correctKey: option.key })}
                    >
                      {optionLetter(optionIndex)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </form>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="group-action-dialog"
        title={t("createDialog.title")}
        description={t("createDialog.description")}
      >
        <motion.div
          className="group-action-form"
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
            <button type="button" className="quiz-generate-button" onClick={goToQuestions}>
              {t("createDialog.continueButton")}
            </button>
            <span className="quiz-template-gen-or">{t("createDialog.importOr")}</span>
            <input ref={fileInputRef} type="file" accept=".docx" hidden onChange={handleImportFile} />
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

          {error ? <div className="form-alert">{error}</div> : null}

          <div className="dialog-actions">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("createDialog.cancel")}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
