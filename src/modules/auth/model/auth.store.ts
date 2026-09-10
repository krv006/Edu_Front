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

/**
 * Hisobga bog'langan til bilan qurilmadagi tilni ikki tomonlama sinxronlaydi:
 *  - login/bootstrap'da serverdan kelgan qiymat qurilmaga yoziladi (boshqa
 *    qurilmada tanlangan til shu yerda ham tiklanadi);
 *  - foydalanuvchi shu yerda tilni almashtirsa, pastdagi `subscribe` serverga
 *    yozadi (auth.store.ts'dagi so'nggi bo'lim).
 * `suppressLanguagePush` — serverdan o'qiganda orqaga PATCH ketmasligi uchun.
 */
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

  /** Ilova ochilganda bir marta chaqiriladi: saqlangan token bo'lsa profilni tiklaydi. */
  bootstrap: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  /** Javobida access/refresh darhol keladi — muvaffaqiyatli bo'lsa darhol AUTHENTICATED. */
  register: (dto: RegisterRequestDto) => Promise<AuthUser>;
  /** Bog'langan akkauntga parolsiz o'tish (PHONE_LINKED_ACCOUNTS_API.md). */
  switchAccount: (userId: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  /** Tarmoq xatosidan keyin "Qayta urinish". */
  retry: () => Promise<void>;
}

function toAppError(error: unknown): AppError {
  return error instanceof AppError
    ? error
    : new AppError({
        message: error instanceof Error ? error.message : "Sessiyani tekshirib bo‘lmadi",
      });
}

/**
 * Ketayotgan `me/` so'rovi. React StrictMode (dev) effektni ikki marta
 * chaqiradi, shuningdek daraxt qayta mount bo'lishi ham mumkin — ikkalasida
 * ham bitta so'rov yetarli, chaqiruvchilar bir xil natijani kutadi.
 */
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
        // 401 — token yaroqsiz: sessiyani jimgina tozalaymiz, xato ekrani chiqarmaymiz.
        if (appError.status === 401) {
          tokenStorage.clearTokens();
          set({ user: null, status: AUTH_STATUS.ANONYMOUS, error: null });
          return;
        }
        set({ user: null, status: AUTH_STATUS.ERROR, error: appError });
      }
    })();

    // Tugagach tozalaymiz — "Qayta urinish" yangi so'rov yubora olsin.
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
      // Yarim ochilgan sessiya qolmasin.
      tokenStorage.clearTokens();
      set({ user: null, status: AUTH_STATUS.ANONYMOUS, error: null });
      throw error;
    }
  },

  /**
   * Ro'yxatdan o'tish javobida access/refresh darhol keladi — `login()` kabi
   * alohida so'rov shart emas, lekin foydalanuvchi ma'lumoti javobda
   * kafolatlanmagani uchun (backend hujjati faqat tokenlarni tasdiqlagan)
   * ehtiyot shart bilan `getCurrentUser()` orqali olinadi.
   */
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

  /**
   * Bog'langan akkauntga parolsiz o'tish. Joriy sessiya davomiyligi
   * (`remember me`) saqlanadi — bu yangi login emas, shuning uchun
   * foydalanuvchidan qayta so'ralmaydi.
   */
  async switchAccount(userId) {
    const persistent = tokenStorage.isPersistent();
    const { tokens, user } = mapSwitchAccountResponse(await authApi.switchAccount(userId));
    tokenStorage.setTokens(tokens, { persistent });
    set({ user, status: AUTH_STATUS.AUTHENTICATED, error: null });
    syncLanguageFromServer(user.preferredLanguage);
    return user;
  },

  /**
   * Chiqish: avval serverga aytamiz (refresh token bekor qilinsin), keyin
   * lokal holatni tozalaymiz.
   *
   * So'rov xatosi ATAYLAB YUTILADI: tarmoq uzilgan, token eskirgan yoki
   * endpoint hali chiqarilmagan bo'lishi mumkin — bularning hech biri
   * foydalanuvchini tizimda ushlab qolishga sabab emas. Shuning uchun
   * tokenlar `finally` da, har qanday holatda tozalanadi.
   */
  async logout() {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      await authApi.logout(refreshToken);
    } catch {
      // Sababi muhim emas — chiqish baribir davom etadi.
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

// ─── Bir martalik yon-effektlar ─────────────────────────────────────────────
configureAuthRefresh();

// `LanguageToggle` (shared/ui) qaysi modulda ishlatilishidan bexabar bo'lib
// qolishi uchun ataylab shu yerda ulanadi: foydalanuvchi tizimga kirgan bo'lsa,
// tanlagan tili hisobiga yoziladi (boshqa qurilmada ham tiklanishi uchun).
useLanguageStore.subscribe((state, prevState) => {
  if (suppressLanguagePush || state.language === prevState.language) return;
  if (useAuthStore.getState().status !== AUTH_STATUS.AUTHENTICATED) return;
  authApi.updateLanguage(state.language).catch(() => {
    // Muhim emas — brauzerda tanlov baribir saqlanadi, keyingi harakatda qayta urinamiz.
  });
});

if (typeof window !== "undefined") {
  // Refresh muvaffaqiyatsiz bo'lganda API qatlami shu hodisani yuboradi.
  window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    useAuthStore.setState({ user: null, status: AUTH_STATUS.ANONYMOUS, error: null });
  });

  // Boshqa tabda chiqilsa — bu tab ham sessiyani yopadi.
  window.addEventListener("storage", (event) => {
    if (!event.key?.startsWith("fokus_")) return;
    if (!tokenStorage.hasSession() && useAuthStore.getState().user) {
      useAuthStore.setState({ user: null, status: AUTH_STATUS.ANONYMOUS, error: null });
    }
  });
}
