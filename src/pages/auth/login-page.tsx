import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth";
import { LoginForm, resolveHomeRoute } from "@/modules/auth";
import type { LoginCredentials } from "@/shared/types";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to={resolveHomeRoute(user)} replace />;

  async function handleLogin(credentials: LoginCredentials) {
    const nextUser = await login(credentials);
    navigate(resolveHomeRoute(nextUser), { replace: true });
  }

  return (
    <main className="login-page">
      <div className="login-orb login-orb--one" />
      <div className="login-orb login-orb--two" />
      <motion.section
        className="login-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="login-heading">
          <span className="eyebrow">
            <Sparkles size={14} /> TA’LIM PLATFORMASI
          </span>
          <h1>Ta’limingizni bir joydan boshqaring</h1>
          <p>O‘qituvchi, o‘quvchi yoki ota-ona hisobingiz bilan kiring.</p>
        </div>
        <LoginForm onSubmit={handleLogin} />
        <Link className="auth-switch-link" to="/register">Hisob yaratish</Link>
      </motion.section>
      <p className="login-footer">© 2026 · EduTech</p>
    </main>
  );
}
