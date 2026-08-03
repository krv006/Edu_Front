import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendance.api";

export const attendanceKeys = Object.freeze({ all: ["attendance"] });
export function useAttendance() { return useQuery({ queryKey: attendanceKeys.all, queryFn: () => attendanceApi.getAll() }); }
