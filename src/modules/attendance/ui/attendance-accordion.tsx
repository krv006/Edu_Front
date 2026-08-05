import { useMemo } from "react";
import { CalendarDays, Clock3, Eye, UsersRound } from "lucide-react";
import { formatDateTime, formatDuration } from "@/shared/lib";
import type { AttendanceRow } from "@/shared/types";
import { Avatar } from "@/shared/ui/legacy";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion";
import { groupAttendanceByLesson } from "../lib/group-by-lesson";
import { FocusJournalCell } from "./focus-journal-cell";

export interface AttendanceAccordionProps {
  rows: AttendanceRow[];
  /** Boshida ochiq turadigan darslar soni — odatda eng so'nggisi. */
  defaultOpenCount?: number;
  emptyLabel?: string;
}

/** Diqqat tekshiruviga javob berish ulushi; tekshiruv bo'lmasa foiz ko'rsatilmaydi. */
function attentionRate(answered: number, total: number): number | null {
  return total > 0 ? Math.round((answered / total) * 100) : null;
}

const BADGE = "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-extrabold";
const TONE = {
  good: "bg-success-soft text-success-strong",
  warn: "bg-warning-soft text-warning-strong",
  bad: "bg-destructive-soft text-destructive-strong",
} as const;

/**
 * Davomatni dars bo'yicha akkordeonga yig'adi: sarlavhada dars nomi va yig'ma
 * ko'rsatkichlar, ichida o'sha darsdagi o'quvchilar ro'yxati.
 *
 * Yassi jadvalda o'nlab qator aralashib ketardi; dars bo'yicha guruhlash
 * o'qituvchiga "shu darsda kim qanday qatnashdi" degan savolga to'g'ridan-to'g'ri javob beradi.
 *
 * Sarlavha shadcn/Tailwind bilan yoziladi (komponent shu idiomada), ichidagi jadval esa
 * mavjud `.attendance-table` uslublarini qayta ishlatadi.
 */
export function AttendanceAccordion({
  rows,
  defaultOpenCount = 1,
  emptyLabel = "Davomat yozuvi topilmadi.",
}: AttendanceAccordionProps) {
  const groups = useMemo(() => groupAttendanceByLesson(rows), [rows]);
  const defaultOpen = useMemo(
    () => groups.slice(0, defaultOpenCount).map((group) => group.lessonId),
    [groups, defaultOpenCount]
  );

  if (!groups.length) return <p className="portal-muted">{emptyLabel}</p>;

  return (
    <Accordion
      type="multiple"
      className="attendance-groups"
      // `key` — darslar ro'yxati o'zgarganda boshlang'ich ochiq holat qayta hisoblansin.
      key={defaultOpen.join("|")}
      defaultValue={defaultOpen}
    >
      {groups.map((group) => {
        const rate = attentionRate(group.attentionAnswered, group.attentionTotal);

        return (
          <AccordionItem key={group.lessonId} value={group.lessonId} className="border-border">
            <AccordionTrigger className="items-center gap-3 px-3 py-3 no-underline hover:bg-muted hover:no-underline">
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <strong className="truncate text-[13px] font-bold text-foreground">
                  {group.lesson}
                </strong>
                <small className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium text-muted-foreground">
                  {group.startedAt ? (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={12} /> {formatDateTime(group.startedAt)}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1">
                    <UsersRound size={12} /> {group.studentsCount} o‘quvchi
                  </span>
                </small>
              </span>

              <span className="flex shrink-0 flex-wrap justify-end gap-1.5">
                {rate !== null ? (
                  <i
                    className={`${BADGE} ${rate >= 70 ? TONE.good : rate >= 40 ? TONE.warn : TONE.bad} not-italic`}
                  >
                    <Eye size={11} /> {rate}%
                  </i>
                ) : null}
                {group.focusExits ? (
                  <i className={`${BADGE} ${TONE.bad} not-italic`}>
                    <Clock3 size={11} /> {group.focusExits} chiqish
                    {group.awaySeconds ? ` · ${formatDuration(group.awaySeconds)}` : ""}
                  </i>
                ) : (
                  <i className={`${BADGE} ${TONE.good} not-italic`}>Chalg‘imagan</i>
                )}
              </span>
            </AccordionTrigger>

            <AccordionContent className="pt-0 pb-3">
              <div className="attendance-table-scroll">
                <table className="attendance-table attendance-table--nested">
                  <thead>
                    <tr>
                      <th>O‘quvchi</th>
                      <th>Kirdi</th>
                      <th>Chiqdi</th>
                      <th>Davomiyligi</th>
                      <th>Diqqat</th>
                      <th>Fokus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <span className="attendance-student">
                            <Avatar name={row.child} size="sm" />
                            <strong>{row.child}</strong>
                          </span>
                        </td>
                        <td>{row.entered}</td>
                        <td>{row.exited}</td>
                        <td>{row.duration}</td>
                        <td>
                          {row.attentionAnswered}/{row.attentionTotal}
                        </td>
                        <td>
                          <FocusJournalCell
                            focus={row.focus}
                            student={row.child}
                            lesson={row.lesson}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
