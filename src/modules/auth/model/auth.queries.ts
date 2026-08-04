import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { mapUserDto } from "../lib/auth.mappers";
import { authKeys } from "./auth.keys";

export function useCurrentUserQuery({ enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: async () => mapUserDto(await authApi.getCurrentUser()),
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}
