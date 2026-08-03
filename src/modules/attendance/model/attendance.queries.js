import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendance.api";
export const attendanceKeys = Object.freeze({ all: ["attendance"], list: (params = {}) => ["attendance", "list", params], detail: (id) => ["attendance", "detail", id] });
export function useAttendance(params = {}) { return useQuery({ queryKey: attendanceKeys.list(params), queryFn: ({ signal }) => attendanceApi.getAll({ signal, query: params }), select: (page) => page.items }); }
export function useAttendancePage(params = {}) { return useQuery({ queryKey: attendanceKeys.list(params), queryFn: ({ signal }) => attendanceApi.getAll({ signal, query: params }) }); }
