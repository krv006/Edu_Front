import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RegisterForm, useRegisterMutation } from "@/modules/auth";

export function RegisterPage() {
  const register = useRegisterMutation();
  const navigate = useNavigate();
  async function submit(values) { await register.mutateAsync(values); toast.success("Hisob yaratildi. Endi tizimga kiring."); navigate("/login", { replace: true }); }
  return <main className="login-page"><div className="login-orb login-orb--one" /><div className="login-orb login-orb--two" />
    <motion.section className="login-card register-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <div className="login-heading"><span className="eyebrow"><Sparkles size={14} /> RO‘YXATDAN O‘TISH</span><h1>EduTech hisobini yarating</h1><p>O‘qituvchi yoki ota-ona sifatida davom eting.</p></div>
      <RegisterForm onSubmit={submit} /><Link className="auth-switch-link" to="/login">Hisobingiz bormi? Kirish</Link>
    </motion.section></main>;
}
