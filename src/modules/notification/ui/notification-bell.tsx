import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotificationFeed } from "../model/use-notification-feed";
import type { NotificationLink } from "../api/notification.dto";
import { NotificationInboxDialog } from "./notification-inbox-dialog";

export interface NotificationBellProps {
  enabled?: boolean;
  onOpenLink?: (link: NotificationLink) => void;
}

export function NotificationBell({ enabled = true, onOpenLink }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const { available, unreadCount } = useNotificationFeed(enabled, onOpenLink);

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

      <NotificationInboxDialog open={open} onOpenChange={setOpen} onOpenLink={onOpenLink} />
    </>
  );
}
