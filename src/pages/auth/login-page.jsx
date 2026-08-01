import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Brand } from "../../components/shared/brand";
import { LoginForm } from "../../components/auth/login-form";
import { useAuth } from "../../app/auth-context";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/teacher/chats" replace />;

  async function handleLogin(credentials) {
    await login(credentials);
    navigate("/teacher/chats", { replace: true });
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
        <Brand />
        <div className="login-heading">
          <span className="eyebrow">
            <Sparkles size={14} /> O‘QITUVCHI PANELI
          </span>
          <h1>Ta’limni bir joydan boshqaring</h1>
          <p>O‘quvchilar bilan muloqot qilish uchun tizimga kiring.</p>
        </div>
        <LoginForm onSubmit={handleLogin} />
        <div className="demo-credentials">
          <ShieldCheck size={17} />
          <span>
            Demo: <strong>teacher</strong> / <strong>teacher123</strong>
          </span>
        </div>
      </motion.section>
      <p className="login-footer">© 2026 · EduTech</p>
    </main>
  );
}
