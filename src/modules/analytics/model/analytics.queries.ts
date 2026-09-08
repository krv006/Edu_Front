import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { DashboardPeriod } from "@/shared/types";
import { analyticsApi } from "../api/analytics.api";

export const analyticsKeys = Object.freeze({
  all: ["analytics"] as const,
  summary: ["analytics", "summary"] as const,
  trends: (period: DashboardPeriod) => ["analytics", "trends", period] as const,
});

/** Admin/super_admin uchun — `RequirePerm('audit.view')` boshqa rollarga 403 beradi. */
export function useDashboardSummary(enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.summary,
    queryFn: ({ signal }) => analyticsApi.getDashboardSummary({ signal }),
    enabled,
  });
}

/** `placeholderData: keepPreviousData` — davr almashtirilganda butun sahifa
 * qayta yuklanib "ko'zni chirpillatib" ketmaydi, eski grafik joyida turadi. */
export function useDashboardTrends(period: DashboardPeriod, enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.trends(period),
    queryFn: ({ signal }) => analyticsApi.getDashboardTrends(period, { signal }),
    enabled,
    placeholderData: keepPreviousData,
  });
}
