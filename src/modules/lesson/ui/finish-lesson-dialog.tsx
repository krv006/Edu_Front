import type { Lesson } from "@/shared/types";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { useFinishLesson } from "../model/lesson.queries";

export interface FinishLessonDialogProps {
  lesson: Lesson | null;
  onOpenChange: (open: boolean) => void;
}

/** O‘qituvchi uchun ortiqcha video-yozuv maydonisiz darsni yakunlash tasdig‘i. */
export function FinishLessonDialog({ lesson, onOpenChange }: FinishLessonDialogProps) {
  const finish = useFinishLesson();

  function submit() {
    if (!lesson) return;
    finish.mutate(
      { id: lesson.id },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={Boolean(lesson)} onOpenChange={onOpenChange}>
      {lesson ? (
        <DialogContent
          title="Darsni yakunlash"
          description={`“${lesson.title}” darsini yakunlamoqchimisiz?`}
        >
          <div className="dialog-actions">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Bekor
            </Button>
            <Button type="button" loading={finish.isPending} onClick={submit}>
              Yakunlash
            </Button>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
