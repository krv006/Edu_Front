import { useState } from "react";
import { formatDayTime } from "@/shared/lib";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Paperclip,
  RefreshCw,
  Users,
} from "lucide-react";
import { Avatar, Button, Dialog, DialogContent, RouteState } from "@/shared/ui/legacy";
import {
  useAssignment,
  useDownloadAssignmentFile,
  useDownloadSubmissionFile,
  useRecheckSubmission,
} from "../model/homework.queries";
import { HomeworkResultDialog } from "./homework-result-dialog";
import type { Submission } from "@/shared/types";

export interface AssignmentDetailDialogProps {
  assignmentId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<string, string> = {
  checking: "Tekshirilmoqda",
  done: "Tekshirildi",
  error: "Xatolik",
};

function SubmissionRow({ submission, onOpenResult }: { submission: Submission; onOpenResult: (submission: Submission) => void }) {
  const download = useDownloadSubmissionFile();
  const recheck = useRecheckSubmission();
  const statusClass =
    submission.status === "done"
      ? ""
      : submission.status === "error"
      ? " grade-pill--error"
      : " grade-pill--checking";

  return (
    <article className="submission-row">
      <Avatar name={submission.studentName || "O‘quvchi"} size="sm" />
      <div className="submission-row-main">
        <strong>{submission.studentName || "O‘quvchi"}</strong>
        <small>
          <FileText size={12} /> {submission.fileName || "fayl"}
          {submission.isLate ? <em className="is-late"> · kech</em> : null}
        </small>
      </div>
      <span className={`grade-pill${statusClass}`}>
        {submission.status === "done" ? (
          <>
            <CheckCircle2 size={14} /> {submission.overallScore ?? "—"} ball
          </>
        ) : (
          <>
            <Clock3 size={13} /> {statusLabels[submission.status] ?? submission.status}
          </>
        )}
      </span>
      <div className="submission-row-actions">
        <button
          className="icon-button"
          aria-label="Topshirilgan faylni yuklab olish"
          disabled={download.isPending}
          onClick={() =>
            download.mutate({ id: submission.id, fileName: submission.fileName })
          }
        >
          <Download size={16} />
        </button>
        <button
          className="icon-button"
          aria-label="Qayta tekshirish"
          disabled={recheck.isPending || submission.status === "checking"}
          onClick={() => recheck.mutate(submission.id)}
        >
          <RefreshCw size={16} />
        </button>
        <Button size="sm" variant="secondary" onClick={() => onOpenResult(submission)}>
          Natija
        </Button>
      </div>
    </article>
  );
}

export function AssignmentDetailDialog({ assignmentId, open, onOpenChange }: AssignmentDetailDialogProps) {
  const assignment = useAssignment(open ? assignmentId : null);
  const downloadAttachment = useDownloadAssignmentFile();
  const [resultOf, setResultOf] = useState<Submission | null>(null);
  const data = assignment.data;
  const submissions = data?.submissions ?? [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {open ? (
          <DialogContent
            className="assignment-detail-dialog"
            title={data?.title || "Vazifa"}
            description={
              data
                ? `${data.courseTitle ?? ""}${
                    data.dueAt
                      ? ` · Muddat: ${formatDayTime(data.dueAt)}`
                      : " · Muddat belgilanmagan"
                  }`
                : "Yuklanmoqda…"
            }
          >
            {assignment.isError ? (
              <RouteState
                title="Vazifani yuklab bo‘lmadi"
                description={assignment.error?.message}
                actionLabel="Qayta urinish"
                onAction={assignment.refetch}
              />
            ) : assignment.isLoading || !data ? (
              <div className="student-tab-loading">
                <span />
              </div>
            ) : (
              <div className="assignment-detail">
                {data.description || data.body ? (
                  <p className="assignment-detail-body">
                    {data.description || data.body}
                  </p>
                ) : null}

                {data.hasAttachment ? (
                  <Button
                    variant="secondary"
                    loading={downloadAttachment.isPending}
                    onClick={() =>
                      downloadAttachment.mutate({
                        id: data.id,
                        fileName: data.attachmentName || `${data.title}.pdf`,
                      })
                    }
                  >
                    <Paperclip size={16} />{" "}
                    {data.attachmentName || "Biriktirilgan faylni yuklab olish"}
                  </Button>
                ) : null}

                {data.stats ? (
                  <div className="assignment-stat-grid">
                    <span>
                      <Users size={16} />
                      <strong>{data.stats.studentsCount ?? 0}</strong>
                      <small>o‘quvchi</small>
                    </span>
                    <span>
                      <CheckCircle2 size={16} />
                      <strong>{data.stats.submittedCount ?? 0}</strong>
                      <small>topshirdi</small>
                    </span>
                    <span>
                      <BarChart3 size={16} />
                      <strong>
                        {data.stats.averageScore ?? "—"}
                      </strong>
                      <small>o‘rtacha ball</small>
                    </span>
                  </div>
                ) : null}

                <span className="dialog-section-label">
                  TOPSHIRIQLAR ({submissions.length})
                </span>
                <div className="submission-list">
                  {submissions.map((submission) => (
                    <SubmissionRow
                      key={submission.id}
                      submission={submission}
                      onOpenResult={setResultOf}
                    />
                  ))}
                  {!submissions.length ? (
                    <p className="portal-muted">Hali hech kim topshirmagan.</p>
                  ) : null}
                </div>
              </div>
            )}
          </DialogContent>
        ) : null}
      </Dialog>

      <HomeworkResultDialog
        submissionId={resultOf?.id}
        initial={resultOf}
        open={Boolean(resultOf)}
        onOpenChange={(value) => {
          if (!value) setResultOf(null);
        }}
        canRecheck
        canDownloadFile
        canReview
      />
    </>
  );
}
