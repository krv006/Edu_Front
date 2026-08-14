import { useCallback, useEffect, useRef, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/modules/auth";
import {
  LessonPreJoin,
  liveApi,
  useLiveToken,
  type LessonPreJoinChoices,
} from "@/modules/live";
import { RateLessonDialog, useLesson } from "@/modules/lesson";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";
import { LiveRoom, useLeaveGuard } from "@/widgets/live-room";

/**
 * Jonli dars — alohida to'liq ekran sahifasi (modal emas).
 * Chat qobig'idan mustaqil, shuning uchun Google Meet kabi butun ekranni egallaydi.
 */
export function LiveLessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const lesson = useLesson(lessonId ?? null);
  const token = useLiveToken(lessonId, true);
  const joined = useRef(false);
  const isTeacher = useRef(false);
  const [ratePrompt, setRatePrompt] = useState(false);
  /** `null` — hali kirishdan oldingi ekranda. */
  const [choices, setChoices] = useState<LessonPreJoinChoices | null>(null);

  const connected = Boolean(token.data);
  // Baholash oynasi ochiq turganda sahifadan chiqish ogohlantirishi keraksiz.
  useLeaveGuard(connected && !ratePrompt);

  // Xonaga kirganimizni belgilaymiz — chiqishda backendga "leave" yuboriladi (avtomatik davomat).
  useEffect(() => {
    if (token.data) {
      joined.current = true;
      isTeacher.current = token.data.isTeacher;
    }
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

  const refetchLesson = lesson.refetch;

  /**
   * O'quvchi darsdan chiqqanda: o'qituvchi darsni allaqachon yakunlagan bo'lsa
   * chiqishdan oldin baho so'raymiz. Backend faqat tugagan darsni qabul qiladi,
   * shuning uchun holat aynan shu payt qayta so'raladi.
   */
  const handleLeave = useCallback(() => {
    if (isTeacher.current) {
      navigate(-1);
      return;
    }
    refetchLesson()
      .then((result) => {
        if (result.data?.status === "finished") setRatePrompt(true);
        else navigate(-1);
      })
      .catch(() => navigate(-1));
  }, [navigate, refetchLesson]);

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

  if (ratePrompt) {
    return (
      <main className="live-page">
        <RouteState
          eyebrow="DARS YAKUNLANDI"
          title={lesson.data.title}
          description="Chiqishdan oldin o‘qituvchi uchun fikringizni qoldiring."
          actionLabel="Chiqish"
          onAction={() => navigate(-1)}
        />
        <RateLessonDialog
          lesson={lesson.data}
          currentUserId={user?.id}
          onOpenChange={(open) => {
            if (!open) navigate(-1);
          }}
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

  // Kirishdan oldin mikrofon/kamera tanlanadi — xonaga ulanish shundan keyin.
  if (!choices) {
    return (
      <main className="live-page">
        <LessonPreJoin
          lesson={lesson.data}
          userName={user?.name}
          defaultMicOn={token.data.isTeacher}
          onJoin={setChoices}
          onCancel={() => navigate(-1)}
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
        audio={choices.micOn}
        video={choices.cameraOn}
        onDisconnected={handleLeave}
      >
        <LiveRoom lesson={lesson.data} isTeacher={token.data.isTeacher} onLeave={handleLeave} />
      </LiveKitRoom>
    </main>
  );
}
