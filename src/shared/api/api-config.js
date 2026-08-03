import { env } from "@/shared/config";

export const apiConfig = Object.freeze({
  baseUrl: env.apiUrl,
  useMocks: env.enableMocks,
  timeoutMs: 15_000,
  defaultHeaders: Object.freeze({ Accept: "application/json" }),
});
