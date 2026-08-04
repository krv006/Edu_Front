export { authApi } from "./api/auth.api";
export { authEndpoints } from "./api/auth.endpoints";
export type {
  AuthUserDto,
  ConsentRequestDto,
  CreateChildRequestDto,
  LinkAction,
  ProfileFormValues,
  RegisterFormValues,
  TokenPair,
  TokenPairDto,
} from "./api/auth.dto";
export { AUTH_STATUS, useAuthStore } from "./model/auth.store";
export { useAuth, useCurrentUser, useIsAuthenticated } from "./model/use-auth";
export { loginSchema, registerSchema } from "./model/auth.schemas";
export { useRegisterMutation, useUpdateProfileMutation } from "./model/auth.mutations";
export { mapLoginRequest, mapTokenPairDto, mapUserDto } from "./lib/auth.mappers";
export { resolveHomeRoute } from "./lib/resolve-home-route";
export { LoginForm } from "./ui/login-form";
export { RegisterForm } from "./ui/register-form";
