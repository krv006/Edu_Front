import { Navigate, Outlet } from "react-router-dom";
import { resolveHomeRoute, useAuth } from "@/modules/auth";
import { hasRole } from "@/modules/permission";
import type { Role } from "@/shared/constants";
import { ROUTES } from "@/shared/config";

export function RoleRoute({ allowedRoles }: { allowedRoles: Role[] }) {
  const { user } = useAuth();
  if (hasRole(user, allowedRoles)) return <Outlet />;

  /*
   * Tizimga kirgan, lekin bu bo'lim boshqa rolniki — o'z bosh sahifasiga
   * qaytaramiz, 403 ga emas.
   *
   * Sabab rol almashtirishda ko'rinadi: `switchAccount` avval do'konga yangi
   * foydalanuvchini yozadi, manzil esa hali eski rolniki bo'lib turadi. Shu
   * oraliqda qorovul bir marta qayta chizilib, foydalanuvchini 403 ga
   * uloqtirardi — u hech qanday taqiqlangan ish qilmagan bo'lsa ham.
   *
   * `RoleRoute` doim `ProtectedRoute` ichida, shuning uchun `user` bor.
   */
  const home = user ? resolveHomeRoute(user) : null;

  /*
   * Noma'lum rol uchun `resolveHomeRoute` `/login` qaytaradi, `PublicRoute`
   * esa kirgan foydalanuvchini yana bosh sahifasiga jo'natadi — cheksiz
   * aylanish. Bunday holatda 403 to'g'ri javob: bu haqiqatan kutilmagan holat.
   */
  if (!home || home === ROUTES.auth.login) {
    return <Navigate to={ROUTES.errors.forbidden} replace />;
  }
  return <Navigate to={home} replace />;
}
