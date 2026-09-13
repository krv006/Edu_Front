import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/shared/lib";
import { Avatar, Dialog, DialogContent, LoadingFallback, RouteState } from "@/shared/ui/legacy";
import { useMyRatings, useTeacherRatings } from "../model/auth.queries";

export interface TeacherRatingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId?: string | null;
}

export function TeacherRatingsDialog({ open, onOpenChange, teacherId = null }: TeacherRatingsDialogProps) {
  const { t } = useTranslation("account");
  const mine = useMyRatings(open && !teacherId);
  const theirs = useTeacherRatings(teacherId, open);
  const query = teacherId ? theirs : mine;
  const items = query.data?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent
          className="ratings-dialog"
          title={t("ratingsDialog.title")}
          description={t("ratingsDialog.description")}
        >
          {query.isLoading ? <LoadingFallback label={t("ratingsDialog.loading")} /> : null}

          {query.isError ? (
            <RouteState
              title={t("ratingsDialog.loadError")}
              actionLabel={t("ratingsDialog.retry")}
              onAction={query.refetch}
            />
          ) : null}

          {query.isSuccess && !items.length ? (
            <p className="portal-muted">{t("ratingsDialog.empty")}</p>
          ) : null}

          {items.length ? (
            <ul className="rating-feed">
              {items.map((item) => (
                <li key={item.id}>
                  <Avatar name={item.studentName} size="sm" />
                  <div>
                    <span className="rating-feed-head">
                      <strong>{item.studentName}</strong>
                      <span className="rating-feed-stars" aria-label={t("ratingsDialog.starsAria", { count: item.stars })}>
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star key={index} size={13} className={index < item.stars ? "is-filled" : ""} />
                        ))}
                      </span>
                    </span>
                    {item.description ? <p>{item.description}</p> : null}
                    <small>{item.createdAt ? formatDateTime(item.createdAt) : ""}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
