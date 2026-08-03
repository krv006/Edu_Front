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
  register(dto) { return apiClient.post(authEndpoints.register, dto, { skipAuth: true, skipRefresh: true }); },
  createChild(dto) { return apiClient.post(authEndpoints.children, dto); },
  getLinks(options) { return apiClient.get(authEndpoints.links, options); },
  requestLink(inviteCode) { return apiClient.post(authEndpoints.requestLink, { invite_code: inviteCode }); },
  respondLink(id, action) { return apiClient.post(authEndpoints.respondLink(id), { action }); },
  getConsents(options) { return apiClient.get(authEndpoints.consents, options); },
  setConsent(dto) { return apiClient.post(authEndpoints.consents, dto); },
};
