import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/shared/constants";

export const SUPPORTED_LANGUAGES = ["uz", "en", "ru"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = "uz";

interface LanguageState {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

/**
 * Faqat holatni saqlaydi — i18next bilan bog'lash `shared/i18n/i18n.ts`da,
 * u shu do'konga OBUNA BO'LADI (aylanma bog'liqlikning oldini olish uchun
 * yo'nalish shu tomonga: i18n → store, hech qachon aksincha emas).
 */
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => set({ language }),
    }),
    { name: STORAGE_KEYS.LANGUAGE }
  )
);

/** API so'rovlariga `Accept-Language` qo'shish uchun — React'siz, to'g'ridan-to'g'ri o'qish. */
export function getStoredLanguage(): AppLanguage {
  return useLanguageStore.getState().language;
}
