import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/legacy";
import { applyApiFieldErrors } from "@/shared/api";
import { createLoginSchema } from "../model/auth.schemas";
import type { AppError } from "@/shared/api";
import type { LoginCredentials } from "@/shared/types";

export interface LoginFormProps {
  onSubmit: (values: LoginCredentials) => Promise<unknown>;
  /** Bog'langan akkauntlar flyout'idan "shu akkauntga o'tish" bosilganda oldindan to'ldiriladi. */
  defaultUsername?: string;
}

export function LoginForm({ onSubmit, defaultUsername }: LoginFormProps) {
  const { t } = useTranslation("auth");
  const [showPassword, setShowPassword] = useState(false);
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: defaultUsername ?? "", password: "", remember: true },
  });
  const remember = useWatch({ control, name: "remember" });

  async function submit(values: LoginCredentials) {
    try {
      await onSubmit(values);
    } catch (error) {
      const appError = error as AppError;
      if (!applyApiFieldErrors(appError, setError, { username: "login" })) {
        setError("root", { type: "server", message: appError.message });
      }
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="field-group">
        <label htmlFor="login">{t("form.loginLabel")}</label>
        <div
          className={`input-shell ${errors.login ? "input-shell--error" : ""}`}
        >
          <UserRound size={18} aria-hidden="true" />
          <input
            id="login"
            autoComplete="username"
            placeholder={t("form.loginPlaceholder")}
            {...register("login")}
          />
        </div>
        {errors.login && <p className="field-error">{errors.login.message}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="password">{t("form.passwordLabel")}</label>
        <div
          className={`input-shell ${
            errors.password ? "input-shell--error" : ""
          }`}
        >
          <LockKeyhole size={18} aria-hidden="true" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            autoFocus={Boolean(defaultUsername)}
            placeholder={t("form.passwordPlaceholder")}
            {...register("password")}
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? t("form.hidePassword") : t("form.showPassword")}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="field-error">{errors.password.message}</p>
        )}
      </div>

      <div className="form-options">
        <label className="checkbox-label">
          <Checkbox.Root
            className="checkbox"
            checked={remember}
            onCheckedChange={(checked) =>
              setValue("remember", checked === true)
            }
          >
            <Checkbox.Indicator>
              <Check size={13} strokeWidth={3} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          {t("form.rememberMe")}
        </label>
      </div>

      {errors.root && (
        <div className="form-alert" role="alert">
          {errors.root.message}
        </div>
      )}
      <Button className="login-submit" type="submit" loading={isSubmitting}>
        {t("form.submit")}
      </Button>
    </form>
  );
}
