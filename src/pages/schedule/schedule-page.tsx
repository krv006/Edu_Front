import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth";
import {
  LessonCalendar,
  LessonList,
  LessonViewSwitch,
  RateLessonDialog,
  useLessons,
  useLessonView,
} from "@/modules/lesson";
import { ROLES } from "@/shared/constants";
import { ROUTES } from "@/shared/config";
import type { Lesson } from "@/shared/types";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";

/**
 * Barcha guruhlardagi darslar bitta kalendarda.
 *
 * Guruh ichidagi "Darslar" bo'limidan farqi — `course` filtri yo'q. Backend
 * ro'yxatni o'zi rolga moslashtiradi: o'quvchi yozilgan kurslarining,
 * o'qituvchi esa o'z kurslarining darslarini oladi.
 */
export function SchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { view, setView } = useLessonView();
  const [rateTarget, setRateTarget] = useState<Lesson | null>(null);
  const lessons = useLessons({ page_size: 200 });

  const isStudent = user?.role === ROLES.STUDENT;

  /**
   * Jadvalda dars TAHRIRLANMAYDI — u kursga tegishli amal va guruh ichida
   * qilinadi. Bu yerda faqat kirish, yozuv va (o'quvchida) baholash.
   */
  const actions = {
    onJoin: (lesson: Lesson) => navigate(ROUTES.live(lesson.id)),
    onRecording: (lesson: Lesson) => navigate(ROUTES.recording(lesson.id)),
    ...(isStudent ? { onRate: setRateTarget } : {}),
  };

  if (lessons.isLoading) return <LoadingFallback label="Kalendar yuklanmoqda" />;

  if (lessons.isError)
    return (
      <RouteState
        eyebrow="KALENDAR"
        title="Darslarni yuklab bo‘lmadi"
        description={lessons.error?.message}
        actionLabel="Qayta urinish"
        onAction={lessons.refetch}
      />
    );

  const items = lessons.data ?? [];

  return (
    <div className="schedule-page">
      <div className="schedule-page-head">
        <div>
          <span className="portal-eyebrow">KALENDAR</span>
          <h1>Mening darslarim</h1>
          <p>Barcha guruhlaringizdagi mashg‘ulotlar bir joyda.</p>
        </div>
        <LessonViewSwitch view={view} onChange={setView} />
      </div>

      {items.length ? (
        <div className="schedule-page-body">
          {view === "calendar" ? (
            <LessonCalendar lessons={items} {...actions} />
          ) : (
            <LessonList lessons={items} {...actions} />
          )}
        </div>
      ) : (
        <div className="lesson-empty">
          <CalendarDays size={26} />
          <p>Hali dars rejalashtirilmagan.</p>
        </div>
      )}

      <RateLessonDialog
        lesson={rateTarget}
        currentUserId={user?.id}
        onOpenChange={(open) => {
          if (!open) setRateTarget(null);
        }}
      />
    </div>
  );
}
