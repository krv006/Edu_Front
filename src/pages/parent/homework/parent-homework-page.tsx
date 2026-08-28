import { useState } from "react";
import { formatDayTime } from "@/shared/lib";
import { CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { HomeworkResultDialog } from "@/modules/homework";
import type { Submission } from "@/shared/types";
import { useParentHomework, useSelectedChild } from "@/modules/parent";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";

function SubmissionPill({
  submission,
  onOpen,
}: {
  submission: Submission | null;
  onOpen: (submission: Submission) => void;
}) {
  if (!submission) return <span className="grade-pill">Topshirilmagan</span>;
  if (submission.status === "done")
    return (
      <button className="grade-pill grade-pill--button" onClick={() => onOpen(submission)} aria-label="Natijani ochish">
        <CheckCircle2 size={15} /> {submission.overallScore} ball · {submission.grade}
      </button>
    );
  if (submission.status === "checking")
    return (
      <button className="grade-pill grade-pill--button grade-pill--checking" onClick={() => onOpen(submission)} aria-label="Tekshiruv holatini ochish">
        <Clock3 size={14} /> Tekshirilmoqda
      </button>
    );
  return (
    <button className="grade-pill grade-pill--button grade-pill--error" onClick={() => onOpen(submission)} aria-label="Xatolik tafsilotini ochish">
      Tekshiruv xatosi
    </button>
  );
}

export function ParentHomeworkPage() {
  const { selectedChild, selectedChildId } = useSelectedChild();
  const homework = useParentHomework(selectedChildId);
  const [resultOf, setResultOf] = useState<Submission | null>(null);

  if (!selectedChild)
    return (
      <div className="portal-empty">
        <ListChecks size={30} />
        <h2>Farzand tanlanmagan</h2>
        <p>Avval o‘quvchi hisobini ulang.</p>
      </div>
    );
  if (homework.isLoading) return <LoadingFallback label="Vazifalar yuklanmoqda" />;
  if (homework.isError)
    return (
      <RouteState
        title="Vazifalarni yuklab bo‘lmadi"
        description={homework.error.message}
        actionLabel="Qayta urinish"
        onAction={homework.refetch}
      />
    );

  return (
    <div className="portal-page">
      <div className="portal-page-heading">
        <div>
          <span className="portal-eyebrow">VAZIFALAR</span>
          <h1>{selectedChild.name}</h1>
          <p>Topshiriqlar va tekshiruv natijalari.</p>
        </div>
      </div>
      <section className="portal-card parent-homework-list">
        {(homework.data ?? []).map((item) => (
          <article key={item.id}>
            <span className="workspace-list-icon"><ListChecks size={19} /></span>
            <div>
              <strong>{item.title}</strong>
              <small>
                {item.courseTitle} ·{" "}
                {item.dueAt
                  ? formatDayTime(item.dueAt)
                  : "Muddat yo‘q"}
              </small>
            </div>
            <SubmissionPill submission={item.mySubmission} onOpen={setResultOf} />
          </article>
        ))}
        {!homework.data?.length ? (
          <div className="portal-empty">
            <ListChecks size={28} />
            <h2>Vazifa topilmadi</h2>
          </div>
        ) : null}
      </section>

      <HomeworkResultDialog
        submissionId={resultOf?.id}
        initial={resultOf}
        open={Boolean(resultOf)}
        onOpenChange={(open) => { if (!open) setResultOf(null); }}
        canDownloadFile
        title={`${selectedChild.name} — tekshiruv natijasi`}
      />
    </div>
  );
}
