import { apiClient, selectApiTransport } from "@/shared/api";
import { studentDashboardSeed } from "./adapters/student.mock-data";

const mock = { async getDashboard() { await new Promise((resolve) => globalThis.setTimeout(resolve, 180)); return structuredClone(studentDashboardSeed); } };
const remote = { async getDashboard(options) { const result = await apiClient.get("/student/dashboard", options); return result.data ?? result; } };
export const studentApi = selectApiTransport({ mock, remote });
