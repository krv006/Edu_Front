import { env } from "@/shared/config";

export const apiConfig = Object.freeze({
  baseUrl: env.apiUrl,
  useMocks: env.enableMocks,
  timeoutMs: env.requestTimeout,
  defaultHeaders: Object.freeze({ Accept: "application/json" }),
});
