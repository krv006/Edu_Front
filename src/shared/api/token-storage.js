import { STORAGE_KEYS } from "@/shared/constants";
import { storage } from "@/shared/lib";

export const tokenStorage = {
  getAccessToken: () => storage.get(STORAGE_KEYS.ACCESS_TOKEN),
  getRefreshToken: () => storage.get(STORAGE_KEYS.REFRESH_TOKEN),
  setTokens({ accessToken, refreshToken }) {
    if (accessToken) storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },
  clear() {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  },
};
