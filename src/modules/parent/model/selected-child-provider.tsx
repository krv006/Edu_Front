import { useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "@/shared/constants";
import { storage } from "@/shared/lib";
import { useParentChildren } from "./parent.queries";
import { SelectedChildContext, type SelectedChildContextValue } from "./selected-child-store";

export function SelectedChildProvider({ children }: { children: ReactNode }) {
  const childrenQuery = useParentChildren();
  const [storedId, setStoredId] = useState<string | null>(() =>
    storage.get(STORAGE_KEYS.PARENT_SELECTED_CHILD)
  );

  const items = childrenQuery.data ?? [];
  // Saqlangan ID endi mavjud bo'lmasa, birinchi farzandga qaytamiz.
  const selectedChildId = items.some((item) => item.id === storedId)
    ? storedId
    : (items[0]?.id ?? null);
  const selectedChild = items.find((item) => item.id === selectedChildId) ?? null;

  const value: SelectedChildContextValue = {
    children: items,
    childrenQuery,
    selectedChild,
    selectedChildId,
    selectChild(id: string) {
      storage.set(STORAGE_KEYS.PARENT_SELECTED_CHILD, id);
      setStoredId(id);
    },
  };

  return <SelectedChildContext.Provider value={value}>{children}</SelectedChildContext.Provider>;
}
