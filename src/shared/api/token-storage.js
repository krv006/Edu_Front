import { STORAGE_KEYS } from "@/shared/constants";

function storages() {
  if (typeof window === "undefined") return [];
  return [window.sessionStorage, window.localStorage];
}

function read(key) {
  for (const target of storages()) {
    try { const value = target.getItem(key); if (value) return value; } catch { /* storage unavailable */ }
  }
  return null;
}

function removeEverywhere(key) {
  storages().forEach((target) => { try { target.removeItem(key); } catch { /* storage unavailable */ } });
}

export const tokenStorage = {
  getAccessToken: () => read(STORAGE_KEYS.ACCESS_TOKEN),
  getRefreshToken: () => read(STORAGE_KEYS.REFRESH_TOKEN),
  hasSession() { return Boolean(this.getAccessToken() || this.getRefreshToken()); },
  isPersistent() {
    if (typeof window === "undefined") return false;
    try { return Boolean(window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)); } catch { return false; }
  },
  setTokens({ accessToken, refreshToken }, { persistent = true } = {}) {
    const targets = storages();
    const target = persistent ? targets[1] : targets[0];
    this.clearTokens();
    if (!target) return;
    if (accessToken) target.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) target.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },
  clearTokens() {
    removeEverywhere(STORAGE_KEYS.ACCESS_TOKEN);
    removeEverywhere(STORAGE_KEYS.REFRESH_TOKEN);
  },
  clear() { this.clearTokens(); },
};
