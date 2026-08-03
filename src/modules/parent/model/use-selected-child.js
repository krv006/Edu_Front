import { useContext } from "react";
import { SelectedChildContext } from "./selected-child-store";
export function useSelectedChild() { const context = useContext(SelectedChildContext); if (!context) throw new Error("useSelectedChild SelectedChildProvider ichida ishlatilishi kerak"); return context; }
