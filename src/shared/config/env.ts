import { z } from "zod";

const envSchema = z.object({
  VITE_APP_NAME: z.string().trim().min(1).default("Fokus"),
  VITE_APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  VITE_API_URL: z
    .string()
    .trim()
    .refine((value) => value === "/" || URL.canParse(value), "VITE_API_URL to‘g‘ri URL yoki / bo‘lishi kerak"),
  VITE_WS_URL: z
    .string()
    .trim()
    .url("VITE_WS_URL to‘g‘ri WebSocket URL bo‘lishi kerak")
    .refine(
      (value) => value.startsWith("ws://") || value.startsWith("wss://"),
      "VITE_WS_URL ws:// yoki wss:// bilan boshlanishi kerak"
    ),
  VITE_ENABLE_MOCKS: z.enum(["true", "false"]).default("false"),
  VITE_REQUEST_TIMEOUT: z.coerce.number().int().min(1_000).max(120_000).default(15_000),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Environment konfiguratsiyasi noto‘g‘ri: ${details}`);
}

/** `/` — nisbiy so‘rovlar (vite proxy / vercel rewrite orqali). */
function normalizeBaseUrl(value: string): string {
  if (value === "/") return "";
  return value.replace(/\/+$/, "");
}

if (parsedEnv.data.VITE_APP_ENV === "production" && parsedEnv.data.VITE_ENABLE_MOCKS === "true") {
  throw new Error("Production muhitida mocklarni yoqish mumkin emas");
}

export interface AppEnv {
  readonly appName: string;
  readonly appEnv: "development" | "test" | "production";
  readonly apiUrl: string;
  readonly wsUrl: string;
  readonly enableMocks: boolean;
  readonly requestTimeout: number;
  readonly isProduction: boolean;
}

export const env: AppEnv = Object.freeze({
  appName: parsedEnv.data.VITE_APP_NAME,
  appEnv: parsedEnv.data.VITE_APP_ENV,
  apiUrl: normalizeBaseUrl(parsedEnv.data.VITE_API_URL),
  wsUrl: normalizeBaseUrl(parsedEnv.data.VITE_WS_URL),
  enableMocks: parsedEnv.data.VITE_ENABLE_MOCKS === "true",
  requestTimeout: parsedEnv.data.VITE_REQUEST_TIMEOUT,
  isProduction: parsedEnv.data.VITE_APP_ENV === "production",
});
