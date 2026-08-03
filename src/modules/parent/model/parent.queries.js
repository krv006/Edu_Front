import { useQuery } from "@tanstack/react-query";
import { parentApi } from "../api/parent.api";

export const parentKeys = Object.freeze({ dashboard: ["parent", "dashboard"], children: ["parent", "children"] });
export function useParentDashboard() { return useQuery({ queryKey: parentKeys.dashboard, queryFn: () => parentApi.getDashboard() }); }
export function useParentChildren() { return useQuery({ queryKey: parentKeys.children, queryFn: () => parentApi.getChildren() }); }
