import { CalendarDays, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LessonView } from "../model/lesson-view.store";

const OPTIONS: Array<{ id: LessonView; labelKey: string; icon: typeof List }> = [
  { id: "list", labelKey: "viewSwitch.list", icon: List },
  { id: "calendar", labelKey: "viewSwitch.calendar", icon: CalendarDays },
];

export interface LessonViewSwitchProps {
  view: LessonView;
  onChange: (view: LessonView) => void;
}

/** Ro'yxat ⇄ kalendar almashtirgichi. Tanlov `lesson-view.store` da saqlanadi. */
export function LessonViewSwitch({ view, onChange }: LessonViewSwitchProps) {
  const { t } = useTranslation("lesson");
  return (
    <div className="view-switch" role="radiogroup" aria-label={t("viewSwitch.aria")}>
      {OPTIONS.map(({ id, labelKey, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={view === id}
          className={view === id ? "is-active" : ""}
          onClick={() => onChange(id)}
        >
          <Icon size={15} />
          <span>{t(labelKey)}</span>
        </button>
      ))}
    </div>
  );
}
