import { env } from "@/shared/config";

export function normalizeMediaUrl(value) {
  if (!value) return null;
  if (/^(https?:|blob:|data:)/i.test(value)) return value;
  const base = env.apiUrl || globalThis.location?.origin || "";
  return `${base}${value.startsWith("/") ? value : `/${value}`}`;
}
