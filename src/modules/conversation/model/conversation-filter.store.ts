import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/shared/constants";

export type ConversationFilter = "all" | "direct" | "group" | "unread";

interface ConversationFilterState {
  filter: ConversationFilter;
  setFilter: (filter: ConversationFilter) => void;
}

/**
 * Suhbatlar ro'yxatidagi bo'lim tanlovi (Barchasi / Shaxsiy / Guruhlar / O'qilmagan).
 *
 * Ataylab komponentdan TASHQARIDA saqlanadi: suhbat ochilganda sahifa bo'lagi
 * lazy yuklanadi va shu payt butun daraxt `Suspense` fallback'iga almashadi —
 * panel qayta mount bo'lib, `useState` dagi tanlov yo'qolardi ("Shaxsiy"dan
 * chat tanlansa "Barchasi"ga qaytib ketardi).
 *
 * Saqlanishi qo'shimcha foyda ham beradi: sahifa yangilangandan keyin ham
 * foydalanuvchi o'sha bo'limda qoladi.
 */
export const useConversationFilterStore = create<ConversationFilterState>()(
  persist(
    (set) => ({
      filter: "all",
      setFilter: (filter) => set({ filter }),
    }),
    { name: STORAGE_KEYS.CONVERSATION_FILTER }
  )
);

export function useConversationFilter() {
  const filter = useConversationFilterStore((state) => state.filter);
  const setFilter = useConversationFilterStore((state) => state.setFilter);
  return { filter, setFilter };
}
