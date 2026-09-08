import { useEffect, useMemo, useRef, useState } from "react";
import {
  DisconnectButton,
  ParticipantTile,
  RoomAudioRenderer,
  TrackToggle,
  useConnectionState,
  useLocalParticipantPermissions,
  useParticipants,
  useRoomContext,
  useTracks,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { ConnectionState, RoomEvent, Track, type Participant } from "livekit-client";
import {
  CircleStop,
  Hand,
  LayoutDashboard,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  UserRoundPlus,
  UserRoundX,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { AwayStudentsNotice, BoardPanel } from "@/modules/board";
import { i18n } from "@/shared/i18n";
import {
  FinishLessonDialog,
  useTeacherAudioRecording,
  useTeacherVideoRecording,
  type TeacherAudioRecordingSnapshot,
  type TeacherVideoRecordingSnapshot,
} from "@/modules/lesson";
import {
  AttentionCheckDialog,
  CAMERA_SOURCE,
  canPublishSource,
  decodeScreenShareRequest,
  encodeScreenShareRequest,
  LessonInviteDialog,
  MICROPHONE_SOURCE,
  SCREEN_SHARE_SOURCE,
  useAllowShare,
  useAttentionCheck,
  useBanFromLesson,
  useCameraSignals,
  useFocusTracker,
  useMicSignals,
  type CameraRequest,
  type MicRequest,
} from "@/modules/live";
import type { Lesson } from "@/shared/types";
import { Avatar, Button } from "@/shared/ui/legacy";

type SidePanel = "board" | "people" | null;

function useConnectionLabels(): Record<string, string> {
  const { t } = useTranslation("live");
  return {
    [ConnectionState.Connecting]: t("connection.connecting"),
    [ConnectionState.Connected]: t("connection.connected"),
    [ConnectionState.Reconnecting]: t("connection.reconnecting"),
    [ConnectionState.Disconnected]: t("connection.disconnected"),
  };
}

function useAudioRecordingLabels(): Record<TeacherAudioRecordingSnapshot["phase"], string> {
  const { t } = useTranslation("live");
  return {
    idle: t("audioRecording.idle"),
    recording: t("audioRecording.recording"),
    uploading: t("audioRecording.uploading"),
    retrying: t("audioRecording.retrying"),
    stopped: t("audioRecording.stopped"),
    unsupported: t("audioRecording.unsupported"),
    error: t("audioRecording.error"),
  };
}

function useVideoRecordingLabels(): Record<TeacherVideoRecordingSnapshot["phase"], string> {
  const { t } = useTranslation("live");
  return {
    idle: t("videoRecording.idle"),
    recording: t("videoRecording.recording"),
    uploading: t("videoRecording.uploading"),
    retrying: t("videoRecording.retrying"),
    stopped: t("videoRecording.stopped"),
    unsupported: t("videoRecording.unsupported"),
    error: t("videoRecording.error"),
  };
}

function CameraTile({
  track,
  compact = false,
}: {
  track: TrackReferenceOrPlaceholder;
  compact?: boolean;
}) {
  const { t } = useTranslation("live");
  const publication = "publication" in track ? track.publication : undefined;
  const cameraOff = !publication || publication.isMuted;
  const name = track.participant.name || track.participant.identity;

  return (
    <article
      className={`live-camera-tile ${compact ? "is-compact" : ""} ${cameraOff ? "is-camera-off" : ""}`}
    >
      <ParticipantTile trackRef={track} disableSpeakingIndicator={cameraOff} />
      {cameraOff ? (
        <div className="live-camera-placeholder" aria-label={t("room.cameraOffAria", { name })}>
          <Avatar name={name} size={compact ? "sm" : "md"} />
        </div>
      ) : null}
      <span className="live-camera-name">
        {track.participant.isLocal ? `${name} ${t("room.youSuffix")}` : name}
      </span>
    </article>
  );
}

/**
 * O'quvchi mikrofoni (MIC_REQUEST_GRANT.md): darsga o'chiq holda kiradi va
 * gapirish uchun o'qituvchidan ruxsat so'raydi. Ruxsat berilgach LiveKit
 * huquqlari yangilanadi va shu yerning o'zi odatdagi tugmaga aylanadi.
 */
function StudentMicControl({
  onRequest,
  requesting,
  waiting,
}: {
  onRequest: () => void;
  requesting: boolean;
  waiting: boolean;
}) {
  const { t } = useTranslation("live");
  const permissions = useLocalParticipantPermissions();
  const canSpeak = canPublishSource(permissions, MICROPHONE_SOURCE);

  if (canSpeak) {
    return (
      <TrackToggle
        source={Track.Source.Microphone}
        showIcon={false}
        className="live-control"
        aria-label={t("mic.label")}
      >
        <Mic size={19} />
        <MicOff size={19} className="live-control-off" />
      </TrackToggle>
    );
  }

  /*
   * Navbatda turgan so'rov bitta bo'ladi: javob (ruxsat yoki rad) kelmaguncha
   * qayta so'rab bo'lmaydi — shuning uchun tugma kutish holatiga o'tadi.
   */
  return (
    <button
      type="button"
      className={`live-control live-control--mic-request ${waiting ? "is-waiting" : ""}`}
      aria-label={waiting ? t("mic.requestSentAria") : t("mic.requestAria")}
      title={waiting ? t("mic.requestSentTitle") : t("mic.requestTitle")}
      disabled={requesting || waiting}
      onClick={onRequest}
    >
      <MicOff size={19} />
      <Hand size={13} className="live-control-corner" aria-hidden="true" />
    </button>
  );
}

/**
 * O'qituvchi mikrofoni. Uning tokeni hech qachon cheklanmasligi kerak, lekin
 * cheklangan holat uchrasa tugma jimgina ishlamay turmasin — sababi ko'rinsin.
 */
function TeacherMicControl() {
  const { t } = useTranslation("live");
  const permissions = useLocalParticipantPermissions();

  if (canPublishSource(permissions, MICROPHONE_SOURCE)) {
    return (
      <TrackToggle
        source={Track.Source.Microphone}
        showIcon={false}
        className="live-control"
        aria-label={t("mic.label")}
      >
        <Mic size={19} />
        <MicOff size={19} className="live-control-off" />
      </TrackToggle>
    );
  }

  return (
    <button
      type="button"
      className="live-control"
      disabled
      aria-label={t("mic.disabledAria")}
      title={t("mic.disabledTitle")}
    >
      <MicOff size={19} />
    </button>
  );
}

/**
 * O'quvchi kamerasi (FRONTEND_TODO_CAMERA_BOARD.md §1) — `StudentMicControl`
 * bilan AYNAN bir xil naqsh: darsga kamerasiz kiradi, yoqish uchun
 * o'qituvchidan ruxsat so'raydi. Ruxsat berilgach LiveKit huquqlari
 * yangilanadi va shu yerning o'zi odatdagi tugmaga aylanadi.
 */
function StudentCameraControl({
  onRequest,
  requesting,
  waiting,
}: {
  onRequest: () => void;
  requesting: boolean;
  waiting: boolean;
}) {
  const { t } = useTranslation("live");
  const permissions = useLocalParticipantPermissions();
  const canPublishCamera = canPublishSource(permissions, CAMERA_SOURCE);

  if (canPublishCamera) {
    return (
      <TrackToggle
        source={Track.Source.Camera}
        showIcon={false}
        className="live-control"
        aria-label={t("camera.label")}
      >
        <Video size={19} />
        <VideoOff size={19} className="live-control-off" />
      </TrackToggle>
    );
  }

  return (
    <button
      type="button"
      className={`live-control live-control--mic-request ${waiting ? "is-waiting" : ""}`}
      aria-label={waiting ? t("camera.requestSentAria") : t("camera.requestAria")}
      title={waiting ? t("camera.requestSentTitle") : t("camera.requestTitle")}
      disabled={requesting || waiting}
      onClick={onRequest}
    >
      <VideoOff size={19} />
      <Hand size={13} className="live-control-corner" aria-hidden="true" />
    </button>
  );
}

/**
 * O'qituvchi kamerasi. Uning tokeni hech qachon cheklanmasligi kerak, lekin
 * cheklangan holat uchrasa tugma jimgina ishlamay turmasin — sababi ko'rinsin.
 */
function TeacherCameraControl() {
  const { t } = useTranslation("live");
  const permissions = useLocalParticipantPermissions();

  if (canPublishSource(permissions, CAMERA_SOURCE)) {
    return (
      <TrackToggle
        source={Track.Source.Camera}
        showIcon={false}
        className="live-control"
        aria-label={t("camera.label")}
      >
        <Video size={19} />
        <VideoOff size={19} className="live-control-off" />
      </TrackToggle>
    );
  }

  return (
    <button
      type="button"
      className="live-control"
      disabled
      aria-label={t("camera.disabledAria")}
      title={t("camera.disabledTitle")}
    >
      <VideoOff size={19} />
    </button>
  );
}

/** LiveKit'ning o'z ichki `waitForDimensions` (1000ms) tekshiruvidan OLDIN
 * chaqiriladi — klonlangan video trekning o'lchami tayyor bo'lishini kutadi,
 * shunda nashr paytida LiveKit uni darhol topadi (standart o'lchamga
 * tushib qolib, konsolga xato yozmaydi). Topilmasa ham (juda kam holat)
 * LiveKit o'zining fallback'iga tayanadi — funksionallik baribir buzilmaydi. */
async function waitForVideoDimensions(track: MediaStreamTrack, timeoutMs = 500): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const { width, height } = track.getSettings();
    if (width && height) return;
    await new Promise((resolve) => globalThis.setTimeout(resolve, 30));
  }
}

/**
 * O'qituvchi ekran ulashishi — endi PRE-JOIN'da olingan yagona `screenStream`ni
 * qayta ishlatadi, yangi `getDisplayMedia` so'ramaydi (2026-09-05, foydalanuvchi
 * xabar bergan xato: ikkalasi bir xil tabni tanlasa, brauzer ikkita mustaqil
 * "Sharing..." banner ko'rsatardi — ruxsat ikki marta so'ralgani uchun).
 *
 * Yozuv (recording) shu oqimning ASL treklaridan MUSTAQIL davom etadi — LiveKit
 * xonasiga har safar YOQILGANDA `track.clone()` orqali olingan NUSXA chop
 * etiladi (asl trekning o'zi emas). Sabab (sinovda topilgan): bir marta
 * `unpublishTrack` qilingan trekni xuddi o'sha obyekt bilan qayta
 * `publishTrack` qilib bo'lmaydi (LiveKit jimgina rad etadi) — nusxa esa har
 * safar yangi, muammosiz. O'chirilganda faqat NUSXA to'xtatiladi, asl trek —
 * hech qachon.
 */
function TeacherShareControl({ screenStream }: { screenStream: MediaStream }) {
  const { t } = useTranslation("live");
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const [sharing, setSharing] = useState(false);
  const [starting, setStarting] = useState(false);
  const publishedRef = useRef<MediaStreamTrack[]>([]);
  const autoStartedRef = useRef(false);

  async function stopSharing() {
    const toStop = publishedRef.current;
    publishedRef.current = [];
    setSharing(false);
    await Promise.all(
      toStop.map((track) => room.localParticipant.unpublishTrack(track, true))
    );
  }

  async function startSharing() {
    setStarting(true);
    try {
      const toPublish: Array<{ track: MediaStreamTrack; source: Track.Source }> = [];
      const videoTrack = screenStream.getVideoTracks()[0];
      const audioTrack = screenStream.getAudioTracks()[0];
      if (videoTrack) {
        const clone = videoTrack.clone();
        // Yangi klon o'lchami (width/height) darhol tayyor bo'lmasligi mumkin —
        // shu zahoti chop etilsa, LiveKit 1 soniya kutib, topolmay standart
        // o'lchamga (1280x720) tushib qoladi (konsolda "could not determine
        // track dimensions" xatosi, funksionallik buzilmaydi, lekin shovqin
        // qiladi). Shu yerda oldindan kutib, mavjud bo'lsa xatoni oldini olamiz.
        await waitForVideoDimensions(clone);
        toPublish.push({ track: clone, source: Track.Source.ScreenShare });
      }
      if (audioTrack) toPublish.push({ track: audioTrack.clone(), source: Track.Source.ScreenShareAudio });

      try {
        const published: MediaStreamTrack[] = [];
        for (const { track, source } of toPublish) {
          await room.localParticipant.publishTrack(track, { source });
          published.push(track);
        }
        publishedRef.current = published;
        setSharing(true);
      } catch {
        toPublish.forEach(({ track }) => track.stop());
        toast.error(t("share.failedToast"));
      }
    } finally {
      setStarting(false);
    }
  }

  // Brauzerning o'z "Stop sharing" panelidan to'xtatilsa — tugma holati ham yangilansin.
  useEffect(() => {
    const videoTrack = screenStream.getVideoTracks()[0];
    if (!videoTrack) return undefined;
    const handleEnded = () => void stopSharing();
    videoTrack.addEventListener("ended", handleEnded);
    return () => videoTrack.removeEventListener("ended", handleEnded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenStream]);

  /**
   * O'qituvchi darsga kirishning o'zida ekranini ulashish uchun ruxsat
   * bergan (pre-join, yozuv uchun majburiy) — shuning uchun jonli ulashish
   * ham AVTOMATIK yoqiladi, alohida tugma bosishni talab qilmaydi (2026-09-05,
   * foydalanuvchi so'ragan). Faqat xona haqiqatan ULANGANDA (Connected)
   * ishga tushadi — undan oldin `publishTrack` ishonchsiz bo'lardi. `ref`
   * bilan FAQAT BIR MARTA ishga tushishi kafolatlanadi (StrictMode'da effekt
   * ikki marta chaqirilsa ham qayta boshlab yubormaydi).
   */
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (connectionState !== ConnectionState.Connected) return;
    autoStartedRef.current = true;
    // `queueMicrotask` — `startSharing` ichidagi `setState`ni effekt
    // tanasidan SINXRON emas, keyingi microtask'da chaqiradi (React 19
    // "effekt ichida sinxron setState" lint qoidasi shunga qarab tekshiradi).
    queueMicrotask(() => void startSharing());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState]);

  async function toggleShare() {
    if (starting) return;
    if (sharing) {
      await stopSharing();
      return;
    }
    await startSharing();
  }

  return (
    <button
      type="button"
      className="live-control live-control--share"
      data-lk-enabled={sharing}
      aria-pressed={sharing}
      aria-label={t("share.teacherAria")}
      title={t("share.teacherTitle")}
      disabled={starting}
      onClick={toggleShare}
    >
      <MonitorUp size={19} />
    </button>
  );
}

function StudentShareControl() {
  const { t } = useTranslation("live");
  const room = useRoomContext();
  const permissions = useLocalParticipantPermissions();
  const [requesting, setRequesting] = useState(false);
  const canShare = canPublishSource(permissions, SCREEN_SHARE_SOURCE);

  if (canShare) {
    return (
      <TrackToggle
        source={Track.Source.ScreenShare}
        // Ekran bilan birga uning OVOZI ham uzatiladi: aks holda video darsi
        // yoki taqdimotdagi tovush o'quvchilarga umuman yetib bormaydi.
        // `selfBrowserSurface: "exclude"` — shu darsning o'z tab'ini tanlov
        // ro'yxatidan olib tashlaydi: aks holda kimdir o'z darsini ulashsa,
        // ekranda cheksiz oyna-ichida-oyna (aks sado) hosil bo'lardi.
        captureOptions={{ audio: true, selfBrowserSurface: "exclude" }}
        showIcon={false}
        className="live-control live-control--share"
        aria-label={t("share.studentAria")}
      >
        <MonitorUp size={19} />
      </TrackToggle>
    );
  }

  async function requestShare() {
    if (requesting) return;
    setRequesting(true);
    try {
      const signal = encodeScreenShareRequest(
        room.localParticipant.name || room.localParticipant.identity
      );
      await room.localParticipant.publishData(signal.payload, {
        reliable: true,
        topic: signal.topic,
      });
      toast.success(t("share.requestSentToast"));
    } catch {
      toast.error(t("share.requestFailedToast"));
    } finally {
      setRequesting(false);
    }
  }

  return (
    <button
      type="button"
      className="live-control live-control--share-request"
      aria-label={t("share.requestAria")}
      title={t("share.requestTitle")}
      disabled={requesting}
      onClick={requestShare}
    >
      <MonitorUp size={19} />
      <span className="live-control-request-dot" aria-hidden="true" />
    </button>
  );
}

function ShareRequestListener({ lessonId, enabled }: { lessonId: string; enabled: boolean }) {
  const room = useRoomContext();
  const { mutate: grantShare } = useAllowShare(lessonId);

  useEffect(() => {
    if (!enabled) return;

    function receive(
      payload: Uint8Array,
      participant: Participant | undefined,
      _kind: unknown,
      topic?: string
    ) {
      const request = decodeScreenShareRequest(payload, topic);
      if (!request || !participant) return;
      const identity = participant.identity;
      const name = request.name || participant.name || identity;

      toast(i18n.t("live:share.requestNotifyTitle", { name }), {
        description: i18n.t("live:share.requestNotifyDescription"),
        duration: 12_000,
        action: {
          label: i18n.t("live:share.grantAction"),
          onClick: () => grantShare(identity),
        },
      });
    }

    room.on(RoomEvent.DataReceived, receive);
    return () => {
      room.off(RoomEvent.DataReceived, receive);
    };
  }, [enabled, grantShare, room]);

  return null;
}

export interface LiveRoomProps {
  lesson: Lesson;
  isTeacher: boolean;
  /**
   * Pre-join'da `getDisplayMedia` orqali olingan, o'qituvchining butun
   * ekrani/tabi — dars video yozuvi doim shundan olinadi (kim gapirsa, kim
   * ekran ulashsa, kim kamerasini yoqsa — hammasi yoziladi). Pre-join uni
   * MAJBURIY qiladi (ruxsat berilmasa kirish bloklanadi), shuning uchun bu
   * yerda har doim mavjud.
   *
   * "Ekranni ulashish" tugmasi (pastda, `TeacherShareControl`) — YANGI
   * `getDisplayMedia` SO'RAMAYDI, aynan shu oqimni LiveKit xonasiga
   * chop etadi/olib tashlaydi (2026-09-05: ilgari alohida so'rov edi,
   * ikkalasi bir xil tabni tanlasa brauzer ikkita mustaqil "Sharing..."
   * banner ko'rsatardi). Ya'ni yozuv va jonli ko'rsatish endi BITTA ruxsat
   * bilan ishlaydi — biri to'xtasa, ikkinchisi ham to'xtaydi.
   */
  screenStream: MediaStream | null;
  onLeave: () => void;
}

export function LiveRoom({ lesson, isTeacher, screenStream, onLeave }: LiveRoomProps) {
  const { t } = useTranslation("live");
  const connectionLabels = useConnectionLabels();
  const audioRecordingLabels = useAudioRecordingLabels();
  const videoRecordingLabels = useVideoRecordingLabels();
  const [panel, setPanel] = useState<SidePanel>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  /**
   * Faqat "Chiqish" (o'zi darsdan chiqish) bilan darsni "Yakunlash" (hamma
   * uchun tugatish, video yozuv finalize qilinadi) alohida amallar —
   * ilgari o'qituvchi uchun bularning ikkinchisi jonli dars ekranida
   * umuman yo'q edi (faqat alohida sahifadagi darslar ro'yxatida bor edi),
   * shuning uchun o'qituvchi shunchaki "Chiqish"ni bosib ketsa, dars hech
   * qachon rasman yakunlanmas va video yozuv abadiy tugallanmas edi
   * (production'da topilgan xato, 2026-09-05).
   */
  const [finishOpen, setFinishOpen] = useState(false);
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const room = useRoomContext();
  const attention = useAttentionCheck(lesson.id, !isTeacher);
  const mic = useMicSignals(lesson.id, isTeacher);
  const camera = useCameraSignals(lesson.id, isTeacher);
  useFocusTracker(lesson.id, !isTeacher);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  const audioTrackReferences = useTracks(
    [Track.Source.Microphone, Track.Source.ScreenShareAudio],
    { onlySubscribed: false }
  );
  const audioMediaTracks = useMemo(
    () =>
      audioTrackReferences.flatMap((trackReference) => {
        const mediaTrack = trackReference.publication.track?.mediaStreamTrack;
        return mediaTrack ? [mediaTrack] : [];
      }),
    [audioTrackReferences]
  );
  const screenTracks = tracks.filter((track) => track.source === Track.Source.ScreenShare);
  const cameraTracks = tracks.filter((track) => track.source === Track.Source.Camera);
  const activeShare = screenTracks[0] ?? null;
  /** "Ishtirokchilar" tugmasidagi nishoncha — mikrofon va kamera so'rovlari birgalikda. */
  const pendingRequestsCount = mic.requests.length + camera.requests.length;

  /*
   * `connectionState` ilgari shu yerda tekshirilardi ("Reconnecting paytida
   * ikkinchi sessiya ochilmasin" niyati bilan), lekin amalda LiveKit
   * ulanishi qisqa muddatga `Disconnected` holatiga TUSHIB QAYTGANDA ham,
   * bu `enabled`ni yolg'onga aylantirib, recorder sessiyasini TO'LIQ qayta
   * boshlatib yuborardi — natijada bir nechta mustaqil WebM segmenti xom
   * ulanib, yakuniy faylda ikkinchi segmentdan keyin qidirish/pauza qotib
   * qolardi (production, 2026-09-01). Yozib olish LiveKit ulanishiga
   * bog'liq emas (video — brauzerning o'zi, audio — mahalliy mikser),
   * shuning uchun endi faqat `isTeacher`ga qaraymiz — sessiya faqat dars
   * haqiqatan tugaganda (komponent unmount) to'xtaydi.
   */
  const audioRecording = useTeacherAudioRecording(lesson.id, audioMediaTracks, isTeacher);
  /**
   * `screenStream` endi audio trekni ham o'z ichiga oladi (jonli "Ekranni
   * ulashish" uchun qayta ishlatiladi, yuqoridagi izohga qarang) — lekin
   * video yozuvi ilgarigidek FAQAT video trekni yozishi kerak (audio allaqachon
   * alohida, Web Audio mikser orqali yoziladi — ikkalasini ham video faylga
   * qo'shish ortiqcha va backend birlashtirishda baribir e'tiborga olinmaydi).
   */
  const screenVideoOnlyStream = useMemo(() => {
    const videoTrack = screenStream?.getVideoTracks()[0];
    return videoTrack ? new MediaStream([videoTrack]) : null;
  }, [screenStream]);
  const videoRecording = useTeacherVideoRecording(lesson.id, screenVideoOnlyStream, isTeacher);

  const togglePanel = (next: Exclude<SidePanel, null>) =>
    setPanel((current) => (current === next ? null : next));
  const boardFull = panel === "board";

  return (
    <div
      className={`live-room ${panel ? "has-panel" : ""} ${boardFull ? "is-board-full" : ""}`}
      data-lk-theme="default"
    >
      <header className="live-room-topbar">
        <div className="live-room-identity">
          <span className={`live-dot live-dot--${connectionState}`} aria-hidden="true" />
          <div>
            <strong>{lesson.title}</strong>
            <small>
              {lesson.courseTitle} · {connectionLabels[connectionState] ?? connectionState}
            </small>
          </div>
        </div>
        <div className="live-room-topbar-actions">
          {isTeacher ? (
            <span
              className={`live-audio-recording live-audio-recording--${audioRecording.phase}`}
              title={audioRecording.error ?? audioRecordingLabels[audioRecording.phase]}
              role={audioRecording.phase === "error" ? "alert" : "status"}
            >
              <span className="live-audio-recording-dot" aria-hidden="true" />
              <span>{audioRecordingLabels[audioRecording.phase]}</span>
              {audioRecording.pendingChunks ? (
                <b aria-label={t("room.pendingChunksAria", { count: audioRecording.pendingChunks })}>
                  {audioRecording.pendingChunks}
                </b>
              ) : null}
            </span>
          ) : null}
          {isTeacher && screenStream ? (
            <span
              className={`live-video-recording live-video-recording--${videoRecording.phase}`}
              title={videoRecording.error ?? videoRecordingLabels[videoRecording.phase]}
              role={videoRecording.phase === "error" ? "alert" : "status"}
            >
              <span className="live-video-recording-dot" aria-hidden="true" />
              <span>{videoRecordingLabels[videoRecording.phase]}</span>
              {videoRecording.pendingChunks ? (
                <b aria-label={t("room.pendingChunksAria", { count: videoRecording.pendingChunks })}>
                  {videoRecording.pendingChunks}
                </b>
              ) : null}
            </span>
          ) : null}
          <span className="live-room-count">
            <Users size={15} /> {participants.length}
          </span>
          {isTeacher ? (
            <button
              className="icon-button"
              onClick={() => setInviteOpen(true)}
              aria-label={t("room.inviteAria")}
              title={t("room.inviteAria")}
            >
              <UserRoundPlus size={19} />
            </button>
          ) : null}
          <button className="icon-button" onClick={onLeave} aria-label={t("room.leaveAria")}>
            <X size={19} />
          </button>
        </div>
      </header>

      <div className="live-room-body">
        {!boardFull ? (
          <main className={`live-room-stage ${activeShare ? "has-presentation" : ""}`}>
            {activeShare ? (
              <div className="live-presentation-layout">
                <div className="live-presentation-stage">
                  <ParticipantTile trackRef={activeShare} />
                </div>
                <div className="live-camera-filmstrip" aria-label={t("room.filmstripAria")}>
                  {cameraTracks.map((track) => (
                    <CameraTile
                      key={`${track.participant.identity}-${track.source}`}
                      track={track}
                      compact
                    />
                  ))}
                </div>
              </div>
            ) : cameraTracks.length ? (
              <div className="live-camera-grid">
                {cameraTracks.map((track) => (
                  <CameraTile key={`${track.participant.identity}-${track.source}`} track={track} />
                ))}
              </div>
            ) : (
              <div className="live-room-empty">
                <Video size={30} />
                <p>{t("room.empty")}</p>
              </div>
            )}
          </main>
        ) : null}

        {panel ? (
          <aside className="live-room-panel" aria-label={t("room.sidePanelAria")}>
            <nav className="live-room-panel-tabs">
              {/*
                Doska to'liq ekranda video butunlay yashiriladi (`boardFull`),
                shuning uchun "Ishtirokchilar"ni bosib videoga qaytish odat
                bo'lib qolgan edi — nomi esa buni bildirmasdi. Endi videoga
                qaytish uchun alohida, aniq nomlangan tugma bor.
              */}
              <button onClick={() => setPanel(null)}>
                <Video size={16} /> {t("room.backToVideo")}
              </button>
              <button
                className={panel === "board" ? "is-active" : ""}
                onClick={() => setPanel("board")}
              >
                <LayoutDashboard size={16} /> {t("room.board")}
              </button>
              <button
                className={panel === "people" ? "is-active" : ""}
                onClick={() => setPanel("people")}
              >
                <Users size={16} /> {t("room.participants")}
              </button>
              <button className="icon-button" onClick={() => setPanel(null)} aria-label={t("room.closePanelAria")}>
                <X size={17} />
              </button>
            </nav>
            <div className="live-room-panel-body">
              {panel === "board" ? (
                <BoardPanel
                  lessonId={lesson.id}
                  courseId={lesson.courseId}
                  currentUserId={room.localParticipant.identity}
                />
              ) : (
                <ParticipantsPanel
                  lessonId={lesson.id}
                  isTeacher={isTeacher}
                  micRequests={mic.requests}
                  onGrantMic={mic.grant.mutate}
                  onDenyMic={mic.deny.mutate}
                  micAnswerPending={mic.grant.isPending || mic.deny.isPending}
                  cameraRequests={camera.requests}
                  onGrantCamera={camera.grant.mutate}
                  onDenyCamera={camera.deny.mutate}
                  cameraAnswerPending={camera.grant.isPending || camera.deny.isPending}
                />
              )}
            </div>
          </aside>
        ) : null}
      </div>

      <footer className="live-room-controls">
        {isTeacher ? (
          <TeacherMicControl />
        ) : (
          <StudentMicControl
            onRequest={mic.requestMic}
            requesting={mic.requesting}
            waiting={mic.waiting}
          />
        )}
        {isTeacher ? (
          <TeacherCameraControl />
        ) : (
          <StudentCameraControl
            onRequest={camera.requestCamera}
            requesting={camera.requesting}
            waiting={camera.waiting}
          />
        )}
        {isTeacher ? (
          screenStream && <TeacherShareControl screenStream={screenStream} />
        ) : (
          <StudentShareControl />
        )}

        <span className="live-control-divider" aria-hidden="true" />

        <button
          className={`live-control ${panel === "board" ? "is-active" : ""}`}
          onClick={() => togglePanel("board")}
          aria-label={t("room.openBoardAria")}
          aria-pressed={panel === "board"}
        >
          <LayoutDashboard size={19} />
        </button>
        <button
          className={`live-control ${panel === "people" ? "is-active" : ""}`}
          onClick={() => togglePanel("people")}
          aria-label={
            pendingRequestsCount
              ? t("room.participantsWithRequestsAria", { count: pendingRequestsCount })
              : t("room.participants")
          }
          aria-pressed={panel === "people"}
        >
          <Users size={19} />
          {/* So'rov kelganini o'qituvchi panelni ochmasdan ham sezishi kerak. */}
          {pendingRequestsCount ? (
            <span className="live-control-badge">{pendingRequestsCount}</span>
          ) : null}
        </button>

        <DisconnectButton className="live-control live-control--leave">
          <PhoneOff size={19} />
          <span>{t("room.leave")}</span>
        </DisconnectButton>

        {isTeacher ? (
          <button
            type="button"
            className="live-control live-control--finish"
            aria-label={t("room.finishAria")}
            title={t("room.finishTitle")}
            onClick={() => setFinishOpen(true)}
          >
            <CircleStop size={19} />
            <span>{t("room.finish")}</span>
          </button>
        ) : null}
      </footer>

      <AwayStudentsNotice lessonId={lesson.id} enabled={isTeacher} />

      {isTeacher ? (
        <LessonInviteDialog
          lessonId={lesson.id}
          courseId={lesson.courseId}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      ) : null}

      {isTeacher ? (
        <FinishLessonDialog
          lesson={finishOpen ? lesson : null}
          onOpenChange={(open) => setFinishOpen(open)}
          onFinished={onLeave}
        />
      ) : null}

      <RoomAudioRenderer />
      <ShareRequestListener lessonId={lesson.id} enabled={isTeacher} />
      {!isTeacher ? <AttentionCheckDialog lessonId={lesson.id} check={attention.data} /> : null}
    </div>
  );
}

interface ParticipantsPanelProps {
  lessonId: string;
  isTeacher: boolean;
  micRequests: MicRequest[];
  onGrantMic: (studentId: string) => void;
  onDenyMic: (studentId: string) => void;
  micAnswerPending: boolean;
  cameraRequests: CameraRequest[];
  onGrantCamera: (studentId: string) => void;
  onDenyCamera: (studentId: string) => void;
  cameraAnswerPending: boolean;
}

function ParticipantsPanel({
  lessonId,
  isTeacher,
  micRequests,
  onGrantMic,
  onDenyMic,
  micAnswerPending,
  cameraRequests,
  onGrantCamera,
  onDenyCamera,
  cameraAnswerPending,
}: ParticipantsPanelProps) {
  const { t } = useTranslation("live");
  const participants = useParticipants();
  const allowShare = useAllowShare(lessonId);
  const ban = useBanFromLesson(lessonId);

  return (
    <div className="live-participants">
      {micRequests.length ? (
        <section className="live-mic-requests" aria-label={t("participantsPanel.micRequestsAria")}>
          <h4>
            <Hand size={14} /> {t("participantsPanel.wantsToSpeak", { count: micRequests.length })}
          </h4>
          {/* Navbat FIFO: ro'yxat kelish tartibida, birinchi so'ragan tepada. */}
          {micRequests.map((request, index) => (
            <article key={request.studentId}>
              <span className="live-mic-queue-number" aria-hidden="true">
                {index + 1}
              </span>
              <Avatar name={request.name} size="sm" />
              <div>
                <strong>{request.name}</strong>
                <small>{t("participantsPanel.micRequesting")}</small>
              </div>
              <Button
                size="sm"
                disabled={micAnswerPending}
                onClick={() => onGrantMic(request.studentId)}
              >
                {t("participantsPanel.grant")}
              </Button>
              <button
                type="button"
                className="icon-button destructive-icon"
                aria-label={t("participantsPanel.denyAria", { name: request.name })}
                title={t("participantsPanel.denyTitle")}
                disabled={micAnswerPending}
                onClick={() => onDenyMic(request.studentId)}
              >
                <X size={16} />
              </button>
            </article>
          ))}
        </section>
      ) : null}
      {cameraRequests.length ? (
        <section className="live-mic-requests" aria-label={t("participantsPanel.cameraRequestsAria")}>
          <h4>
            <Video size={14} /> {t("participantsPanel.wantsCamera", { count: cameraRequests.length })}
          </h4>
          {/* Navbat FIFO: ro'yxat kelish tartibida, birinchi so'ragan tepada. */}
          {cameraRequests.map((request, index) => (
            <article key={request.studentId}>
              <span className="live-mic-queue-number" aria-hidden="true">
                {index + 1}
              </span>
              <Avatar name={request.name} size="sm" />
              <div>
                <strong>{request.name}</strong>
                <small>{t("participantsPanel.cameraRequesting")}</small>
              </div>
              <Button
                size="sm"
                disabled={cameraAnswerPending}
                onClick={() => onGrantCamera(request.studentId)}
              >
                {t("participantsPanel.grant")}
              </Button>
              <button
                type="button"
                className="icon-button destructive-icon"
                aria-label={t("participantsPanel.denyAria", { name: request.name })}
                title={t("participantsPanel.denyTitle")}
                disabled={cameraAnswerPending}
                onClick={() => onDenyCamera(request.studentId)}
              >
                <X size={16} />
              </button>
            </article>
          ))}
        </section>
      ) : null}
      {participants.map((participant) => (
        <article key={participant.identity}>
          <Avatar name={participant.name || participant.identity} size="sm" />
          <div>
            <strong>{participant.name || participant.identity}</strong>
            <small>{participant.isLocal ? t("participantsPanel.you") : t("participantsPanel.participant")}</small>
          </div>
          {isTeacher && !participant.isLocal ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                loading={allowShare.isPending}
                onClick={() => allowShare.mutate(participant.identity)}
              >
                <MonitorUp size={15} /> {t("participantsPanel.allowShare")}
              </Button>
              {/* LiveKit identity — backend token'da o'quvchi id'si sifatida
                  beriladi, ban ham shu id'ni kutadi. */}
              <button
                className="icon-button destructive-icon"
                aria-label={t("participantsPanel.banAria", {
                  name: participant.name || participant.identity,
                })}
                title={t("participantsPanel.banTitle")}
                disabled={ban.isPending}
                onClick={() => ban.mutate(participant.identity)}
              >
                <UserRoundX size={16} />
              </button>
            </>
          ) : null}
        </article>
      ))}
      {!participants.length ? <p className="portal-muted">{t("participantsPanel.empty")}</p> : null}
    </div>
  );
}
