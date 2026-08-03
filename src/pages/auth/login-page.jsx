import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers";
import { resolveHomeRoute } from "@/app/router/resolve-home-route";
import { Brand } from "@/components/shared/brand";
import { LoginForm } from "@/modules/auth";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to={resolveHomeRoute(user)} replace />;

  async function handleLogin(credentials) {
    const nextUser = await login(credentials);
    navigate(resolveHomeRoute(nextUser), { replace: true });
  }

  return (
    <main className="login-page">
      <div className="login-orb login-orb--one" />
      <div className="login-orb login-orb--two" />
      <motion.section className="login-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Brand />
        <div className="login-heading">
          <span className="eyebrow"><Sparkles size={14} /> TA’LIM PLATFORMASI</span>
          <h1>Ta’limingizni bir joydan boshqaring</h1>
          <p>O‘qituvchi, o‘quvchi yoki ota-ona hisobingiz bilan kiring.</p>
        </div>
        <LoginForm onSubmit={handleLogin} />
        <div className="demo-credentials">
          <ShieldCheck size={17} />
          <span>Demo: <strong>teacher</strong>, <strong>student</strong> yoki <strong>parent</strong> / rol nomi + <strong>123</strong></span>
        </div>
      </motion.section>
      <p className="login-footer">© 2026 · EduTech</p>
    </main>
  );
}
