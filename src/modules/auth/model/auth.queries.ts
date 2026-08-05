import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";

export const authKeys = Object.freeze({
  all: ["auth"] as const,
  logins: (studentId: string | null) => ["auth", "logins", studentId] as const,
});

/**
 * Kirishlar tarixi. `studentId` — ota-ona bolasining tarixini ko'rmoqchi bo'lganda.
 * Dialog yopiq turganda so'rov yuborilmasligi uchun `enabled` bilan boshqariladi.
 */
export function useLoginHistory(studentId: string | null = null, enabled = true) {
  return useQuery({
    queryKey: authKeys.logins(studentId),
    queryFn: ({ signal }) => authApi.getLogins(studentId, { signal }),
    enabled,
    staleTime: 30_000,
  });
}
