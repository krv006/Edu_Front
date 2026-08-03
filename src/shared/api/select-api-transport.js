import { apiConfig } from "./api-config";

export function selectApiTransport({ mock, remote }) {
  if (apiConfig.useMocks) return mock;
  if (!apiConfig.baseUrl) {
    throw new Error("Real API transport uchun VITE_API_URL sozlanishi kerak");
  }
  return remote;
}
