import { useMemo, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { DatePicker, SelectPicker } from "@/shared/ui/legacy/form-pickers";
import type { Lesson, QuizFormValues } from "@/shared/types";

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
  onCreate: (values: Omit<QuizFormValues, "courseId">) => void;
  /** Testni bog'lash mumkin bo'lgan darslar — backend faqat tugagan darsni qabul qiladi. */
  lessons?: readonly Lesson[];
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

export function AddQuizDialog({ open, onOpenChange, onCreate, lessons = [] }: AddQuizDialogProps) {
  const nextKey = useRef(0);
  function newKey() {
    nextKey.current += 1;
    return `k${nextKey.current}`;
  }

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

  /** Backend faqat tugagan darsni qabul qiladi — eng yangisi tepada. */
  const lessonOptions = useMemo(() => {
    const finished = lessons
      .filter((lesson) => lesson.status === "finished")
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
      .map((lesson) => ({ value: lesson.id, label: `${lesson.title} · ${lesson.date}` }));
    return [{ value: "", label: "Darsga bog‘lanmagan" }, ...finished];
  }, [lessons]);

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
    if (!title.trim()) return "Test nomini kiriting";
    if (!questions.length) return "Kamida bitta savol qo‘shing";
    for (const question of questions) {
      if (!question.text.trim()) return "Har bir savol matni to‘ldirilishi kerak";
      if (question.options.length < 2) return "Har bir savolda kamida 2 ta variant bo‘lishi kerak";
      if (question.options.some((option) => !option.text.trim()))
        return "Barcha variant matnlari to‘ldirilishi kerak";
      if (!question.correctKey) return "Har bir savolda to‘g‘ri javobni belgilang";
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
          title="Yangi test"
          description="Faqat variantli savollar — baholash avtomatik va darhol."
        >
          <motion.form
            className="group-action-form"
            onSubmit={submit}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <label>
              <span>Test nomi</span>
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Masalan: 1-bob testi"
              />
            </label>
            <label>
              <span>Tavsif — ixtiyoriy</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Test haqida qisqacha izoh"
                rows={2}
              />
            </label>

            <div className="form-grid-two">
              <DatePicker
                label="Topshirish muddati · ixtiyoriy"
                value={dueAt}
                onChange={setDueAt}
                includeTime
                optional
              />
              <DatePicker
                label="Ochilish vaqti · ixtiyoriy"
                value={opensAt}
                onChange={setOpensAt}
                includeTime
                optional
              />
            </div>
            <SelectPicker
              label="Qaysi dars uchun"
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
                      <span>{index + 1}-savol</span>
                      <input
                        value={question.text}
                        onChange={(event) => updateQuestion(question.key, { text: event.target.value })}
                        placeholder="Savol matni"
                      />
                    </label>
                    <label>
                      <span>Ball</span>
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
                      aria-label={`${index + 1}-savolni o‘chirish`}
                      disabled={questions.length <= 1}
                      onClick={() => removeQuestion(question.key)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div
                    className="quiz-option-list"
                    role="radiogroup"
                    aria-label={`${index + 1}-savol uchun to‘g‘ri javob`}
                  >
                    {question.options.map((option) => {
                      const active = question.correctKey === option.key;
                      return (
                        <div key={option.key} className="quiz-option-row">
                          <button
                            type="button"
                            role="radio"
                            aria-checked={active}
                            aria-label="To‘g‘ri javob sifatida belgilash"
                            className={`quiz-option-radio ${active ? "is-active" : ""}`}
                            onClick={() => updateQuestion(question.key, { correctKey: option.key })}
                          />
                          <input
                            value={option.text}
                            onChange={(event) =>
                              updateOptionText(question.key, option.key, event.target.value)
                            }
                            placeholder="Variant matni"
                          />
                          <button
                            type="button"
                            className="icon-button destructive-icon"
                            aria-label="Variantni o‘chirish"
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
                    <Plus size={13} /> Variant qo‘shish
                  </button>
                </div>
              ))}
              <button type="button" className="quiz-add-question" onClick={addQuestion}>
                <Plus size={14} /> Savol qo‘shish
              </button>
            </div>

            {error ? <div className="form-alert">{error}</div> : null}

            <div className="dialog-actions">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button type="submit">Test yaratish</Button>
            </div>
          </motion.form>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
