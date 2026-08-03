import { apiClient, selectApiTransport, tokenStorage } from "@/shared/api";
import { STORAGE_KEYS } from "@/shared/constants";
import { storage } from "@/shared/lib";
import { mockLogin } from "./adapters/auth.mock";

function persistSession(user, remember = true) {
  if (remember) storage.setJson(STORAGE_KEYS.AUTH_SESSION, user);
  else storage.remove(STORAGE_KEYS.AUTH_SESSION);
}

const mockAuthApi = {
  async login(credentials) {
    const user = await mockLogin(credentials);
    persistSession(user, credentials.remember !== false);
    storage.remove(STORAGE_KEYS.TEACHER_SESSION);
    return user;
  },
  async logout() {
    await new Promise((resolve) => globalThis.setTimeout(resolve, 160));
    storage.remove(STORAGE_KEYS.AUTH_SESSION);
    storage.remove(STORAGE_KEYS.TEACHER_SESSION);
    tokenStorage.clear();
  },
  getCurrentUser() {
    return storage.getJson(STORAGE_KEYS.AUTH_SESSION) ?? storage.getJson(STORAGE_KEYS.TEACHER_SESSION);
  },
  async refreshSession() { return this.getCurrentUser(); },
};

const remoteAuthApi = {
  async login(credentials) {
    const result = await apiClient.post("/auth/login", credentials, { skipAuth: true });
    const payload = result.data ?? result;
    tokenStorage.setTokens(payload.tokens ?? payload);
    persistSession(payload.user, credentials.remember !== false);
    return payload.user;
  },
  async logout() {
    try { await apiClient.post("/auth/logout"); }
    finally { storage.remove(STORAGE_KEYS.AUTH_SESSION); tokenStorage.clear(); }
  },
  getCurrentUser() { return storage.getJson(STORAGE_KEYS.AUTH_SESSION); },
  async refreshSession() {
    const result = await apiClient.get("/auth/me");
    const user = result.data ?? result;
    persistSession(user);
    return user;
  },
};

export const authApi = selectApiTransport({ mock: mockAuthApi, remote: remoteAuthApi });
