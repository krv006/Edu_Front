import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { applyApiFieldErrors } from "@/shared/api";
import { loginSchema } from "../model/auth.schemas";

export function LoginForm({ onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, setError, setValue, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", password: "", remember: true },
  });
  const remember = useWatch({ control, name: "remember" });

  async function submit(values) {
    try {
      await onSubmit(values);
    } catch (error) {
      if (!applyApiFieldErrors(error, setError, { username: "login" })) {
        setError("root", { type: "server", message: error.message });
      }
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="field-group">
        <label htmlFor="login">Login</label>
        <div className={`input-shell ${errors.login ? "input-shell--error" : ""}`}>
          <UserRound size={18} aria-hidden="true" />
          <input id="login" autoComplete="username" placeholder="Loginingizni kiriting" {...register("login")} />
        </div>
        {errors.login && <p className="field-error">{errors.login.message}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="password">Parol</label>
        <div className={`input-shell ${errors.password ? "input-shell--error" : ""}`}>
          <LockKeyhole size={18} aria-hidden="true" />
          <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Parolingizni kiriting" {...register("password")} />
          <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="field-error">{errors.password.message}</p>}
      </div>

      <div className="form-options">
        <label className="checkbox-label">
          <Checkbox.Root className="checkbox" checked={remember} onCheckedChange={(checked) => setValue("remember", checked === true)}>
            <Checkbox.Indicator><Check size={13} strokeWidth={3} /></Checkbox.Indicator>
          </Checkbox.Root>
          Meni eslab qolish
        </label>
      </div>

      {errors.root && <div className="form-alert" role="alert">{errors.root.message}</div>}
      <Button className="login-submit" type="submit" loading={isSubmitting}>Kirish</Button>
    </form>
  );
}
