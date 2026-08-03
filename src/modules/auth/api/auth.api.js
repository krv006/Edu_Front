import { apiClient } from "@/shared/api";
import { authEndpoints } from "./auth.endpoints";

export const authApi = {
  login(dto) {
    return apiClient.post(authEndpoints.login, dto, {
      skipAuth: true,
      skipRefresh: true,
    });
  },
  refresh(dto) {
    return apiClient.post(authEndpoints.refresh, dto, {
      skipAuth: true,
      skipRefresh: true,
    });
  },
  getCurrentUser() {
    return apiClient.get(authEndpoints.me);
  },
  updateCurrentUser(dto) {
    return apiClient.patch(authEndpoints.me, dto);
  },
};
