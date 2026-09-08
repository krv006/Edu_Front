import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, useLanguageStore, type AppLanguage } from "@/shared/model";
import { cn } from "@/shared/lib";

const CODE_LABELS: Record<AppLanguage, string> = { uz: "UZ", en: "EN", ru: "RU" };

/** `ThemeToggle` bilan bir xil segmentli naqsh — uchta til, uchta tugma. */
export function LanguageToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <div
      className={cn("language-toggle", className)}
      role="radiogroup"
      aria-label={t("language.switcherLabel")}
    >
      {SUPPORTED_LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          role="radio"
          aria-checked={language === code}
          aria-label={t(`language.${code}`)}
          title={t(`language.${code}`)}
          className={language === code ? "is-active" : ""}
          onClick={() => setLanguage(code)}
        >
          {CODE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
