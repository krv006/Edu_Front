import type { Lesson } from "@/shared/types";
import { Dialog, DialogContent } from "@/shared/ui/legacy";
import { LessonRatingForm } from "./lesson-rating-form";

export interface RateLessonDialogProps {
  /** `null` — dialog yopiq. */
  lesson: Lesson | null;
  currentUserId?: string;
  onOpenChange: (open: boolean) => void;
}

/** Dars tugagach o'quvchi o'qituvchini baholaydigan oyna. */
export function RateLessonDialog({ lesson, currentUserId, onOpenChange }: RateLessonDialogProps) {
  return (
    <Dialog open={Boolean(lesson)} onOpenChange={onOpenChange}>
      {lesson ? (
        <DialogContent
          title="Darsni baholang"
          description={`“${lesson.title}” — o‘qituvchi uchun fikringiz.`}
        >
          {/* Dialog yopilib qayta ochilganda forma toza boshlansin. */}
          <LessonRatingForm
            key={lesson.id}
            lesson={lesson}
            currentUserId={currentUserId}
            onSubmitted={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
