export interface NotificationHtmlProps {
  /** Mapper'da `sanitizeHtml()` dan o'tgan HTML. */
  html: string;
  className?: string;
}

/**
 * Bildirishnoma matni.
 *
 * HTML ikki bosqichda tozalangan: backendda `nh3`, mijozda `sanitizeHtml()`
 * (`lib/notification.mappers.ts`). Bu yerga faqat tozalangan qiymat keladi —
 * shuning uchun `dangerouslySetInnerHTML` xavfsiz.
 */
export function NotificationHtml({ html, className }: NotificationHtmlProps) {
  return (
    <div
      className={`notification-html ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
