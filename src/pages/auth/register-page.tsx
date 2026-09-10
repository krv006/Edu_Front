import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RegisterForm, resolveHomeRoute, useRegisterMutation, type RegisterFormValues } from "@/modules/auth";

export function RegisterPage() {
  const register = useRegisterMutation();
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  async function submit(values: RegisterFormValues) {
    // Javobida access/refresh darhol keladi — alohida login shart emas.
    const user = await register.mutateAsync(values);
    toast.success(t("register.accountCreated"));
    navigate(resolveHomeRoute(user), { replace: true });
  }
  return <main className="login-page"><div className="login-orb login-orb--one" /><div className="login-orb login-orb--two" />
    <motion.section className="login-card register-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <div className="login-heading"><span className="eyebrow"><Sparkles size={14} /> {t("register.tagline")}</span><h1>{t("register.title")}</h1><p>{t("register.subtitle")}</p></div>
      <RegisterForm onSubmit={submit} /><Link className="auth-switch-link" to="/login">{t("register.haveAccount")}</Link>
    </motion.section></main>;
}
