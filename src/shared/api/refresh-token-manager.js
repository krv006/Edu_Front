import { tokenStorage } from "./token-storage";

export class RefreshTokenManager {
  constructor() {
    this.refreshHandler = null;
    this.refreshPromise = null;
  }

  configure(refreshHandler) {
    this.refreshHandler = refreshHandler;
  }

  async refresh() {
    if (!this.refreshHandler) return false;
    if (!this.refreshPromise) {
      this.refreshPromise = Promise.resolve(this.refreshHandler())
        .then(() => true)
        .catch(() => {
          tokenStorage.clearTokens();
          if (typeof CustomEvent !== "undefined") {
            globalThis.dispatchEvent?.(new CustomEvent("fokus:session-expired"));
          }
          return false;
        })
        .finally(() => { this.refreshPromise = null; });
    }
    return this.refreshPromise;
  }
}

export const refreshTokenManager = new RefreshTokenManager();
