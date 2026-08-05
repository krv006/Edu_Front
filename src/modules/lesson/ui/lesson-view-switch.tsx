import { CalendarDays, List } from "lucide-react";
import type { LessonView } from "../model/lesson-view.store";

const OPTIONS: Array<{ id: LessonView; label: string; icon: typeof List }> = [
  { id: "list", label: "Ro‘yxat", icon: List },
  { id: "calendar", label: "Kalendar", icon: CalendarDays },
];

export interface LessonViewSwitchProps {
  view: LessonView;
  onChange: (view: LessonView) => void;
}

/** Ro'yxat ⇄ kalendar almashtirgichi. Tanlov `lesson-view.store` da saqlanadi. */
export function LessonViewSwitch({ view, onChange }: LessonViewSwitchProps) {
  return (
    <div className="view-switch" role="radiogroup" aria-label="Darslar ko‘rinishi">
      {OPTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={view === id}
          className={view === id ? "is-active" : ""}
          onClick={() => onChange(id)}
        >
          <Icon size={15} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
