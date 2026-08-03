import { format, isToday, isYesterday } from "date-fns";
import { uz } from "date-fns/locale";

export function formatConversationTime(value) {
  const date = new Date(value);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Kecha";
  return format(date, "dd MMM", { locale: uz });
}

export function formatMessageTime(value) {
  return format(new Date(value), "HH:mm");
}
