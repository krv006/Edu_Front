import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarX2, Clock3 } from "lucide-react";
import type { Lesson } from "@/shared/types";
import { groupLessonsByDay } from "../lib/lesson-calendar";
import { lessonStatusMeta } from "../lib/lesson-status";
import { LessonActions, type LessonActionsProps } from "./lesson-actions";

export type LessonListProps = Omit<LessonActionsProps, "lesson" | "compact"> & {
  lessons: Lesson[];
};

interface DaySection {
  key: string;
  date: Date;
  lessons: Lesson[];
}

const DAY_FORMAT = new Intl.DateTimeFormat("uz-UZ", {
  weekday: "short",
  day: "numeric",
  month: "long",
});

function buildSections(lessons: Lesson[]): DaySection[] {
  const byDay = groupLessonsByDay(lessons);
  return [...byDay.entries()]
    // Yangi darslar tepada — o'qituvchi ko'pincha eng so'nggisi bilan ishlaydi.
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, items]) => ({ key, date: new Date(items[0].startsAt), lessons: items }));
}

/**
 * Darslar ro'yxati — sana bo'yicha bo'limlarga ajratilgan.
 *
 * Avval barcha darslar bitta uzun oqim edi va qaysi kun ekanini har kartochkadan
 * alohida o'qishga to'g'ri kelardi; sana sarlavhasi shu takrorni olib tashlaydi.
 */
export function LessonList({ lessons, ...actions }: LessonListProps) {
  const sections = useMemo(() => buildSections(lessons), [lessons]);

  if (!sections.length) {
    return (
      <div className="lesson-empty">
        <CalendarX2 size={26} />
        <p>Hali dars rejalashtirilmagan.</p>
      </div>
    );
  }

  return (
    <div className="lesson-sections">
      {sections.map((section) => (
        <section key={section.key}>
          <h3 className="lesson-section-title">
            {DAY_FORMAT.format(section.date)}
            <span>{section.lessons.length} ta</span>
          </h3>

          <div className="lesson-list">
            {section.lessons.map((lesson) => {
              const meta = lessonStatusMeta(lesson.status);
              return (
                <motion.article
                  key={lesson.id}
                  className="lesson-feature-card"
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="lesson-date">
                    <strong>{lesson.time}</strong>
                    <span>{lesson.durationMinutes} daq</span>
                  </div>

                  <div className="lesson-main">
                    <span className={`lesson-status lesson-status--${meta.tone}`}>{meta.label}</span>
                    <h4>{lesson.title}</h4>
                    <p>
                      <Clock3 size={14} /> {lesson.time} — {lesson.durationMinutes} daqiqa
                    </p>
                  </div>

                  <LessonActions lesson={lesson} {...actions} />
                </motion.article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
