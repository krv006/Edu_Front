import { normalizeRole } from "@/modules/permission";
import { tokenPairDtoSchema, userDtoSchema } from "../api/auth.dto";

export function mapLoginRequest(values) {
  return { username: values.login.trim(), password: values.password };
}

export function mapTokenPairDto(dto) {
  const parsed = tokenPairDtoSchema.parse(dto);
  return { accessToken: parsed.access, refreshToken: parsed.refresh };
}

export function mapUserDto(dto) {
  const parsed = userDtoSchema.parse(dto);
  const name = [parsed.first_name, parsed.last_name].filter(Boolean).join(" ") || parsed.username;
  return {
    id: parsed.id,
    username: parsed.username,
    firstName: parsed.first_name,
    lastName: parsed.last_name,
    name,
    role: normalizeRole(parsed.role),
    phone: parsed.phone ?? null,
    inviteCode: parsed.invite_code ?? null,
    email: null,
    status: "online",
  };
}
