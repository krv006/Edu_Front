import { useState, type ComponentType, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router-dom";
import { NotificationBell } from "@/modules/notification";
import { AccountMenu } from "@/widgets/account-menu";
import type { AuthUser } from "@/shared/types";
import { Avatar, Brand } from "@/shared/ui/legacy";

export interface PortalNavItem {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number | string }>;
  end?: boolean;
}

export interface PortalLayoutProps {
  navItems: PortalNavItem[];
  roleLabel: string;
  workspaceLabel: string;
  user: AuthUser | null;
  headerExtra?: ReactNode;
}

export function PortalLayout({ navItems, roleLabel, workspaceLabel, user, headerExtra = null }: PortalLayoutProps) {
  const { t } = useTranslation();
  const [accountOpen, setAccountOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="portal-header-inner">
          <NavLink to="/" className="portal-brand-link" aria-label={t("portal.home")}>
            <Brand />
          </NavLink>
          <div className="portal-header-actions">
            {headerExtra}
            <NotificationBell enabled={Boolean(user)} />
            <button
              className="portal-account"
              onClick={() => setAccountOpen(true)}
              aria-label={t("nav:rail.openProfileMenu")}
            >
              <Avatar name={user?.name ?? t("portal.defaultUser")} tone="violet" size="sm" status="online" />
              <span className="portal-account-identity">
                <strong>{user?.name}</strong>
                <small>{roleLabel}</small>
              </span>
              <ChevronDown size={16} />
            </button>
            <button
              className="portal-mobile-toggle"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label={t("portal.openNav")}
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        <nav className={`portal-nav ${mobileOpen ? "is-open" : ""}`} aria-label={t("portal.navLabel", { role: roleLabel })}>
          <div className="portal-nav-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => (isActive ? "is-active" : "")}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={17} /> <span>{item.label}</span>
                      {isActive && <motion.i layoutId={`portal-nav-${roleLabel}`} />}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="portal-main">
        <Outlet />
      </main>

      <AccountMenu
        open={accountOpen}
        onOpenChange={setAccountOpen}
        profileOpen={profileOpen}
        onProfileOpenChange={setProfileOpen}
        roleLabel={roleLabel}
        workspaceLabel={workspaceLabel}
      />
    </div>
  );
}
