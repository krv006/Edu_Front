import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tokenStorage } from "@/shared/api";
import { authApi } from "../api/auth.api";
import { mapLoginRequest, mapTokenPairDto, mapUserDto } from "../lib/auth.mappers";
import { authKeys } from "./auth.keys";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values) => {
      try {
        const tokens = mapTokenPairDto(await authApi.login(mapLoginRequest(values)));
        tokenStorage.setTokens(tokens, { persistent: values.remember !== false });
        return mapUserDto(await authApi.getCurrentUser());
      } catch (error) {
        tokenStorage.clearTokens();
        throw error;
      }
    },
    onSuccess(user) {
      queryClient.setQueryData(authKeys.currentUser, user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => tokenStorage.clearTokens(),
    onSuccess() { queryClient.clear(); },
  });
}
