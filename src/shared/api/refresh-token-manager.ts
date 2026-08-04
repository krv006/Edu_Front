import { tokenStorage } from "./token-storage";

export type RefreshHandler = () => void | Promise<void>;

/** Sessiya tugaganda yuboriladi — `AuthProvider` shu hodisani tinglaydi. */
export const SESSION_EXPIRED_EVENT = "fokus:session-expired";

export class RefreshTokenManager {
  private refreshHandler: RefreshHandler | null = null;
  /** Parallel 401 lar bitta refresh so‘roviga birlashtiriladi. */
  private refreshPromise: Promise<boolean> | null = null;

  configure(refreshHandler: RefreshHandler): void {
    this.refreshHandler = refreshHandler;
  }

  async refresh(): Promise<boolean> {
    if (!this.refreshHandler) return false;
    if (!this.refreshPromise) {
      this.refreshPromise = Promise.resolve(this.refreshHandler())
        .then(() => true)
        .catch(() => {
          tokenStorage.clearTokens();
          if (typeof CustomEvent !== "undefined") {
            globalThis.dispatchEvent?.(new CustomEvent(SESSION_EXPIRED_EVENT));
          }
          return false;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    }
    return this.refreshPromise;
  }
}

export const refreshTokenManager = new RefreshTokenManager();
