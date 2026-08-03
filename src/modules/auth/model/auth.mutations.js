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

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (values) => authApi.register({
      username: values.username.trim(),
      password: values.password,
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      role: values.role,
      phone: values.phone?.trim() || "",
    }),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values) => mapUserDto(await authApi.updateCurrentUser({ first_name: values.firstName.trim(), last_name: values.lastName.trim(), phone: values.phone?.trim() || "" })),
    onSuccess: (user) => queryClient.setQueryData(authKeys.currentUser, user),
  });
}
