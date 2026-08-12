import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronRight, Copy, History, LogOut, Phone, Settings, ShieldCheck, UserRound, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LoginHistoryDialog,
  useAuth,
  useUpdateProfileMutation,
  type ProfileFormValues,
} from "@/modules/auth";
import { NotificationInboxDialog } from "@/modules/notification";
import { Avatar, Button, Dialog, DialogContent, ThemeToggle } from "@/shared/ui/legacy";

type MenuItemId = "profile" | "logins" | "notifications" | "settings";

const MENU_ITEMS: Array<{
  id: MenuItemId;
  label: string;
  description: string;
  icon: typeof UserRound;
}> = [
  { id: "profile", label: "Profil ma’lumotlari", description: "Shaxsiy ma’lumotlarni ko‘rish", icon: UserRound },
  { id: "logins", label: "Kirishlar tarixi", description: "Qurilma va IP bo‘yicha jurnal", icon: History },
  { id: "notifications", label: "Bildirishnomalar", description: "Xabarlar va eslatmalar", icon: Bell },
  { id: "settings", label: "Sozlamalar", description: "Platforma parametrlari", icon: Settings },
];

export interface AccountMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileOpen: boolean;
  onProfileOpenChange: (open: boolean) => void;
  roleLabel?: string;
  workspaceLabel?: string;
}

export function AccountMenu({
  open,
  onOpenChange,
  profileOpen,
  onProfileOpenChange,
  roleLabel = "O‘qituvchi",
  workspaceLabel = "Teacher workspace",
}: AccountMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfileMutation();
  const [editing, setEditing] = useState(false);
  const [loginsOpen, setLoginsOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [draft, setDraft] = useState<ProfileFormValues>({
    firstName: "",
    lastName: "",
    phone: "",
    username: "",
  });

  function selectItem(id: MenuItemId) {
    if (id === "profile") {
      onOpenChange(false);
      onProfileOpenChange(true);
      return;
    }
    if (id === "logins") {
      onOpenChange(false);
      setLoginsOpen(true);
      return;
    }
    if (id === "notifications") {
      onOpenChange(false);
      setInboxOpen(true);
      return;
    }
    toast.info("Sozlamalar ushbu qurilmada saqlanadi");
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function copyValue(label: string, value: string | null | undefined) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} nusxalandi`);
    } catch {
      toast.error("Nusxalash amalga oshmadi");
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateProfile.mutateAsync(draft);
      setEditing(false);
      toast.success("Profil yangilandi");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profilni saqlab bo‘lmadi");
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
                <button className="icon-button" onClick={() => onOpenChange(false)} aria-label="Yopish">
                  <X size={19} />
                </button>
              </div>
              <button className="teacher-menu-profile" onClick={() => selectItem("profile")}>
                <Avatar name={user?.name ?? roleLabel} tone="violet" size="lg" status="online" />
                <span>
                  <strong>{user?.name}</strong>
                  <small>{roleLabel} · Onlayn</small>
                </span>
                <ChevronRight size={18} />
              </button>
              <div className="teacher-menu-theme">
                <span>Mavzu</span>
                <ThemeToggle />
              </div>
              <div className="teacher-menu-status">
                <ShieldCheck size={17} />
                <span>
                  <strong>{workspaceLabel}</strong>
                  <small>Sessiya xavfsiz saqlanmoqda</small>
                </span>
              </div>
              <nav className="teacher-menu-links" aria-label="Hisob bo‘limlari">
                {MENU_ITEMS.map((item) => {
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

      <Dialog
        open={profileOpen}
        onOpenChange={(value) => {
          onProfileOpenChange(value);
          if (!value) setEditing(false);
        }}
      >
        {profileOpen && (
          <DialogContent
            className="teacher-profile-dialog"
            title={`${roleLabel} profili`}
            description="Backenddagi haqiqiy profil ma’lumotlari."
          >
            <motion.div
              className="teacher-profile-hero"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Avatar name={user?.name ?? roleLabel} tone="violet" size="lg" status="online" />
              <h3>{user?.name}</h3>
              <p>{roleLabel}</p>
              <span>
                <ShieldCheck size={14} /> Tasdiqlangan profil
              </span>
            </motion.div>

            {editing ? (
              <form className="dialog-form" onSubmit={saveProfile}>
                <div className="register-name-grid">
                  <label className="field-group">
                    <span>Ism</span>
                    <div className="input-shell">
                      <input
                        value={draft.firstName}
                        onChange={(event) => setDraft((value) => ({ ...value, firstName: event.target.value }))}
                        required
                      />
                    </div>
                  </label>
                  <label className="field-group">
                    <span>Familiya</span>
                    <div className="input-shell">
                      <input
                        value={draft.lastName}
                        onChange={(event) => setDraft((value) => ({ ...value, lastName: event.target.value }))}
                        required
                      />
                    </div>
                  </label>
                </div>
                <label className="field-group">
                  <span>Login</span>
                  <div className="input-shell">
                    <input
                      value={draft.username}
                      autoComplete="off"
                      onChange={(event) => setDraft((value) => ({ ...value, username: event.target.value }))}
                      required
                    />
                  </div>
                </label>
                {/* Login yagona bo'lishi shart — band bo'lsa backend 400 beradi. */}
                <p className="portal-muted">
                  Login yagona bo‘lishi kerak. O‘zgartirsangiz, keyingi safar shu login bilan
                  kirasiz.
                </p>
                <label className="field-group">
                  <span>Telefon</span>
                  <div className="input-shell">
                    <input
                      type="tel"
                      value={draft.phone}
                      onChange={(event) => setDraft((value) => ({ ...value, phone: event.target.value }))}
                    />
                  </div>
                </label>
                {updateProfile.isError ? (
                  <div className="form-alert">{updateProfile.error.message}</div>
                ) : null}
                <div className="dialog-actions">
                  <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                    Bekor
                  </Button>
                  <Button type="submit" loading={updateProfile.isPending}>
                    Saqlash
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="teacher-profile-details">
                  <button onClick={() => copyValue("Username", `@${user?.username}`)}>
                    <UserRound size={18} />
                    <span>
                      <small>Username · nusxalash</small>
                      <strong>@{user?.username}</strong>
                    </span>
                    <Copy size={15} />
                  </button>
                  {user?.phone ? (
                    <button onClick={() => copyValue("Telefon", user.phone)}>
                      <Phone size={18} />
                      <span>
                        <small>Telefon · nusxalash</small>
                        <strong>{user.phone}</strong>
                      </span>
                      <Copy size={15} />
                    </button>
                  ) : null}
                </div>
                <Button
                  className="teacher-profile-action"
                  onClick={() => {
                    setDraft({
                      firstName: user?.firstName || "",
                      lastName: user?.lastName || "",
                      phone: user?.phone || "",
                      username: user?.username || "",
                    });
                    setEditing(true);
                  }}
                >
                  Profilni tahrirlash
                </Button>
              </>
            )}
          </DialogContent>
        )}
      </Dialog>

      <LoginHistoryDialog open={loginsOpen} onOpenChange={setLoginsOpen} />
      <NotificationInboxDialog open={inboxOpen} onOpenChange={setInboxOpen} />
    </>
  );
}
