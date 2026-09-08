import { useTranslation } from "react-i18next";
import type { Lesson } from "@/shared/types";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { useFinishLesson } from "../model/lesson.queries";

export interface FinishLessonDialogProps {
  lesson: Lesson | null;
  onOpenChange: (open: boolean) => void;
  /** Dars HAQIQATAN yakunlangach chaqiriladi (bekor qilinganda emas) — masalan jonli dars ekranidan chiqish uchun. */
  onFinished?: () => void;
}

/** O‘qituvchi uchun ortiqcha video-yozuv maydonisiz darsni yakunlash tasdig‘i. */
export function FinishLessonDialog({ lesson, onOpenChange, onFinished }: FinishLessonDialogProps) {
  const { t } = useTranslation("lesson");
  const finish = useFinishLesson();

  function submit() {
    if (!lesson) return;
    finish.mutate(
      { id: lesson.id },
      {
        onSuccess: () => {
          onOpenChange(false);
          onFinished?.();
        },
      }
    );
  }

  return (
    <Dialog open={Boolean(lesson)} onOpenChange={onOpenChange}>
      {lesson ? (
        <DialogContent
          title={t("finishDialog.title")}
          description={t("finishDialog.description", { title: lesson.title })}
        >
          <div className="dialog-actions">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t("finishDialog.cancel")}
            </Button>
            <Button type="button" loading={finish.isPending} onClick={submit}>
              {t("finishDialog.confirm")}
            </Button>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
