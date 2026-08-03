import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  Copy,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/app/providers";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";

const menuItems = [
  {
    id: "profile",
    label: "Profil ma’lumotlari",
    description: "Shaxsiy ma’lumotlarni ko‘rish",
    icon: UserRound,
  },
  {
    id: "notifications",
    label: "Bildirishnomalar",
    description: "Xabarlar va eslatmalar",
    icon: Bell,
  },
  {
    id: "settings",
    label: "Sozlamalar",
    description: "Platforma parametrlari",
    icon: Settings,
  },
];

export function TeacherMenu({
  open,
  onOpenChange,
  profileOpen,
  onProfileOpenChange,
  roleLabel = "O‘qituvchi",
  workspaceLabel = "Teacher workspace",
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function selectItem(id) {
    if (id === "profile") {
      onOpenChange(false);
      onProfileOpenChange(true);
      return;
    }
    toast.info(
      id === "notifications"
        ? "Bildirishnomalar sozlamalari"
        : "Sozlamalar keyingi yangilanishda"
    );
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function copyProfileValue(label, value) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} nusxalandi`);
    } catch {
      toast.error("Nusxalash amalga oshmadi");
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              className="teacher-menu-overlay"
              aria-label="Menyuni yopish"
              onClick={() => onOpenChange(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="teacher-menu-drawer"
              initial={{ x: -28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              aria-label={`${roleLabel} menyusi`}
            >
              <div className="teacher-menu-top">
                <button
                  className="icon-button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Yopish"
                >
                  <X size={19} />
                </button>
              </div>
              <button
                className="teacher-menu-profile"
                onClick={() => selectItem("profile")}
              >
                <Avatar
                  name={user?.name ?? "Teacher"}
                  tone="violet"
                  size="lg"
                  status="online"
                />
                <span>
                  <strong>{user?.name}</strong>
                  <small>{roleLabel} · Onlayn</small>
                </span>
                <ChevronRight size={18} />
              </button>
              <div className="teacher-menu-status">
                <ShieldCheck size={17} />
                <span>
                  <strong>{workspaceLabel}</strong>
                  <small>Demo sessiya xavfsiz saqlanmoqda</small>
                </span>
              </div>
              <nav className="teacher-menu-links" aria-label="Hisob bo‘limlari">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} onClick={() => selectItem(item.id)}>
                      <span className="teacher-menu-item-icon">
                        <Icon size={19} />
                      </span>
                      <span>
                        <strong>{item.label}</strong>
                        <small>{item.description}</small>
                      </span>
                      <ChevronRight size={17} />
                    </button>
                  );
                })}
              </nav>
              <button className="teacher-menu-logout" onClick={handleLogout}>
                <LogOut size={18} /> Tizimdan chiqish
              </button>
              <p className="teacher-menu-version">EduTech · v1.0</p>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Dialog open={profileOpen} onOpenChange={onProfileOpenChange}>
        {profileOpen && (
          <DialogContent
            className="teacher-profile-dialog"
            title={`${roleLabel} profili`}
            description={`Fokus platformasidagi ${roleLabel.toLowerCase()} hisobingiz.`}
          >
            <motion.div
              className="teacher-profile-hero"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.06 }}
            >
              <Avatar
                name={user?.name ?? "Teacher"}
                tone="violet"
                size="lg"
                status="online"
              />
              <h3>{user?.name}</h3>
              <p>{roleLabel}</p>
              <span>
                <ShieldCheck size={14} /> Tasdiqlangan profil
              </span>
            </motion.div>
            <div className="teacher-profile-details">
              <button
                onClick={() =>
                  copyProfileValue("Username", `@${user?.username}`)
                }
              >
                <UserRound size={18} />
                <span>
                  <small>Username · nusxalash</small>
                  <strong>@{user?.username}</strong>
                </span>
                <Copy size={15} />
              </button>
              <button onClick={() => copyProfileValue("Email", user?.email)}>
                <Mail size={18} />
                <span>
                  <small>Email · nusxalash</small>
                  <strong>{user?.email}</strong>
                </span>
                <Copy size={15} />
              </button>
            </div>
            <Button
              className="teacher-profile-action"
              onClick={() =>
                toast.info("Profilni tahrirlash keyingi yangilanishda")
              }
            >
              Profilni tahrirlash
            </Button>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
