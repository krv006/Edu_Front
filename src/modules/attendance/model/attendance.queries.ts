import { useQuery } from "@tanstack/react-query";
import type { QueryParams } from "@/shared/api";
import { attendanceApi } from "../api/attendance.api";

export const attendanceKeys = Object.freeze({
  all: ["attendance"] as const,
  list: (params: QueryParams = {}) => ["attendance", "list", params] as const,
  detail: (id: string) => ["attendance", "detail", id] as const,
});

export function useAttendance(params: QueryParams = {}) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: ({ signal }) => attendanceApi.getAll({ signal, query: params }),
    select: (page) => page.items,
  });
}

export function useAttendancePage(params: QueryParams = {}) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: ({ signal }) => attendanceApi.getAll({ signal, query: params }),
  });
}
