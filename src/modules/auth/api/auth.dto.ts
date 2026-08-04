import { z } from "zod";

/** Auth — yagona modul, DTO'lar zod bilan runtime'da ham tekshiriladi. */
export const tokenPairDtoSchema = z.object({
  access: z.string().min(1),
  refresh: z.string().min(1),
});

export const userDtoSchema = z.object({
  id: z.string(),
  username: z.string(),
  first_name: z.string().default(""),
  last_name: z.string().default(""),
  role: z.string(),
  phone: z.string().nullable().optional(),
  invite_code: z.string().nullable().optional(),
});

export type TokenPairDto = z.infer<typeof tokenPairDtoSchema>;
export type AuthUserDto = z.infer<typeof userDtoSchema>;

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RefreshRequestDto {
  refresh: string;
}

export interface RegisterRequestDto {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
}

export interface CreateChildRequestDto {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface ConsentRequestDto {
  student: string;
  kind: string;
  granted: boolean;
}

/** Bola ota-ona so'roviga javobi. */
export type LinkAction = "approve" | "decline";

export interface RegisterFormValues {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "teacher" | "parent";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phone?: string;
}
