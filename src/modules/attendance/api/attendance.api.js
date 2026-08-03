import { apiClient, selectApiTransport } from "@/shared/api";
import { attendanceSeed } from "./adapters/attendance.mock-data";

const mock = { async getAll() { await new Promise((resolve) => globalThis.setTimeout(resolve, 180)); return structuredClone(attendanceSeed); } };
const remote = { async getAll(options) { const result = await apiClient.get("/attendance", options); return result.data ?? result; } };
export const attendanceApi = selectApiTransport({ mock, remote });
