import { normalizeRole } from "@/modules/permission";
import type { Role } from "@/shared/constants";
import type { AuthUser, LoginCredentials } from "@/shared/types";
import {
  tokenPairDtoSchema,
  userDtoSchema,
  type LoginRequestDto,
  type TokenPair,
} from "../api/auth.dto";

export function mapLoginRequest(values: LoginCredentials): LoginRequestDto {
  return { username: values.login.trim(), password: values.password };
}

export function mapTokenPairDto(dto: unknown): TokenPair {
  const parsed = tokenPairDtoSchema.parse(dto);
  return { accessToken: parsed.access, refreshToken: parsed.refresh };
}

/** Zod bilan runtime validatsiya — backend shakli o'zgarsa darhol xato beradi. */
export function mapUserDto(dto: unknown): AuthUser {
  const parsed = userDtoSchema.parse(dto);
  const name = [parsed.first_name, parsed.last_name].filter(Boolean).join(" ") || parsed.username;
  return {
    id: parsed.id,
    username: parsed.username,
    firstName: parsed.first_name,
    lastName: parsed.last_name,
    name,
    role: normalizeRole(parsed.role) as Role,
    phone: parsed.phone ?? null,
    inviteCode: parsed.invite_code ?? null,
    email: null,
    status: "online",
  };
}
