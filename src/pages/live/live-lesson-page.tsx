import { useCallback, useEffect, useRef } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { useNavigate, useParams } from "react-router-dom";
import { liveApi, useLiveToken } from "@/modules/live";
import { useLesson } from "@/modules/lesson";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";
import { LiveRoom, useLeaveGuard } from "@/widgets/live-room";

/**
 * Jonli dars — alohida to'liq ekran sahifasi (modal emas).
 * Chat qobig'idan mustaqil, shuning uchun Google Meet kabi butun ekranni egallaydi.
 */
export function LiveLessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = useLesson(lessonId ?? null);
  const token = useLiveToken(lessonId, true);
  const joined = useRef(false);

  const connected = Boolean(token.data);
  useLeaveGuard(connected);

  // Xonaga kirganimizni belgilaymiz — chiqishda backendga "leave" yuboriladi (avtomatik davomat).
  useEffect(() => {
    if (token.data) joined.current = true;
  }, [token.data]);

  useEffect(() => {
    const currentLessonId = lessonId;
    return () => {
      if (joined.current && currentLessonId) {
        joined.current = false;
        liveApi.leave(currentLessonId).catch(() => undefined);
      }
    };
  }, [lessonId]);

  const handleLeave = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (lesson.isLoading || token.isLoading) {
    return (
      <main className="live-page">
        <LoadingFallback label="Dars xonasiga ulanmoqda" />
      </main>
    );
  }

  if (lesson.isError || !lesson.data) {
    return (
      <main className="live-page">
        <RouteState
          eyebrow="JONLI DARS"
          title="Darsni topib bo‘lmadi"
          description={lesson.error?.message}
          actionLabel="Orqaga"
          onAction={handleLeave}
        />
      </main>
    );
  }

  if (token.isError || !token.data) {
    return (
      <main className="live-page">
        <RouteState
          eyebrow="JONLI DARS"
          title="Darsga kirib bo‘lmadi"
          description={token.error?.message}
          actionLabel="Qayta urinish"
          onAction={token.refetch}
        />
      </main>
    );
  }

  return (
    <main className="live-page">
      <LiveKitRoom
        token={token.data.token}
        serverUrl={token.data.serverUrl}
        connect
        audio
        video
        onDisconnected={handleLeave}
      >
        <LiveRoom lesson={lesson.data} isTeacher={token.data.isTeacher} onLeave={handleLeave} />
      </LiveKitRoom>
    </main>
  );
}
