import { CalendarCheck2, Home, UsersRound } from "lucide-react";
import { ROUTES } from "@/app/router/route-paths";
import { useAuth } from "@/app/providers";
import { PortalLayout } from "@/shared/ui";

const navigation = [
  { to: ROUTES.parent.dashboard, label: "Asosiy", icon: Home, end: true },
  { to: ROUTES.parent.children, label: "Farzandlar", icon: UsersRound },
  { to: ROUTES.parent.attendance, label: "Davomat", icon: CalendarCheck2 },
];

export function ParentLayout() {
  const { user, logout } = useAuth();
  return <PortalLayout navItems={navigation} roleLabel="Ota-ona" user={user} onLogout={logout} />;
}
