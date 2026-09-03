import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/shared/ui/legacy";
import { applyApiFieldErrors } from "@/shared/api";
import { registerSchema } from "../model/auth.schemas";
import type { AppError } from "@/shared/api";
import type { RegisterFormValues } from "../api/auth.dto";

export interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => Promise<unknown>;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", firstName: "", lastName: "", phone: "", role: "teacher" },
  });

  async function submit(values: RegisterFormValues) {
    try { await onSubmit(values); }
    catch (error) {
      const appError = error as AppError;
      if (!applyApiFieldErrors(appError, setError, { first_name: "firstName", last_name: "lastName" }))
        setError("root", { message: appError.message });
    }
  }

  return <form className="login-form register-form" onSubmit={handleSubmit(submit)} noValidate>
    <div className="register-role-toggle" aria-label="Hisob turi">
      <Controller name="role" control={control} render={({ field }) => <>
        <button type="button" className={field.value === "teacher" ? "is-active" : ""} onClick={() => field.onChange("teacher")}>O‘qituvchi</button>
        <button type="button" className={field.value === "parent" ? "is-active" : ""} onClick={() => field.onChange("parent")}>Ota-ona</button>
        <button type="button" className={field.value === "student" ? "is-active" : ""} onClick={() => field.onChange("student")}>O‘quvchi</button>
      </>} />
    </div>
    <div className="register-name-grid">
      <label className="field-group"><span>Ism</span><div className={`input-shell ${errors.firstName ? "input-shell--error" : ""}`}><input autoComplete="given-name" {...register("firstName")} /></div>{errors.firstName && <p className="field-error">{errors.firstName.message}</p>}</label>
      <label className="field-group"><span>Familiya</span><div className={`input-shell ${errors.lastName ? "input-shell--error" : ""}`}><input autoComplete="family-name" {...register("lastName")} /></div>{errors.lastName && <p className="field-error">{errors.lastName.message}</p>}</label>
    </div>
    <label className="field-group"><span>Login</span><div className={`input-shell ${errors.username ? "input-shell--error" : ""}`}><input autoComplete="username" {...register("username")} /></div>{errors.username && <p className="field-error">{errors.username.message}</p>}</label>
    <label className="field-group"><span>Telefon</span><div className="input-shell"><input type="tel" autoComplete="tel" placeholder="+998" {...register("phone")} /></div></label>
    <label className="field-group"><span>Parol</span><div className={`input-shell ${errors.password ? "input-shell--error" : ""}`}><input type="password" autoComplete="new-password" {...register("password")} /></div>{errors.password && <p className="field-error">{errors.password.message}</p>}</label>
    {errors.root && <div className="form-alert">{errors.root.message}</div>}
    <Button className="login-submit" type="submit" loading={isSubmitting}>Hisob yaratish</Button>
  </form>;
}
