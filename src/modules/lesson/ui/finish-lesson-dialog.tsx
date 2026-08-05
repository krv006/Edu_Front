import { useState, type FormEvent } from "react";
import type { Lesson } from "@/shared/types";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { useFinishLesson } from "../model/lesson.queries";

export interface FinishLessonDialogProps {
  lesson: Lesson | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Darsni yakunlash: o'qituvchi video yozuvga nom beradi (docs/PROJECT.md §10).
 * Nom bo'sh qolsa backend dars nomini oladi, shuning uchun maydon majburiy emas.
 */
export function FinishLessonDialog({ lesson, onOpenChange }: FinishLessonDialogProps) {
  const [title, setTitle] = useState("");
  const finish = useFinishLesson();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lesson) return;
    finish.mutate(
      { id: lesson.id, recordingTitle: title },
      {
        onSuccess: () => {
          setTitle("");
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <Dialog open={Boolean(lesson)} onOpenChange={onOpenChange}>
      {lesson ? (
        <DialogContent
          title="Darsni yakunlash"
          description="Video yozuv guruh chatiga e’lon qilinadi. Unga nom bering."
        >
          <form className="dialog-form" onSubmit={submit}>
            <label className="field-group">
              <span>Yozuv nomi</span>
              <div className="input-shell">
                <input
                  autoFocus
                  value={title}
                  maxLength={120}
                  placeholder={lesson.title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
            </label>
            <p className="portal-muted">
              Bo‘sh qoldirsangiz dars nomi — «{lesson.title}» ishlatiladi.
            </p>
            <div className="dialog-actions">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Bekor
              </Button>
              <Button type="submit" loading={finish.isPending}>
                Yakunlash
              </Button>
            </div>
          </form>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
