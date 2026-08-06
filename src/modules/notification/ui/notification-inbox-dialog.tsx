import { BellOff, Check, Megaphone, UserRound } from "lucide-react";
import { formatDateTime } from "@/shared/lib";
import { Button, Dialog, DialogContent, LoadingFallback, RouteState } from "@/shared/ui/legacy";
import {
  useMarkNotificationRead,
  useNotificationInbox,
} from "../model/notification.queries";
import { NotificationHtml } from "./notification-html";

export interface NotificationInboxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Foydalanuvchining bildirishnomalar qutisi (docs/COMPLETED_WORK.md §2). */
export function NotificationInboxDialog({ open, onOpenChange }: NotificationInboxDialogProps) {
  const inbox = useNotificationInbox({ page_size: 30 }, open);
  const markRead = useMarkNotificationRead();
  const items = inbox.data?.items ?? [];
  const unread = items.filter((item) => !item.isRead);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent
          className="notification-dialog"
          title="Bildirishnomalar"
          description={
            unread.length ? `${unread.length} ta o‘qilmagan xabar` : "Barcha xabarlar o‘qilgan."
          }
        >
          {inbox.isLoading ? <LoadingFallback label="Xabarlar yuklanmoqda" /> : null}

          {inbox.isError ? (
            <RouteState
              title="Xabarlarni yuklab bo‘lmadi"
              actionLabel="Qayta urinish"
              onAction={inbox.refetch}
            />
          ) : null}

          {inbox.isSuccess && !items.length ? (
            <div className="notification-empty">
              <BellOff size={26} />
              <p>Hozircha xabar yo‘q.</p>
            </div>
          ) : null}

          {items.length ? (
            <ul className="notification-list">
              {items.map((item) => (
                <li key={item.id} className={item.isRead ? "" : "is-unread"}>
                  <span className="notification-icon">
                    {item.targetType === "all" ? <Megaphone size={16} /> : <UserRound size={16} />}
                  </span>

                  <div className="notification-body">
                    <span className="notification-meta">
                      <strong>{item.sender?.name ?? "Tizim"}</strong>
                      <small>{item.createdAt ? formatDateTime(item.createdAt) : ""}</small>
                    </span>
                    <NotificationHtml html={item.html} />
                  </div>

                  {item.isRead ? (
                    <span className="notification-read" title="O‘qilgan">
                      <Check size={15} />
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={markRead.isPending && markRead.variables === item.id}
                      onClick={() => markRead.mutate(item.id)}
                    >
                      O‘qidim
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
