import { useMemo, useState } from "react";
import { addMonths, startOfMonth } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { Lesson } from "@/shared/types";
import { Button } from "@/shared/ui/legacy";
import {
  buildMonthGrid,
  formatDayTitle,
  formatMonthTitle,
  resolveInitialMonth,
  toDayKey,
  WEEKDAY_LABELS,
  type CalendarDay,
} from "../lib/lesson-calendar";
import { lessonStatusMeta } from "../lib/lesson-status";
import { LessonActions, type LessonActionsProps } from "./lesson-actions";

export type LessonCalendarProps = Omit<LessonActionsProps, "lesson" | "compact"> & {
  lessons: Lesson[];
};

/** Katakda ko'rsatiladigan maksimal chip — qolgani "+N" bo'lib yig'iladi. */
const MAX_CHIPS = 3;

function DayCell({
  day,
  selected,
  onSelect,
}: {
  day: CalendarDay;
  selected: boolean;
  onSelect: (day: CalendarDay) => void;
}) {
  const hidden = day.lessons.length - MAX_CHIPS;

  return (
    <button
      type="button"
      className={[
        "calendar-day",
        day.inCurrentMonth ? "" : "is-outside",
        day.isToday ? "is-today" : "",
        selected ? "is-selected" : "",
        day.lessons.length ? "has-lessons" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={selected}
      aria-label={`${formatDayTitle(day.date)} — ${day.lessons.length} ta dars`}
      onClick={() => onSelect(day)}
    >
      <span className="calendar-day-number">{day.dayOfMonth}</span>

      {/* Keng ekranda to'liq chip, mobilda nuqta — CSS almashtiradi. */}
      <span className="calendar-day-chips" aria-hidden="true">
        {day.lessons.slice(0, MAX_CHIPS).map((lesson) => (
          <span
            key={lesson.id}
            className={`calendar-chip calendar-chip--${lessonStatusMeta(lesson.status).tone}`}
          >
            <b>{lesson.time}</b>
            <i>{lesson.title}</i>
          </span>
        ))}
        {hidden > 0 ? <span className="calendar-chip-more">+{hidden}</span> : null}
      </span>

      <span className="calendar-day-dots" aria-hidden="true">
        {day.lessons.slice(0, MAX_CHIPS).map((lesson) => (
          <i key={lesson.id} className={`dot dot--${lessonStatusMeta(lesson.status).tone}`} />
        ))}
      </span>
    </button>
  );
}

/**
 * Darslarning oylik kalendari.
 *
 * Kun katagi ekran kengligiga qarab ikki xil ko'rinadi: keng ekranda dars chiplari,
 * mobilda holat nuqtalari. Kun tanlanganda uning darslari pastdagi panelda to'liq
 * amallari bilan ochiladi — mobil qurilmada asosiy ishchi yuza shu.
 */
export function LessonCalendar({ lessons, ...actions }: LessonCalendarProps) {
  const [month, setMonth] = useState(() => resolveInitialMonth(lessons));
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const days = useMemo(() => buildMonthGrid(month, lessons), [month, lessons]);

  /** Tanlov bo'lmasa (yoki boshqa oyga o'tilgan bo'lsa) — bugun, aks holda birinchi darsli kun. */
  const fallbackKey = useMemo(() => {
    const today = days.find((day) => day.isToday && day.inCurrentMonth);
    if (today) return today.key;
    return days.find((day) => day.inCurrentMonth && day.lessons.length)?.key ?? null;
  }, [days]);

  // Effekt emas, hosila: panjara o'zgarganda tanlov o'z-o'zidan mos kunga tushadi.
  const activeKey =
    selectedKey && days.some((day) => day.key === selectedKey) ? selectedKey : fallbackKey;
  const selected = days.find((day) => day.key === activeKey) ?? null;

  /** Chetdagi (oldingi/keyingi oy) kun tanlansa — o'sha oyga o'tamiz. */
  function selectDay(day: CalendarDay) {
    setSelectedKey(day.key);
    if (!day.inCurrentMonth) setMonth(startOfMonth(day.date));
  }
  const monthLessonCount = days.reduce(
    (sum, day) => sum + (day.inCurrentMonth ? day.lessons.length : 0),
    0
  );

  return (
    <div className="lesson-calendar">
      <div className="calendar-toolbar">
        <div className="calendar-title">
          <strong>{formatMonthTitle(month)}</strong>
          <small>{monthLessonCount} ta dars</small>
        </div>
        <div className="calendar-nav">
          <button
            className="icon-button"
            aria-label="Oldingi oy"
            onClick={() => setMonth((value) => addMonths(value, -1))}
          >
            <ChevronLeft size={17} />
          </button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const now = new Date();
              setMonth(startOfMonth(now));
              setSelectedKey(toDayKey(now));
            }}
          >
            <CalendarDays size={15} /> Bugun
          </Button>
          <button
            className="icon-button"
            aria-label="Keyingi oy"
            onClick={() => setMonth((value) => addMonths(value, 1))}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="calendar-grid" role="grid">
        {days.map((day) => (
          <DayCell key={day.key} day={day} selected={day.key === activeKey} onSelect={selectDay} />
        ))}
      </div>

      {selected ? (
        <section className="calendar-day-panel" aria-live="polite">
          <header>
            <strong>{formatDayTitle(selected.date)}</strong>
            <small>{selected.lessons.length} ta dars</small>
          </header>

          {selected.lessons.length ? (
            <ul>
              {selected.lessons.map((lesson) => {
                const meta = lessonStatusMeta(lesson.status);
                return (
                  <li key={lesson.id}>
                    <span className="calendar-day-time">
                      <b>{lesson.time}</b>
                      <i>{lesson.durationMinutes} daq</i>
                    </span>
                    <span className="calendar-day-info">
                      <strong>{lesson.title}</strong>
                      <em className={`lesson-status lesson-status--${meta.tone}`}>{meta.label}</em>
                    </span>
                    <LessonActions lesson={lesson} compact {...actions} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="portal-muted">Bu kunda dars yo‘q.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
