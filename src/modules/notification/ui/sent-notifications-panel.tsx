import { useState } from "react";
import { Check, Clock3, Megaphone, Plus, UserRound } from "lucide-react";
import { formatDateTime } from "@/shared/lib";
import { Button, Dialog, DialogContent, LoadingFallback } from "@/shared/ui/legacy";
import {
  useNotificationRecipients,
  useSentNotifications,
} from "../model/notification.queries";
import { NotificationHtml } from "./notification-html";
import { SendNotificationDialog } from "./send-notification-dialog";

/**
 * Admin paneli: yuborilgan xabarlar va ularning o'qilish statistikasi
 * (docs/COMPLETED_WORK.md §2). Qatorni bosganda kim o'qigani ochiladi.
 */
export function SentNotificationsPanel() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const sent = useSentNotifications({ page_size: 30 });
  const recipients = useNotificationRecipients(detailId);
  const items = sent.data?.items ?? [];

  // Modul o'rnatilmagan muhitda (404) panelni umuman ko'rsatmaymiz.
  if (sent.isError) return null;

  return (
    <section className="portal-panel">
      <div className="portal-section-heading">
        <div>
          <span className="portal-eyebrow">BILDIRISHNOMALAR</span>
          <h2>Yuborilgan xabarlar</h2>
        </div>
        <Button onClick={() => setComposeOpen(true)}>
          <Plus size={17} /> Yangi xabar
        </Button>
      </div>

      {sent.isLoading ? <LoadingFallback label="Xabarlar yuklanmoqda" /> : null}

      {sent.isSuccess && !items.length ? (
        <p className="portal-muted">Hali xabar yuborilmagan.</p>
      ) : null}

      {items.length ? (
        <div className="sent-notification-list">
          {items.map((item) => {
            const rate = item.totalCount
              ? Math.round((item.readCount / item.totalCount) * 100)
              : 0;
            return (
              <button key={item.id} type="button" onClick={() => setDetailId(item.id)}>
                <span className="sent-notification-icon">
                  {item.targetType === "all" ? <Megaphone size={16} /> : <UserRound size={16} />}
                </span>
                <span className="sent-notification-body">
                  <NotificationHtml html={item.html} className="is-preview" />
                  <small>
                    <Clock3 size={12} /> {item.createdAt ? formatDateTime(item.createdAt) : "—"}
                  </small>
                </span>
                <span className="sent-notification-stat">
                  <strong>
                    {item.readCount}/{item.totalCount}
                  </strong>
                  <i>{rate}% o‘qigan</i>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <SendNotificationDialog open={composeOpen} onOpenChange={setComposeOpen} />

      <Dialog open={Boolean(detailId)} onOpenChange={(open) => !open && setDetailId(null)}>
        {detailId ? (
          <DialogContent title="Kim o‘qidi" description="Xabar yuborilgan foydalanuvchilar ro‘yxati.">
            {recipients.isLoading ? <LoadingFallback label="Yuklanmoqda" /> : null}
            {recipients.data?.length ? (
              <ul className="notification-recipients">
                {recipients.data.map((row) => (
                  <li key={row.id} className={row.readAt ? "is-read" : ""}>
                    <span>
                      <strong>{row.name}</strong>
                      <small>@{row.username}</small>
                    </span>
                    {row.readAt ? (
                      <em>
                        <Check size={13} /> {formatDateTime(row.readAt)}
                      </em>
                    ) : (
                      <em className="is-pending">O‘qimagan</em>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
            {recipients.isSuccess && !recipients.data.length ? (
              <p className="portal-muted">Qabul qiluvchi topilmadi.</p>
            ) : null}
          </DialogContent>
        ) : null}
      </Dialog>
    </section>
  );
}
