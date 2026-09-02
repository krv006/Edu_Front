import { useCallback, useEffect, useRef, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { DisconnectReason } from "livekit-client";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/modules/auth";
import {
  LessonPreJoin,
  liveApi,
  MIC_TRACK,
  tokenAllowsTrack,
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
  /**
   * O'quvchi "Darsga kirish"ni bosgandan keyin LiveKit'ga darhol EMAS,
   * server bergan `joinDelayMs` (FIFO navbat kechikishi) o'tgandan keyin
   * ulanadi. Sabab: bitta darsda 20+ o'quvchi qisqa vaqt ichida ulansa,
   * LiveKit'da CPU keskin portlaydi ("thundering herd" — production'da
   * o'lchangan, 2026-09-02). Tasodifiy kechikish sinovda buni YOMONLASHTIRDI
   * (tasodifiy qiymatlar bir-biriga yaqin tushib qolishi mumkin) — shuning
   * uchun server FIFO tartibda, bir vaqtda faqat bir nechta kishini
   * (partiya) o'tkazadigan navbat hisoblaydi (`apps/live/services.py`,
   * `_compute_join_delay_ms`). Foydalanuvchi buni amalda sezmaydi (bir
   * necha soniyalik "ulanmoqda" holati baribir tabiiy). O'qituvchida
   * `joinDelayMs` har doim 0.
   */
  const [readyToConnect, setReadyToConnect] = useState(false);

  useEffect(() => {
    if (!choices || !token.data || token.data.joinDelayMs <= 0) return;
    const timer = globalThis.setTimeout(() => setReadyToConnect(true), token.data.joinDelayMs);
    return () => globalThis.clearTimeout(timer);
  }, [choices, token.data]);

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
          micAllowed={tokenAllowsTrack(token.data.token, MIC_TRACK)}
          isTeacher={token.data.isTeacher}
          onJoin={setChoices}
          onCancel={() => navigate(-1)}
        />
      </main>
    );
  }

  // Navbat kechikishi hali tugamagan (yuqoridagi izohga qarang).
  if (!readyToConnect && token.data.joinDelayMs > 0) {
    return (
      <main className="live-page">
        <LoadingFallback label="Dars xonasiga ulanmoqda" />
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
        onDisconnected={(reason) => {
          /*
           * Chetlashtirilganda LiveKit xonani jimgina yopadi va dars sababsiz
           * tugagandek tuyuladi (FRONTEND_TODO.md §"Ban qilinganda").
           */
          if (reason === DisconnectReason.PARTICIPANT_REMOVED) {
            toast.error("Siz darsdan chetlashtirildingiz");
          }
          handleLeave();
        }}
        // Qurilma ochilmasa LiveKit uni jimgina o'tkazib yuboradi va mikrofon
        // sababsiz o'chiq qolganday tuyuladi — buni aytib qo'yamiz.
        onMediaDeviceFailure={(_failure, kind) =>
          toast.error(
            kind === "audioinput"
              ? "Mikrofonni ochib bo‘lmadi — boshqa dastur band qilgan bo‘lishi mumkin"
              : "Kamerani ochib bo‘lmadi — boshqa dastur band qilgan bo‘lishi mumkin"
          )
        }
      >
        <LiveRoom
          lesson={lesson.data}
          isTeacher={token.data.isTeacher}
          screenStream={choices.screenStream ?? null}
          onLeave={handleLeave}
        />
      </LiveKitRoom>
    </main>
  );
}
