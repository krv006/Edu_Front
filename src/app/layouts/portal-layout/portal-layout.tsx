import { useState, type ComponentType, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { NotificationBell } from "@/modules/notification";
import type { AuthUser } from "@/shared/types";
import { Avatar, Brand, ThemeToggle } from "@/shared/ui/legacy";

export interface PortalNavItem {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number | string }>;
  end?: boolean;
}

export interface PortalLayoutProps {
  navItems: PortalNavItem[];
  roleLabel: string;
  user: AuthUser | null;
  onLogout: () => void | Promise<void>;
  headerExtra?: ReactNode;
}

export function PortalLayout({ navItems, roleLabel, user, onLogout, headerExtra = null }: PortalLayoutProps) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await onLogout();
  }

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="portal-header-inner">
          <NavLink to="/" className="portal-brand-link" aria-label="Bosh sahifa">
            <Brand />
          </NavLink>
          <div className="portal-header-actions">
            {headerExtra}
            <NotificationBell enabled={Boolean(user)} />
            <ThemeToggle className="portal-theme-toggle" />
            <span className="portal-role-badge">{roleLabel}</span>
            <div className="portal-account-wrap">
              <button
                className="portal-account"
                onClick={() => setAccountOpen((value) => !value)}
                aria-expanded={accountOpen}
              >
                <Avatar name={user?.name ?? "Foydalanuvchi"} tone="violet" size="sm" status="online" />
                <span>
                  <strong>{user?.name}</strong>
                  <small>{roleLabel}</small>
                </span>
                <ChevronDown size={16} />
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    className="portal-account-menu"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.98 }}
                    transition={{ duration: 0.17 }}
                  >
                    <div>
                      <strong>{user?.name}</strong>
                      <small>{user?.email}</small>
                    </div>
                    <button onClick={handleLogout}>
                      <LogOut size={17} /> Chiqish
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              className="portal-mobile-toggle"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Navigatsiyani ochish"
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        <nav className={`portal-nav ${mobileOpen ? "is-open" : ""}`} aria-label={`${roleLabel} navigatsiyasi`}>
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
    </div>
  );
}
