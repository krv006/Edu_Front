import { createContext } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { ParentChild } from "../api/parent.dto";

export interface SelectedChildContextValue {
  children: ParentChild[];
  childrenQuery: UseQueryResult<ParentChild[], Error>;
  selectedChild: ParentChild | null;
  selectedChildId: string | null;
  selectChild: (id: string) => void;
}

export const SelectedChildContext = createContext<SelectedChildContextValue | null>(null);
