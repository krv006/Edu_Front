import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { DashboardPeriod } from "@/shared/types";
import { analyticsApi } from "../api/analytics.api";

export const analyticsKeys = Object.freeze({
  all: ["analytics"] as const,
  summary: ["analytics", "summary"] as const,
  trends: (period: DashboardPeriod) => ["analytics", "trends", period] as const,
});

export function useDashboardSummary(enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.summary,
    queryFn: ({ signal }) => analyticsApi.getDashboardSummary({ signal }),
    enabled,
  });
}

export function useDashboardTrends(period: DashboardPeriod, enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.trends(period),
    queryFn: ({ signal }) => analyticsApi.getDashboardTrends(period, { signal }),
    enabled,
    placeholderData: keepPreviousData,
  });
}
