import { format, isToday, isYesterday } from "date-fns";
import { enUS, ru, uz } from "date-fns/locale";
import { i18n } from "@/shared/i18n";

/**
 * Plain (hook bo'lmagan) yordamchi funksiyalar bo'lgani uchun joriy tilni
 * global `i18n` instansidan o'qiydi — chaqiruvchi tomonlar (13 ta fayl)
 * o'zgartirilmasin deb ataylab shunday.
 */
const DATE_FNS_LOCALES = { uz, en: enUS, ru } as const;

function currentDateFnsLocale() {
  return DATE_FNS_LOCALES[i18n.language as keyof typeof DATE_FNS_LOCALES] ?? uz;
}

export function formatConversationTime(value: string | number | Date): string {
  const date = new Date(value);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return i18n.t("common:date.yesterday");
  return format(date, "dd MMM", { locale: currentDateFnsLocale() });
}

export function formatMessageTime(value: string | number | Date): string {
  return format(new Date(value), "HH:mm");
}

/** Aniq soat:daqiqa (fokus jurnali va yozuv sanasi uchun). */
export function formatDateTime(value: string | number | Date): string {
  return format(new Date(value), "dd MMM, HH:mm", { locale: currentDateFnsLocale() });
}

/**
 * To‘liq sana va vaqt: `28-avgust, 23:30`.
 *
 * `Intl` ning `uz-UZ` ma’lumoti brauzerlarda to‘liq emas — u `2026 M08 28`
 * kabi natija beradi, shuning uchun bu yerda date-fns lokali ishlatiladi.
 * Yil faqat joriy yildan farq qilsa ko‘rsatiladi: odatda u ortiqcha shovqin,
 * uzoq sanada esa zarur.
 *
 * Hozircha faqat o‘quvchining vazifalar ro‘yxatida — qolgan ekranlar ataylab
 * eski ko‘rinishda qoldirilgan.
 */
export function formatDayTime(value: string | number | Date): string {
  const date = new Date(value);
  const pattern =
    date.getFullYear() === new Date().getFullYear() ? "d-MMMM, HH:mm" : "d-MMMM yyyy, HH:mm";
  // Oy nomi gap o‘rtasida kichik harf bilan yoziladi.
  return format(date, pattern, { locale: currentDateFnsLocale() }).toLowerCase();
}

/**
 * Soniyani qisqa davomiylikka aylantiradi: `45s`, `2m 05s`, `1s 12m`.
 * Fokus jurnali ham, video yozuv uzunligi ham shu formatdan foydalanadi.
 *
 * Birlik harflari tilga qarab tarjima qilinadi (`common:date.*Unit`)
 * — o'zbekchada "soat" va "soniya" ikkalasi ham tarixiy sabablarga ko'ra
 * "s" bilan belgilanadi (mavjud xulq o'zgarishsiz qoldirilgan), ingliz va
 * rus tillarida esa chalkashmasligi uchun alohida harflar ishlatiladi.
 */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;

  const h = i18n.t("common:date.hourUnit");
  const m = i18n.t("common:date.minuteUnit");
  const s = i18n.t("common:date.secondUnit");

  if (hours) return `${hours}${h} ${String(minutes).padStart(2, "0")}${m}`;
  if (minutes) return `${minutes}${m} ${String(rest).padStart(2, "0")}${s}`;
  return `${rest}${s}`;
}
