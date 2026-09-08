import { useTranslation } from "react-i18next";

/** Backend DirectStatusEnum (/api/schema/): pending | active | blocked. */
export const DIRECT_STATUS = Object.freeze({
  PENDING: "pending",
  ACTIVE: "active",
  BLOCKED: "blocked",
});

export type DirectStatusValue = (typeof DIRECT_STATUS)[keyof typeof DIRECT_STATUS];

/** Til o'zgarganda yorliq ham darhol yangilanishi uchun hook sifatida. */
export function useDirectStatusLabel() {
  const { t } = useTranslation("chat");
  return (status: DirectStatusValue | null | undefined, fallback?: string): string => {
    if (!status) return fallback ?? t("directStatus.notSent");
    return t(`directStatus.${status}`, fallback ?? t("directStatus.notSent"));
  };
}
