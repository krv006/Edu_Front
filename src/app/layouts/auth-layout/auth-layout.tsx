import { Outlet } from "react-router-dom";
import { LanguageToggle } from "@/shared/ui/legacy";

export function AuthLayout() {
  return (
    <>
      <LanguageToggle className="auth-language-toggle" />
      <Outlet />
    </>
  );
}
