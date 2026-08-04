import { Link } from "react-router-dom";
import { RouteState } from "@/shared/ui";
import { ROUTES } from "./route-paths";

export function ForbiddenPage() {
  return (
    <RouteState
      eyebrow="403"
      title="Bu bo‘limga ruxsat yo‘q"
      description="Hisobingiz ushbu sahifani ko‘rish huquqiga ega emas."
      action={<Link className="button button--primary" to={ROUTES.root}>Bosh sahifaga qaytish</Link>}
    />
  );
}

export function NotFoundPage() {
  return (
    <RouteState
      eyebrow="404"
      title="Sahifa topilmadi"
      description="Manzil noto‘g‘ri yoki sahifa boshqa joyga ko‘chirilgan."
      action={<Link className="button button--primary" to={ROUTES.root}>Bosh sahifaga qaytish</Link>}
    />
  );
}
