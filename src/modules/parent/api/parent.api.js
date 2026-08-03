import { apiClient, selectApiTransport } from "@/shared/api";
import { parentChildrenSeed, parentDashboardSeed } from "./adapters/parent.mock-data";

const wait = () => new Promise((resolve) => globalThis.setTimeout(resolve, 180));
const mock = {
  async getDashboard() { await wait(); return structuredClone(parentDashboardSeed); },
  async getChildren() { await wait(); return structuredClone(parentChildrenSeed); },
};
const remote = {
  async getDashboard(options) { const result = await apiClient.get("/parent/dashboard", options); return result.data ?? result; },
  async getChildren(options) { const result = await apiClient.get("/parent/children", options); return result.data ?? result; },
};
export const parentApi = selectApiTransport({ mock, remote });
