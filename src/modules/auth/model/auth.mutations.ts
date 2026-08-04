import { useMutation } from "@tanstack/react-query";
import type { AuthUser } from "@/shared/types";
import { authApi } from "../api/auth.api";
import type { ProfileFormValues, RegisterFormValues } from "../api/auth.dto";
import { mapUserDto } from "../lib/auth.mappers";
import { useAuthStore } from "./auth.store";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (values: RegisterFormValues) =>
      authApi.register({
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
  return useMutation({
    mutationFn: async (values: ProfileFormValues): Promise<AuthUser> =>
      mapUserDto(
        await authApi.updateCurrentUser({
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          phone: values.phone?.trim() || "",
        })
      ),
    // Server javobi global auth holatiga ko'chiriladi.
    onSuccess: (user) => useAuthStore.getState().setUser(user),
  });
}
