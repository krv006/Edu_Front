import { normalizeMediaUrl } from "@/shared/api";
import { normalizeRole } from "@/modules/permission";
import type { Role } from "@/shared/constants";
import type { AuthUser, LoginCredentials } from "@/shared/types";
import {
  loginRecordDtoSchema,
  tokenPairDtoSchema,
  userDtoSchema,
  type LoginRecord,
  type LoginRequestDto,
  type TokenPair,
} from "../api/auth.dto";
import { describeUserAgent } from "./describe-user-agent";

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
    // `<img src>` uchun to'liq havola kerak — apiClient bazasi qo'llanadi.
    avatarUrl: normalizeMediaUrl(parsed.avatar),
    email: null,
    status: "online",
  };
}

/**
 * Kirishlar tarixi — backend paginatsiyasiz massiv qaytaradi, eng yangisi birinchi.
 * `at` + `ip` juftligi yozuvni bir xil qiladi, shuning uchun ro'yxat kaliti sifatida yetarli.
 */
export function mapLoginRecords(dto: unknown): LoginRecord[] {
  return loginRecordDtoSchema
    .array()
    .parse(Array.isArray(dto) ? dto : [])
    .map((item) => ({
      id: `${item.at}-${item.ip ?? ""}`,
      at: item.at,
      ip: item.ip ?? "—",
      device: describeUserAgent(item.user_agent),
      userAgent: item.user_agent ?? "",
      isNewIp: item.new_ip,
      isNewDevice: item.new_device,
    }));
}
