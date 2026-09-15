import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { mapUserDto } from "../lib/auth.mappers";

export const authKeys = Object.freeze({
  all: ["auth"] as const,
  logins: (studentId: string | null) => ["auth", "logins", studentId] as const,
  teachers: ["auth", "teachers"] as const,
  myRatings: ["auth", "ratings", "me"] as const,
  teacherRatings: (id: string) => ["auth", "ratings", id] as const,
  teacherStats: (id: string) => ["auth", "stats", id] as const,
});

export function useLoginHistory(studentId: string | null = null, enabled = true) {
  return useQuery({
    queryKey: authKeys.logins(studentId),
    queryFn: ({ signal }) => authApi.getLogins(studentId, { signal }),
    enabled,
    staleTime: 30_000,
  });
}

export function useMyRatings(enabled = true) {
  return useQuery({
    queryKey: authKeys.myRatings,
    queryFn: ({ signal }) => authApi.getMyRatings({ signal, query: { page_size: 50 } }),
    enabled,
  });
}

export function useTeacherRatings(id: string | null, enabled = true) {
  return useQuery({
    queryKey: authKeys.teacherRatings(id ?? ""),
    queryFn: ({ signal }) => authApi.getTeacherRatings(id as string, { signal, query: { page_size: 50 } }),
    enabled: Boolean(id) && enabled,
  });
}

export function useTeacherStats(id: string | null, enabled = true) {
  return useQuery({
    queryKey: authKeys.teacherStats(id ?? ""),
    queryFn: ({ signal }) => authApi.getTeacherStats(id as string, { signal }),
    enabled: Boolean(id) && enabled,
  });
}

export function useTeachers() {
  return useQuery({
    queryKey: authKeys.teachers,
    queryFn: async ({ signal }) => (await authApi.getTeachers({ signal })).map(mapUserDto),
  });
}
