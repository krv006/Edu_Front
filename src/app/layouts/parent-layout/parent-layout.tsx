import { CalendarCheck2, Home, ListChecks, UsersRound } from "lucide-react";
import { ROUTES } from "@/app/router/route-paths";
import { useAuth } from "@/app/providers";
import { PortalLayout } from "@/app/layouts/portal-layout";
import { SelectedChildProvider, SelectedChildSelector } from "@/modules/parent";

const navigation = [
  { to: ROUTES.parent.dashboard, label: "Asosiy", icon: Home, end: true },
  { to: ROUTES.parent.children, label: "Farzandlar", icon: UsersRound },
  { to: ROUTES.parent.attendance, label: "Davomat", icon: CalendarCheck2 },
  { to: ROUTES.parent.homework, label: "Vazifalar", icon: ListChecks },
];

export function ParentLayout() {
  const { user, logout } = useAuth();
  return <SelectedChildProvider><PortalLayout navItems={navigation} roleLabel="Ota-ona" user={user} onLogout={logout} headerExtra={<SelectedChildSelector />} /></SelectedChildProvider>;
}
