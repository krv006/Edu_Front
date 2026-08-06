import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotificationFeed } from "../model/use-notification-feed";
import { NotificationInboxDialog } from "./notification-inbox-dialog";

export interface NotificationBellProps {
  /** Auth bo'lmaganda so'rov yubormaymiz. */
  enabled?: boolean;
}

/**
 * Sarlavhadagi qo'ng'iroq va o'qilmagan xabarlar badge'i.
 *
 * Backendda bildirishnoma moduli bo'lmasa (`available: false`) — hech narsa
 * ko'rsatilmaydi; foydalanuvchi buzuq tugmani ko'rmaydi.
 */
export function NotificationBell({ enabled = true }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const { available, unreadCount } = useNotificationFeed(enabled);

  if (!available) return null;

  return (
    <>
      <button
        type="button"
        className="notification-bell"
        aria-label={unreadCount ? `Bildirishnomalar (${unreadCount} yangi)` : "Bildirishnomalar"}
        onClick={() => setOpen(true)}
      >
        <Bell size={18} />
        {unreadCount > 0 ? (
          <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        ) : null}
      </button>

      <NotificationInboxDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
