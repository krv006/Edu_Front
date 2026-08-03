import { apiClient } from "@/shared/api";
import { attendanceEndpoints } from "./attendance.endpoints";
import { mapAttendanceDto, mapAttendancePage } from "../lib/attendance.mappers";
export const attendanceApi = {
  async getAll(options = {}) { return mapAttendancePage(await apiClient.get(attendanceEndpoints.list, options), options.query); },
  async getById(id, options) { return mapAttendanceDto(await apiClient.get(attendanceEndpoints.detail(id), options)); },
};
