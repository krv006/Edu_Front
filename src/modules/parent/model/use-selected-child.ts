import { useContext } from "react";
import { SelectedChildContext, type SelectedChildContextValue } from "./selected-child-store";

export function useSelectedChild(): SelectedChildContextValue {
  const context = useContext(SelectedChildContext);
  if (!context) throw new Error("useSelectedChild SelectedChildProvider ichida ishlatilishi kerak");
  return context;
}
