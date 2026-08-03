import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LogOut,
  Menu,
  MessageCircleMore,
  Settings,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Brand } from "../shared/brand";
import { Avatar } from "../ui/avatar";
import { Sidebar, SidebarContent, SidebarFooter } from "../ui/sidebar";
import { useAuth } from "@/app/providers";

const navItems = [
  {
    label: "Suhbatlar",
    icon: MessageCircleMore,
    path: "/teacher/chats",
    badge: 10,
    enabled: true,
  },
  { label: "Kurslar", icon: BookOpen },
  { label: "Vazifalar", icon: SlidersHorizontal },
  { label: "O‘quvchilar", icon: GraduationCap },
  { label: "Bildirishnomalar", icon: Bell, badge: 3 },
  { label: "Profil", icon: UserRound },
  { label: "Sozlamalar", icon: Settings },
];

function SidebarBody({ collapsed, setCollapsed, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function navigateItem(item) {
    if (!item.enabled) {
      toast.info(`${item.label} keyingi bosqichda qo‘shiladi`);
      return;
    }
    navigate(item.path);
    onNavigate?.();
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="sidebar-inner">
      <div className="sidebar-brand">
        <Brand compact={collapsed} />
      </div>
      <SidebarContent aria-label="Asosiy navigatsiya">
        <p className="sidebar-section-label">
          {collapsed ? "•••" : "ISH MAYDONI"}
        </p>
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active =
            item.enabled && location.pathname.startsWith(item.path);
          return (
            <button
              key={item.label}
              className={`sidebar-link ${active ? "is-active" : ""}`}
              onClick={() => navigateItem(item)}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.span
                  className="sidebar-active-rail"
                  layoutId="sidebar-active"
                />
              )}
              <Icon size={20} aria-hidden="true" />
              {!collapsed && (
                <span className="sidebar-link-label">{item.label}</span>
              )}
              {item.badge && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
        <p className="sidebar-section-label sidebar-section-label--account">
          {collapsed ? "•••" : "HISOB"}
        </p>
        {navItems.slice(5).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="sidebar-link"
              onClick={() => navigateItem(item)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              {!collapsed && (
                <span className="sidebar-link-label">{item.label}</span>
              )}
            </button>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <div
          className="sidebar-user"
          title={collapsed ? user?.name : undefined}
        >
          <Avatar
            name={user?.name ?? "Teacher"}
            tone="violet"
            size="sm"
            status="online"
          />
          {!collapsed && (
            <div className="sidebar-user-copy">
              <strong>{user?.name}</strong>
              <span>O‘qituvchi</span>
            </div>
          )}
          {!collapsed && (
            <button
              className="icon-button icon-button--subtle"
              onClick={handleLogout}
              aria-label="Tizimdan chiqish"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
        <button
          className="collapse-button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={
            collapsed ? "Sidebarni kengaytirish" : "Sidebarni yig‘ish"
          }
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <>
              <ChevronLeft size={18} />
              <span>Yig‘ish</span>
            </>
          )}
        </button>
      </SidebarFooter>
    </div>
  );
}

export function TeacherSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  return (
    <>
      <Sidebar collapsed={collapsed}>
        <SidebarBody collapsed={collapsed} setCollapsed={setCollapsed} />
      </Sidebar>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              className="mobile-sidebar-overlay"
              aria-label="Menyuni yopish"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="mobile-sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <button
                className="mobile-sidebar-close icon-button"
                onClick={() => setMobileOpen(false)}
                aria-label="Yopish"
              >
                <X size={20} />
              </button>
              <SidebarBody
                collapsed={false}
                setCollapsed={() => {}}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileMenuButton({ onClick }) {
  return (
    <button
      className="icon-button mobile-menu-button"
      onClick={onClick}
      aria-label="Asosiy menyuni ochish"
    >
      <Menu size={21} />
    </button>
  );
}
