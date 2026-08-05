import { format, isToday, isYesterday } from "date-fns";
import { uz } from "date-fns/locale";

export function formatConversationTime(value: string | number | Date): string {
  const date = new Date(value);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Kecha";
  return format(date, "dd MMM", { locale: uz });
}

export function formatMessageTime(value: string | number | Date): string {
  return format(new Date(value), "HH:mm");
}

/** Aniq soat:daqiqa (fokus jurnali va yozuv sanasi uchun). */
export function formatDateTime(value: string | number | Date): string {
  return format(new Date(value), "dd MMM, HH:mm", { locale: uz });
}

/**
 * Soniyani o'zbekcha qisqa davomiylikka aylantiradi: `45s`, `2m 05s`, `1s 12m`.
 * Fokus jurnali ham, video yozuv uzunligi ham shu formatdan foydalanadi.
 */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;

  if (hours) return `${hours}s ${String(minutes).padStart(2, "0")}m`;
  if (minutes) return `${minutes}m ${String(rest).padStart(2, "0")}s`;
  return `${rest}s`;
}
