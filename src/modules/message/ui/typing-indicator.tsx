import { useTranslation } from "react-i18next";

export function TypingIndicator({ name }: { name: string }) {
  const { t } = useTranslation("chat");
  return (
    <div className="typing-indicator" aria-label={`${name} ${t("typing.suffix")}`}>
      <span />
      <span />
      <span />
      <small>
        {name.split(" ")[0]} {t("typing.suffix")}
      </small>
    </div>
  );
}
