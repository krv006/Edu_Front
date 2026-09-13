export interface NotificationHtmlProps {
  html: string;
  className?: string;
}

export function NotificationHtml({ html, className }: NotificationHtmlProps) {
  return (
    <div
      className={`notification-html ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
