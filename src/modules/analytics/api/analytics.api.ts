import { apiClient, type RequestOptions } from "@/shared/api";
import type { DashboardPeriod } from "@/shared/types";
import { analyticsEndpoints } from "./analytics.endpoints";
import type { DashboardSummaryDto, DashboardTrendsDto } from "./analytics.dto";
import { mapDashboardSummaryDto, mapDashboardTrendsDto } from "../lib/analytics.mappers";

export const analyticsApi = {
  async getDashboardSummary(options?: RequestOptions) {
    return mapDashboardSummaryDto(
      await apiClient.get<DashboardSummaryDto>(analyticsEndpoints.summary, options)
    );
  },
  async getDashboardTrends(period: DashboardPeriod, options: RequestOptions = {}) {
    return mapDashboardTrendsDto(
      await apiClient.get<DashboardTrendsDto>(analyticsEndpoints.trends, { ...options, query: { period } })
    );
  },
};
