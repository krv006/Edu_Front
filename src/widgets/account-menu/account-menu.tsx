import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Bell,
  Camera,
  ChevronRight,
  Copy,
  FileText,
  History,
  Loader2,
  LogOut,
  Phone,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  LoginHistoryDialog,
  useAuth,
  useDeleteCertificate,
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
  useUploadCertificate,
  type ProfileFormValues,
} from "@/modules/auth";
import { RatingSummary } from "@/modules/lesson";
import { NotificationInboxDialog } from "@/modules/notification";
import { ROLES } from "@/shared/constants";
import { Avatar, Button, Dialog, DialogContent, LanguageToggle, ThemeToggle } from "@/shared/ui/legacy";

type MenuItemId = "profile" | "logins" | "notifications" | "settings";

function useMenuItems(): Array<{
  id: MenuItemId;
  label: string;
  description: string;
  icon: typeof UserRound;
}> {
  const { t } = useTranslation("account");
  return [
    { id: "profile", label: t("menu.profile.label"), description: t("menu.profile.description"), icon: UserRound },
    { id: "logins", label: t("menu.logins.label"), description: t("menu.logins.description"), icon: History },
    { id: "notifications", label: t("menu.notifications.label"), description: t("menu.notifications.description"), icon: Bell },
    { id: "settings", label: t("menu.settings.label"), description: t("menu.settings.description"), icon: Settings },
  ];
}

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
  roleLabel,
  workspaceLabel,
}: AccountMenuProps) {
  const { t } = useTranslation("account");
  const menuItems = useMenuItems();
  const resolvedRoleLabel = roleLabel ?? t("roleFallback");
  const resolvedWorkspaceLabel = workspaceLabel ?? t("workspaceFallback");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfileMutation();
  const updateAvatar = useUpdateAvatarMutation();
  const uploadCertificate = useUploadCertificate();
  const deleteCertificate = useDeleteCertificate();
  const avatarRef = useRef<HTMLInputElement>(null);
  const certificateRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [loginsOpen, setLoginsOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
    onOpenChange(false);
    setSettingsOpen(true);
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function copyValue(label: string, value: string | null | undefined) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t("toast.copied", { label }));
    } catch {
      toast.error(t("toast.copyFailed"));
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateProfile.mutateAsync(draft);
      setEditing(false);
      toast.success(t("toast.profileUpdated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.profileSaveFailed"));
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              className="teacher-menu-overlay"
              aria-label={t("closeMenuAria")}
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
              aria-label={t("menuAria", { role: resolvedRoleLabel })}
            >
              <div className="teacher-menu-top">
                <button className="icon-button" onClick={() => onOpenChange(false)} aria-label={t("closeAria")}>
                  <X size={19} />
                </button>
              </div>
              <button className="teacher-menu-profile" onClick={() => selectItem("profile")}>
                <Avatar name={user?.name ?? resolvedRoleLabel} tone="violet" size="lg" status="online" src={user?.avatarUrl} />
                <span>
                  <strong>{user?.name}</strong>
                  <small>{resolvedRoleLabel} · {t("online")}</small>
                </span>
                <ChevronRight size={18} />
              </button>
              <div className="teacher-menu-theme">
                <span>{t("theme")}</span>
                <ThemeToggle />
              </div>
              <div className="teacher-menu-status">
                <ShieldCheck size={17} />
                <span>
                  <strong>{resolvedWorkspaceLabel}</strong>
                  <small>{t("sessionSecure")}</small>
                </span>
              </div>
              <nav className="teacher-menu-links" aria-label={t("sectionsAria")}>
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
                <LogOut size={18} /> {t("logout")}
              </button>
              <p className="teacher-menu-version">{t("version")}</p>
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
            title={t("profileDialog.title", { role: resolvedRoleLabel })}
            description={t("profileDialog.description")}
          >
            <motion.div
              className="teacher-profile-hero"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Rasmni faqat egasi almashtiradi (`PATCH /auth/me/`). */}
              <span className="info-avatar-slot">
                <Avatar
                  name={user?.name ?? resolvedRoleLabel}
                  tone="violet"
                  size="lg"
                  status="online"
                  src={user?.avatarUrl}
                />
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    updateAvatar.mutate(file, {
                      onSuccess: () => toast.success(t("toast.avatarUpdated")),
                      onError: (error: Error) => toast.error(error.message),
                    });
                  }}
                />
                <button
                  type="button"
                  className="info-avatar-edit"
                  aria-label={t("profileDialog.changeAvatarAria")}
                  disabled={updateAvatar.isPending}
                  onClick={() => avatarRef.current?.click()}
                >
                  {updateAvatar.isPending ? (
                    <Loader2 size={14} className="spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                </button>
              </span>
              <h3>{user?.name}</h3>
              <p>{resolvedRoleLabel}</p>
              <span className="teacher-profile-verified">
                <ShieldCheck size={14} /> {t("profileDialog.verified")}
              </span>
            </motion.div>

            {editing ? (
              <form className="dialog-form" onSubmit={saveProfile}>
                <div className="register-name-grid">
                  <label className="field-group">
                    <span>{t("profileDialog.firstName")}</span>
                    <div className="input-shell">
                      <input
                        value={draft.firstName}
                        onChange={(event) => setDraft((value) => ({ ...value, firstName: event.target.value }))}
                        required
                      />
                    </div>
                  </label>
                  <label className="field-group">
                    <span>{t("profileDialog.lastName")}</span>
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
                  <span>{t("profileDialog.username")}</span>
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
                <p className="portal-muted">{t("profileDialog.usernameNote")}</p>
                <label className="field-group">
                  <span>{t("profileDialog.phone")}</span>
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
                    {t("profileDialog.cancel")}
                  </Button>
                  <Button type="submit" loading={updateProfile.isPending}>
                    {t("profileDialog.save")}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="teacher-profile-details">
                  <button onClick={() => copyValue(t("toast.usernameLabelShort"), `@${user?.username}`)}>
                    <UserRound size={18} />
                    <span>
                      <small>{t("profileDialog.usernameLabel")}</small>
                      <strong>@{user?.username}</strong>
                    </span>
                    <Copy size={15} />
                  </button>
                  {user?.phone ? (
                    <button onClick={() => copyValue(t("toast.phoneLabelShort"), user.phone)}>
                      <Phone size={18} />
                      <span>
                        <small>{t("profileDialog.phoneLabel")}</small>
                        <strong>{user.phone}</strong>
                      </span>
                      <Copy size={15} />
                    </button>
                  ) : null}
                </div>

                {user?.role === ROLES.TEACHER ? (
                  <div className="teacher-profile-certificates">
                    {user.isApproved === false ? (
                      <div className="form-alert">
                        <ShieldAlert size={15} /> {t("profileDialog.notApproved")}
                      </div>
                    ) : null}
                    {user.ratingCount ? (
                      <div className="teacher-profile-rating">
                        <span>{t("profileDialog.ratingLabel")}</span>
                        <RatingSummary average={user.avgRating} count={user.ratingCount} />
                      </div>
                    ) : null}
                    <div className="teacher-profile-certificates-head">
                      <span>{t("profileDialog.certificates")}</span>
                      <button
                        type="button"
                        disabled={uploadCertificate.isPending}
                        onClick={() => certificateRef.current?.click()}
                      >
                        {uploadCertificate.isPending ? (
                          <Loader2 size={14} className="spin" />
                        ) : (
                          <Award size={14} />
                        )}
                        {t("profileDialog.upload")}
                      </button>
                      <input
                        ref={certificateRef}
                        type="file"
                        accept="image/*,application/pdf"
                        hidden
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (!file) return;
                          uploadCertificate.mutate({ file });
                        }}
                      />
                    </div>
                    <div className="teacher-profile-certificate-list">
                      {user.certificates.map((certificate) => (
                        <div key={certificate.id} className="teacher-profile-certificate">
                          <a href={certificate.file} target="_blank" rel="noreferrer">
                            <FileText size={16} />
                            <span>{certificate.title || t("profileDialog.certificateFallback")}</span>
                          </a>
                          <button
                            type="button"
                            aria-label={t("profileDialog.deleteCertificateAria", {
                              title: certificate.title || t("profileDialog.certificateFallback"),
                            })}
                            disabled={deleteCertificate.isPending}
                            onClick={() => deleteCertificate.mutate(certificate.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {!user.certificates.length ? (
                        <p className="portal-muted">{t("profileDialog.noCertificates")}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

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
                  {t("profileDialog.editButton")}
                </Button>
              </>
            )}
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        {settingsOpen && (
          <DialogContent
            className="account-settings-dialog"
            title={t("settingsDialog.title")}
            description={t("settingsDialog.description")}
          >
            <div className="account-settings-list">
              <div className="account-settings-row">
                <span>{t("settingsDialog.languageLabel")}</span>
                <LanguageToggle />
              </div>
              <div className="account-settings-row">
                <span>{t("settingsDialog.themeLabel")}</span>
                <ThemeToggle />
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <LoginHistoryDialog open={loginsOpen} onOpenChange={setLoginsOpen} />
      <NotificationInboxDialog open={inboxOpen} onOpenChange={setInboxOpen} />
    </>
  );
}
