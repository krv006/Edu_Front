import type { AppError } from "@/shared/api";
import type { Role } from "@/shared/constants";

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
