import { create } from "zustand";
import { AppError, SESSION_EXPIRED_EVENT, tokenStorage } from "@/shared/api";
import { SUPPORTED_LANGUAGES, useLanguageStore, type AppLanguage } from "@/shared/model";
import type { AuthStatus, AuthUser, LoginCredentials } from "@/shared/types";
import { authApi } from "../api/auth.api";
import type { RegisterRequestDto } from "../api/auth.dto";
import {
  mapLoginRequest,
  mapSwitchAccountResponse,
  mapTokenPairDto,
  mapUserDto,
} from "../lib/auth.mappers";
import { configureAuthRefresh } from "../lib/auth-session";

let suppressLanguagePush = false;

function syncLanguageFromServer(preferred: string) {
  if (!SUPPORTED_LANGUAGES.includes(preferred as AppLanguage)) return;
  if (useLanguageStore.getState().language === preferred) return;
  suppressLanguagePush = true;
  useLanguageStore.getState().setLanguage(preferred as AppLanguage);
  suppressLanguagePush = false;
}

export const AUTH_STATUS = Object.freeze({
  ANONYMOUS: "anonymous",
  INITIALIZING: "initializing",
  AUTHENTICATED: "authenticated",
  ERROR: "error",
}) satisfies Record<string, AuthStatus>;

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: AppError | null;

  bootstrap: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (dto: RegisterRequestDto) => Promise<AuthUser>;
  switchAccount: (userId: string) => Promise<AuthUser>;
  switchRole: (role: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  retry: () => Promise<void>;
}

function toAppError(error: unknown): AppError {
  return error instanceof AppError
    ? error
    : new AppError({
        message: error instanceof Error ? error.message : "Sessiyani tekshirib bo‘lmadi",
      });
}

let pendingBootstrap: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  status: tokenStorage.hasSession() ? AUTH_STATUS.INITIALIZING : AUTH_STATUS.ANONYMOUS,
  error: null,

  async bootstrap() {
    pendingBootstrap ??= (async () => {
      if (!tokenStorage.hasSession()) {
        set({ user: null, status: AUTH_STATUS.ANONYMOUS, error: null });
        return;
      }
      set({ status: AUTH_STATUS.INITIALIZING, error: null });
      try {
        const user = mapUserDto(await authApi.getCurrentUser());
        set({ user, status: AUTH_STATUS.AUTHENTICATED, error: null });
        syncLanguageFromServer(user.preferredLanguage);
      } catch (error) {
        const appError = toAppError(error);
        if (appError.status === 401) {
          tokenStorage.clearTokens();
          set({ user: null, status: AUTH_STATUS.ANONYMOUS, error: null });
          return;
        }
        set({ user: null, status: AUTH_STATUS.ERROR, error: appError });
      }
    })();

    try {
      await pendingBootstrap;
    } finally {
      pendingBootstrap = null;
    }
  },

  async login(credentials) {
    try {
      const tokens = mapTokenPairDto(await authApi.login(mapLoginRequest(credentials)));
      tokenStorage.setTokens(tokens, { persistent: credentials.remember !== false });
      const user = mapUserDto(await authApi.getCurrentUser());
      set({ user, status: AUTH_STATUS.AUTHENTICATED, error: null });
      syncLanguageFromServer(user.preferredLanguage);
      return user;
    } catch (error) {
      tokenStorage.clearTokens();
      set({ user: null, status: AUTH_STATUS.ANONYMOUS, error: null });
      throw error;
    }
  },

  async register(dto) {
    try {
      const tokens = mapTokenPairDto(await authApi.register(dto));
      tokenStorage.setTokens(tokens, { persistent: true });
      const user = mapUserDto(await authApi.getCurrentUser());
      set({ user, status: AUTH_STATUS.AUTHENTICATED, error: null });
      syncLanguageFromServer(user.preferredLanguage);
      return user;
    } catch (error) {
      tokenStorage.clearTokens();
      set({ user: null, status: AUTH_STATUS.ANONYMOUS, error: null });
      throw error;
    }
  },

  async switchAccount(userId) {
    const persistent = tokenStorage.isPersistent();
    const { tokens, user } = mapSwitchAccountResponse(await authApi.switchAccount(userId));
    tokenStorage.setTokens(tokens, { persistent });
    set({ user, status: AUTH_STATUS.AUTHENTICATED, error: null });
    syncLanguageFromServer(user.preferredLanguage);
    return user;
  },

  async switchRole(role) {
    const persistent = tokenStorage.isPersistent();
    const { tokens, user } = mapSwitchAccountResponse(await authApi.switchRole(role));
    tokenStorage.setTokens(tokens, { persistent });
    set({ user, status: AUTH_STATUS.AUTHENTICATED, error: null });
    syncLanguageFromServer(user.preferredLanguage);
    return user;
  },

  async logout() {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      await authApi.logout(refreshToken);
    } catch (error) {
      void error;
    } finally {
      tokenStorage.clearTokens();
      set({ user: null, status: AUTH_STATUS.ANONYMOUS, error: null });
    }
  },

  setUser(user) {
    set({ user, status: AUTH_STATUS.AUTHENTICATED });
  },

  retry() {
    return get().bootstrap();
  },
}));

configureAuthRefresh();

useLanguageStore.subscribe((state, prevState) => {
  if (suppressLanguagePush || state.language === prevState.language) return;
  if (useAuthStore.getState().status !== AUTH_STATUS.AUTHENTICATED) return;
  authApi.updateLanguage(state.language).catch(() => {
  });
});

if (typeof window !== "undefined") {
  window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    useAuthStore.setState({ user: null, status: AUTH_STATUS.ANONYMOUS, error: null });
  });

  window.addEventListener("storage", (event) => {
    if (!event.key?.startsWith("fokus_")) return;
    if (!tokenStorage.hasSession() && useAuthStore.getState().user) {
      useAuthStore.setState({ user: null, status: AUTH_STATUS.ANONYMOUS, error: null });
    }
  });
}
