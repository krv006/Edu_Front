import { CalendarCheck2, Home, ListChecks, Trophy, UsersRound } from "lucide-react";
import { ROUTES } from "@/shared/config";
import { useAuth } from "@/modules/auth";
import { PortalLayout } from "@/app/layouts/portal-layout";
import { SelectedChildSelector } from "@/modules/parent";

const navigation = [
  { to: ROUTES.parent.dashboard, label: "Asosiy", icon: Home, end: true },
  { to: ROUTES.parent.children, label: "Farzandlar", icon: UsersRound },
  { to: ROUTES.parent.attendance, label: "Davomat", icon: CalendarCheck2 },
  { to: ROUTES.parent.homework, label: "Vazifalar", icon: ListChecks },
  { to: ROUTES.parent.grades, label: "Reyting", icon: Trophy },
];

export function ParentLayout() {
  const { user, logout } = useAuth();
  return (
    <PortalLayout
      navItems={navigation}
      roleLabel="Ota-ona"
      user={user}
      onLogout={logout}
      headerExtra={<SelectedChildSelector />}
    />
  );
}
