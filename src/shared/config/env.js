import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().trim().url("VITE_API_URL to‘g‘ri URL bo‘lishi kerak").or(z.literal("")).default(""),
  VITE_ENABLE_MOCKS: z.enum(["true", "false"]).default("true"),
  VITE_APP_NAME: z.string().trim().min(1).default("Fokus"),
  VITE_APP_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Environment konfiguratsiyasi noto‘g‘ri: ${details}`);
}

export const env = Object.freeze({
  apiUrl: parsedEnv.data.VITE_API_URL.replace(/\/$/, ""),
  enableMocks: parsedEnv.data.VITE_ENABLE_MOCKS === "true",
  appName: parsedEnv.data.VITE_APP_NAME,
  appEnv: parsedEnv.data.VITE_APP_ENV,
  isProduction: parsedEnv.data.VITE_APP_ENV === "production",
});
