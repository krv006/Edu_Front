import { useState } from "react";
import { useParentChildren } from "./parent.queries";
import { SelectedChildContext } from "./selected-child-store";

const STORAGE_KEY = "fokus_parent_selected_child";
export function SelectedChildProvider({ children }) {
  const childrenQuery = useParentChildren(); const [storedId, setStoredId] = useState(() => window.localStorage.getItem(STORAGE_KEY));
  const items = childrenQuery.data ?? []; const selectedChildId = items.some((item) => item.id === storedId) ? storedId : items[0]?.id ?? null; const selectedChild = items.find((item) => item.id === selectedChildId) ?? null;
  const value = { children: items, childrenQuery, selectedChild, selectedChildId, selectChild(id) { window.localStorage.setItem(STORAGE_KEY, id); setStoredId(id); } };
  return <SelectedChildContext.Provider value={value}>{children}</SelectedChildContext.Provider>;
}
