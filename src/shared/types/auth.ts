import type { AppError } from "@/shared/api";
import type { Role } from "@/shared/constants";

/** O'qituvchi yuklagan sertifikat (`/auth/me/certificates/`). */
export interface Certificate {
  id: string;
  /** To'liq fayl havolasi (rasm yoki PDF). */
  file: string;
  title: string;
  createdAt: string;
}

/**
 * Xuddi shu telefon raqamiga bog'langan BOSHQA akkaunt (o'zi kirmaydi).
 * Mustaqil login/parolga ega — almashish uchun qayta kirish kerak
 * (PHONE_LINKED_ACCOUNTS_API.md).
 */
export interface LinkedAccount {
  id: string;
  username: string;
  name: string;
  role: Role;
}

/** Bog'langan akkauntlar flyout'idan `/login`ga "shu akkauntga o'tish" holati uchun uzatiladi. */
export interface SwitchAccountState {
  prefillUsername: string;
  switchAccountName?: string;
}

/** `modules/auth` dagi `mapUserDto` qaytaradigan domen modeli. */
export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  name: string;
  role: Role;
  phone: string | null;
  inviteCode: string | null;
  /** Profil rasmi (to'liq havola) — bo'lmasa harfli avatar ko'rsatiladi. */
  avatarUrl: string | null;
  email: string | null;
  status: string;
  /** Faqat `role: teacher`da mazmunli — boshqa rollarda `null`. */
  avgRating: number | null;
  ratingCount: number | null;
  /** Faqat o'qituvchida mazmunli — admin tasdiqlamaguncha `false`. */
  isApproved: boolean | null;
  certificates: Certificate[];
  /** Hisobga bog'langan til (`uz`/`ru`/`en`) — qurilmadan mustaqil, `PATCH /auth/me/` bilan saqlanadi. */
  preferredLanguage: string;
  /** Xuddi shu telefondagi boshqa akkauntlar — bo'sh yoki telefon yo'q bo'lsa `[]`. */
  linkedAccounts: LinkedAccount[];
}

export type AuthStatus = "anonymous" | "initializing" | "authenticated" | "error";

export interface LoginCredentials {
  login: string;
  password: string;
  remember?: boolean;
}

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isInitializing: boolean;
  initializationError: AppError | null;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  retrySession: () => void;
}
