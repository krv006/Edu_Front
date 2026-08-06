import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { htmlToPlainText } from "@/shared/lib";
import { NotificationSocketManager } from "../lib/notification-socket-manager";
import { notificationKeys, useUnreadNotificationCount } from "./notification.queries";

/**
 * Bildirishnoma oqimi: o'qilmagan soni + real-time kanal.
 *
 * Kanal yangi xabar keltirganda toast ko'rsatiladi va inbox/badge keshi
 * bekor qilinadi — soni serverdan qayta olinadi, mahalliy hisoblash bilan
 * ajralib ketmaydi.
 *
 * `available: false` — modul bu muhitda o'rnatilmagan (404), qo'ng'iroq yashiriladi.
 */
export function useNotificationFeed(enabled = true) {
  const queryClient = useQueryClient();
  const unread = useUnreadNotificationCount(enabled);
  const available = unread.data !== null && unread.data !== undefined;

  const socket = useMemo(
    () =>
      enabled && available
        ? new NotificationSocketManager({
            onNotification: (notification) => {
              queryClient.invalidateQueries({ queryKey: notificationKeys.all });
              const preview = htmlToPlainText(notification.html, 90);
              toast.info(preview || "Yangi xabar", { description: notification.senderName });
            },
          })
        : null,
    [enabled, available, queryClient]
  );

  useEffect(() => {
    socket?.start();
    return () => socket?.stop();
  }, [socket]);

  return { available, unreadCount: unread.data ?? 0, isLoading: unread.isLoading };
}
