import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePreviewTracks } from "@livekit/components-react";
import { Track, type LocalVideoTrack } from "livekit-client";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import type { Lesson } from "@/shared/types";
import { Avatar, Button } from "@/shared/ui/legacy";

export interface LessonPreJoinChoices {
  micOn: boolean;
  cameraOn: boolean;
  /**
   * O'qituvchining ekran/tab yozuvi (`getDisplayMedia`) — dars videosini
   * serverga yuklash uchun. Faqat o'qituvchida bo'ladi (o'quvchida hech
   * qachon so'ralmaydi — `undefined`). O'qituvchi uchun bu maydon
   * majburiy: ruxsat berilmasa yoki brauzer qo'llamasa, `join()`
   * `onJoin`ni umuman chaqirmaydi — dars videosiz boshlanmasin.
   */
  screenStream?: MediaStream;
}

export interface LessonPreJoinProps {
  lesson: Lesson;
  userName?: string;
  /**
   * Token mikrofonni uzatishga ruxsat beradimi (MIC_REQUEST_GRANT.md).
   * O'quvchida odatda `false` — u darsda ruxsat so'raydi.
   */
  micAllowed?: boolean;
  /** Ruxsat yo'qligining sababi rolga qarab boshqacha tushuntiriladi. */
  isTeacher?: boolean;
  onJoin: (choices: LessonPreJoinChoices) => void;
  onCancel: () => void;
}

/**
 * Darsga kirishdan oldingi ekran (Meet/Zoom uslubi): kamera ko'rinishi va
 * mikrofon/kamera holatini oldindan tanlash.
 *
 * Xonaga ulanishdan OLDIN turadi, shuning uchun `usePreviewTracks` ishlatiladi —
 * u LiveKit xonasidan mustaqil ravishda lokal trek ochadi va komponent
 * yo'q qilinganda o'zi to'xtatadi (kamera chirog'i o'chadi).
 */
export function LessonPreJoin({
  lesson,
  userName,
  micAllowed = true,
  isTeacher = false,
  onJoin,
  onCancel,
}: LessonPreJoinProps) {
  /*
   * Ikkalasi ham o'chiq boshlanadi: darsga kirayotgan odam o'zi ko'rinishni va
   * ovozni ataylab yoqsin. Kutilmaganda efirga tushib qolish — eng yoqimsiz
   * holat, ayniqsa bir sinf bola oldida.
   */
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /*
   * DIQQAT: `usePreviewTracks` ichida bog'liqlik ro'yxati
   * `[JSON.stringify(options), onError, ...]`. Ya'ni `onError` har renderda
   * yangi funksiya bo'lsa, effekt har renderda qayta ishga tushadi: treklar
   * to'xtatilib qaytadan ochiladi, bu esa setState orqali yana renderni
   * keltirib chiqaradi. Natija — kamera lipillab, ko'rinish qora qolardi.
   * Shuning uchun ikkala argument ham barqaror bo'lishi shart.
   */
  const handleDeviceError = useCallback(
    // Xabari bo'sh xato ham ko'rinishi kerak — aks holda tugmalar sababsiz
    // ishlamayotgandek tuyuladi.
    (error: Error) => setDeviceError(error.message || "qurilma topilmadi"),
    []
  );
  const trackOptions = useMemo(() => ({ audio: micOn, video: cameraOn }), [micOn, cameraOn]);
  const tracks = usePreviewTracks(trackOptions, handleDeviceError);

  const videoTrack = tracks?.find((track) => track.kind === Track.Kind.Video) as
    | LocalVideoTrack
    | undefined;

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !videoTrack) return undefined;
    videoTrack.attach(element);
    return () => {
      videoTrack.detach(element);
    };
  }, [videoTrack]);

  /**
   * Xonaga ulanishdan oldin ko'rish treklarini QO'LDA to'xtatamiz.
   *
   * React ularni unmount paytida baribir to'xtatadi, lekin bu `LiveKitRoom`
   * qurilmani so'rayotgan payt bilan bir vaqtga tushadi. Mikrofonni tizim
   * odatda eksklyuziv beradi, shuning uchun aynan u band bo'lib qoladi va dars
   * ichida o'chiq holda qolardi — kamera esa ochilaverardi.
   *
   * O'qituvchi uchun `getDisplayMedia` ham aynan shu yerda, klik'ning o'zi
   * ichida so'raladi — brauzer transient activation'ni faqat sinxron chaqiruv
   * bosqichida hisobga oladi, `useEffect` ichida so'ralsa jimgina rad etadi.
   *
   * Video yozuvi MAJBURIY: ruxsat berilmasa (yoki brauzer qo'llamasa),
   * `onJoin` chaqirilmaydi va o'qituvchi darsga kira olmaydi — chala
   * (videosiz) yozuv umuman bo'lmasligi kerak. Xato ko'rsatiladi va
   * "Darsga kirish" qayta bosilsa, brauzer yana so'raydi.
   */
  async function join() {
    tracks?.forEach((track) => track.stop());

    if (!isTeacher) {
      onJoin({ micOn, cameraOn });
      return;
    }

    if (typeof navigator.mediaDevices?.getDisplayMedia !== "function") {
      setScreenShareError("Bu brauzer ekran ulashishni qo‘llamaydi — boshqa brauzerdan urinib ko‘ring.");
      return;
    }

    setJoining(true);
    setScreenShareError(null);
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 15 },
        audio: false,
      });
      onJoin({ micOn, cameraOn, screenStream });
    } catch {
      setScreenShareError(
        "Ekran ulashishga ruxsat berilmadi — dars video yozuvi uchun bu shart. Qayta urinib ko‘ring."
      );
    } finally {
      setJoining(false);
    }
  }

  /** Qurilma qayta so'ralganda eski xato osilib qolmasin. */
  function toggleMic() {
    setDeviceError(null);
    setMicOn((value) => !value);
  }

  function toggleCamera() {
    setDeviceError(null);
    setCameraOn((value) => !value);
  }

  return (
    <div className="pre-join">
      <div className="pre-join-card">
        <div className="pre-join-preview">
          {cameraOn && videoTrack ? (
            <video ref={videoRef} muted playsInline autoPlay />
          ) : (
            <div className="pre-join-placeholder">
              <Avatar name={userName || "Siz"} size="lg" />
              <p>Kamera o‘chiq</p>
            </div>
          )}

          <div className="pre-join-toggles">
            {/* Token ruxsat bermasa yoqib bo'lmaydi — bosilsa ham xonada
                uzatilmaydi, shuning uchun tugmani ochiq qoldirib aldamaymiz. */}
            <button
              type="button"
              className={micOn ? "" : "is-off"}
              aria-pressed={micOn}
              aria-label={micOn ? "Mikrofonni o‘chirish" : "Mikrofonni yoqish"}
              disabled={!micAllowed}
              title={micAllowed ? undefined : "Mikrofon uchun darsda ruxsat so‘raysiz"}
              onClick={toggleMic}
            >
              {micOn ? <Mic size={19} /> : <MicOff size={19} />}
            </button>
            <button
              type="button"
              className={cameraOn ? "" : "is-off"}
              aria-pressed={cameraOn}
              aria-label={cameraOn ? "Kamerani o‘chirish" : "Kamerani yoqish"}
              onClick={toggleCamera}
            >
              {cameraOn ? <Video size={19} /> : <VideoOff size={19} />}
            </button>
          </div>
        </div>

        <div className="pre-join-info">
          <span className="portal-eyebrow">DARSGA KIRISH</span>
          <h1>{lesson.title}</h1>
          <p>{lesson.courseTitle}</p>

          {deviceError ? (
            <div className="form-alert">
              Qurilmaga ulanib bo‘lmadi: {deviceError}. Brauzer ruxsatini tekshiring.
            </div>
          ) : null}

          {/*
            O'qituvchining mikrofoni hech qachon cheklanmasligi kerak — bu holat
            server tokeni noto'g'ri kelganini bildiradi, foydalanuvchining
            xatosi emas. Shuning uchun ogohlantirish, oddiy izoh emas.
          */}
          {!micAllowed && isTeacher ? (
            <div className="form-alert">
              Server tokenida mikrofon ruxsati yo‘q — darsda gapira olmaysiz. Bu kutilmagan
              holat, texnik jamoaga xabar bering.
            </div>
          ) : null}

          {screenShareError ? (
            <div className="form-alert" role="alert">
              {screenShareError}
            </div>
          ) : null}

          {isTeacher ? (
            <p className="portal-muted">
              Dars yozib olinishi uchun brauzer ekran ulashishni so‘raydi — ochilgan oynada{" "}
              <strong>“Joriy tab” (This Tab)</strong>ni tanlang. Ruxsat berilmasa darsga kira
              olmaysiz.
            </p>
          ) : null}

          <p className="portal-muted">
            {micOn ? "Mikrofon yoqilgan" : "Mikrofon o‘chiq"} ·{" "}
            {cameraOn ? "kamera yoqilgan" : "kamera o‘chiq"}.{" "}
            {micAllowed || isTeacher
              ? "Darsga kirgandan keyin ham o‘zgartirishingiz mumkin."
              : "Darsda gapirish uchun o‘qituvchidan ruxsat so‘raysiz."}
          </p>

          <div className="pre-join-actions">
            <Button variant="secondary" onClick={onCancel} disabled={joining}>
              Bekor qilish
            </Button>
            <Button onClick={join} loading={joining}>
              Darsga kirish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
