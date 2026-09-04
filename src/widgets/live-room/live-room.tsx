import { useEffect, useMemo, useState } from "react";
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
import { AwayStudentsNotice, BoardPanel } from "@/modules/board";
import {
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

const CONNECTION_LABELS: Record<string, string> = {
  [ConnectionState.Connecting]: "Ulanmoqda…",
  [ConnectionState.Connected]: "Ulandi",
  [ConnectionState.Reconnecting]: "Qayta ulanmoqda…",
  [ConnectionState.Disconnected]: "Uzildi",
};

const AUDIO_RECORDING_LABELS: Record<TeacherAudioRecordingSnapshot["phase"], string> = {
  idle: "Audio tayyorlanmoqda",
  recording: "Audio yozilmoqda",
  uploading: "Audio yuborilmoqda",
  retrying: "Audio navbatda",
  stopped: "Audio saqlandi",
  unsupported: "Audio yozuv mavjud emas",
  error: "Audio yozuvda xato",
};

const VIDEO_RECORDING_LABELS: Record<TeacherVideoRecordingSnapshot["phase"], string> = {
  idle: "Video tayyorlanmoqda",
  recording: "Video yozilmoqda",
  uploading: "Video yuborilmoqda",
  retrying: "Video navbatda",
  stopped: "Video saqlandi",
  unsupported: "Video yozuv mavjud emas",
  error: "Video yozuvda xato",
};

function CameraTile({
  track,
  compact = false,
}: {
  track: TrackReferenceOrPlaceholder;
  compact?: boolean;
}) {
  const publication = "publication" in track ? track.publication : undefined;
  const cameraOff = !publication || publication.isMuted;
  const name = track.participant.name || track.participant.identity;

  return (
    <article
      className={`live-camera-tile ${compact ? "is-compact" : ""} ${cameraOff ? "is-camera-off" : ""}`}
    >
      <ParticipantTile trackRef={track} disableSpeakingIndicator={cameraOff} />
      {cameraOff ? (
        <div className="live-camera-placeholder" aria-label={`${name} kamerasi o‘chiq`}>
          <Avatar name={name} size={compact ? "sm" : "md"} />
        </div>
      ) : null}
      <span className="live-camera-name">
        {track.participant.isLocal ? `${name} (Siz)` : name}
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
  const permissions = useLocalParticipantPermissions();
  const canSpeak = canPublishSource(permissions, MICROPHONE_SOURCE);

  if (canSpeak) {
    return (
      <TrackToggle
        source={Track.Source.Microphone}
        showIcon={false}
        className="live-control"
        aria-label="Mikrofon"
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
      aria-label={waiting ? "So‘rov yuborildi, javob kutilmoqda" : "Gapirish uchun ruxsat so‘rash"}
      title={
        waiting
          ? "So‘rov yuborildi — o‘qituvchi javobini kuting"
          : "Gapirish uchun ruxsat so‘rash"
      }
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
  const permissions = useLocalParticipantPermissions();

  if (canPublishSource(permissions, MICROPHONE_SOURCE)) {
    return (
      <TrackToggle
        source={Track.Source.Microphone}
        showIcon={false}
        className="live-control"
        aria-label="Mikrofon"
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
      aria-label="Mikrofon ishlamayapti"
      title="Server tokenida mikrofon ruxsati yo‘q — texnik jamoaga xabar bering"
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
  const permissions = useLocalParticipantPermissions();
  const canPublishCamera = canPublishSource(permissions, CAMERA_SOURCE);

  if (canPublishCamera) {
    return (
      <TrackToggle
        source={Track.Source.Camera}
        showIcon={false}
        className="live-control"
        aria-label="Kamera"
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
      aria-label={waiting ? "So‘rov yuborildi, javob kutilmoqda" : "Kamera uchun ruxsat so‘rash"}
      title={
        waiting
          ? "So‘rov yuborildi — o‘qituvchi javobini kuting"
          : "Kamera uchun ruxsat so‘rash"
      }
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
  const permissions = useLocalParticipantPermissions();

  if (canPublishSource(permissions, CAMERA_SOURCE)) {
    return (
      <TrackToggle
        source={Track.Source.Camera}
        showIcon={false}
        className="live-control"
        aria-label="Kamera"
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
      aria-label="Kamera ishlamayapti"
      title="Server tokenida kamera ruxsati yo‘q — texnik jamoaga xabar bering"
    >
      <VideoOff size={19} />
    </button>
  );
}

function StudentShareControl() {
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
        aria-label="Ekranni ulashish"
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
      toast.success("Ekran ulashish so‘rovi o‘qituvchiga yuborildi");
    } catch {
      toast.error("So‘rovni yuborib bo‘lmadi");
    } finally {
      setRequesting(false);
    }
  }

  return (
    <button
      type="button"
      className="live-control live-control--share-request"
      aria-label="Ekran ulashish uchun ruxsat so‘rash"
      title="Ekran ulashish uchun ruxsat so‘rash"
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

      toast(`${name} ekran ulashmoqchi`, {
        description: "O‘quvchiga ekran ulashish uchun ruxsat berasizmi?",
        duration: 12_000,
        action: {
          label: "Ruxsat berish",
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
   * ekrani/tabi — dars video yozuvi shundan olinadi. QASDDAN "Ekranni
   * ulashish" (`Track.Source.ScreenShare`, pastda) trekidan MUSTAQIL:
   * o'qituvchining butun ko'rinishini suratga oladi (kim ulashsa ham —
   * boshqa ishtirokchining ekrani, kamerasi — hammasi yoziladi), faqat
   * o'qituvchining o'z chiquvchi trekini emas. Pre-join uni MAJBURIY
   * qiladi (ruxsat berilmasa kirish bloklanadi), shuning uchun bu yerda
   * har doim mavjud.
   */
  screenStream: MediaStream | null;
  onLeave: () => void;
}

export function LiveRoom({ lesson, isTeacher, screenStream, onLeave }: LiveRoomProps) {
  const [panel, setPanel] = useState<SidePanel>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
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
  const videoRecording = useTeacherVideoRecording(lesson.id, screenStream, isTeacher);

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
              {lesson.courseTitle} · {CONNECTION_LABELS[connectionState] ?? connectionState}
            </small>
          </div>
        </div>
        <div className="live-room-topbar-actions">
          {isTeacher ? (
            <span
              className={`live-audio-recording live-audio-recording--${audioRecording.phase}`}
              title={audioRecording.error ?? AUDIO_RECORDING_LABELS[audioRecording.phase]}
              role={audioRecording.phase === "error" ? "alert" : "status"}
            >
              <span className="live-audio-recording-dot" aria-hidden="true" />
              <span>{AUDIO_RECORDING_LABELS[audioRecording.phase]}</span>
              {audioRecording.pendingChunks ? (
                <b aria-label={`${audioRecording.pendingChunks} ta bo‘lak navbatda`}>
                  {audioRecording.pendingChunks}
                </b>
              ) : null}
            </span>
          ) : null}
          {isTeacher && screenStream ? (
            <span
              className={`live-video-recording live-video-recording--${videoRecording.phase}`}
              title={videoRecording.error ?? VIDEO_RECORDING_LABELS[videoRecording.phase]}
              role={videoRecording.phase === "error" ? "alert" : "status"}
            >
              <span className="live-video-recording-dot" aria-hidden="true" />
              <span>{VIDEO_RECORDING_LABELS[videoRecording.phase]}</span>
              {videoRecording.pendingChunks ? (
                <b aria-label={`${videoRecording.pendingChunks} ta bo‘lak navbatda`}>
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
              aria-label="Darsga taklif qilish"
              title="Darsga taklif qilish"
            >
              <UserRoundPlus size={19} />
            </button>
          ) : null}
          <button className="icon-button" onClick={onLeave} aria-label="Darsdan chiqish">
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
                <div className="live-camera-filmstrip" aria-label="Ishtirokchilar videolari">
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
                <p>Kamera oqimi hali yo‘q</p>
              </div>
            )}
          </main>
        ) : null}

        {panel ? (
          <aside className="live-room-panel" aria-label="Yon panel">
            <nav className="live-room-panel-tabs">
              <button
                className={panel === "board" ? "is-active" : ""}
                onClick={() => setPanel("board")}
              >
                <LayoutDashboard size={16} /> Doska
              </button>
              <button
                className={panel === "people" ? "is-active" : ""}
                onClick={() => setPanel("people")}
              >
                <Users size={16} /> Ishtirokchilar
              </button>
              <button className="icon-button" onClick={() => setPanel(null)} aria-label="Panelni yopish">
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
          <TrackToggle
            source={Track.Source.ScreenShare}
            // Joriy tab (shu darsning o'zi) tanlov ro'yxatidan chiqarilgan —
            // aks sado effektining oldini oladi (yuqoridagi izohga qarang).
            captureOptions={{ audio: true, selfBrowserSurface: "exclude" }}
            showIcon={false}
            className="live-control live-control--share"
            aria-label="Ekranni ulashish"
          >
            <MonitorUp size={19} />
          </TrackToggle>
        ) : (
          <StudentShareControl />
        )}

        <span className="live-control-divider" aria-hidden="true" />

        <button
          className={`live-control ${panel === "board" ? "is-active" : ""}`}
          onClick={() => togglePanel("board")}
          aria-label="Doskani ochish"
          aria-pressed={panel === "board"}
        >
          <LayoutDashboard size={19} />
        </button>
        <button
          className={`live-control ${panel === "people" ? "is-active" : ""}`}
          onClick={() => togglePanel("people")}
          aria-label={
            pendingRequestsCount
              ? `Ishtirokchilar — ${pendingRequestsCount} ta so‘rov`
              : "Ishtirokchilar"
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
          <span>Chiqish</span>
        </DisconnectButton>
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
  const participants = useParticipants();
  const allowShare = useAllowShare(lessonId);
  const ban = useBanFromLesson(lessonId);

  return (
    <div className="live-participants">
      {micRequests.length ? (
        <section className="live-mic-requests" aria-label="Mikrofon so‘ragan o‘quvchilar">
          <h4>
            <Hand size={14} /> Gapirmoqchi ({micRequests.length})
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
                <small>Mikrofon so‘rayapti</small>
              </div>
              <Button
                size="sm"
                disabled={micAnswerPending}
                onClick={() => onGrantMic(request.studentId)}
              >
                Ruxsat
              </Button>
              <button
                type="button"
                className="icon-button destructive-icon"
                aria-label={`${request.name} so‘rovini rad etish`}
                title="Rad etish"
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
        <section className="live-mic-requests" aria-label="Kamera so‘ragan o‘quvchilar">
          <h4>
            <Video size={14} /> Kamerani yoqmoqchi ({cameraRequests.length})
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
                <small>Kamera so‘rayapti</small>
              </div>
              <Button
                size="sm"
                disabled={cameraAnswerPending}
                onClick={() => onGrantCamera(request.studentId)}
              >
                Ruxsat
              </Button>
              <button
                type="button"
                className="icon-button destructive-icon"
                aria-label={`${request.name} so‘rovini rad etish`}
                title="Rad etish"
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
            <small>{participant.isLocal ? "Siz" : "Ishtirokchi"}</small>
          </div>
          {isTeacher && !participant.isLocal ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                loading={allowShare.isPending}
                onClick={() => allowShare.mutate(participant.identity)}
              >
                <MonitorUp size={15} /> Ruxsat
              </Button>
              {/* LiveKit identity — backend token'da o'quvchi id'si sifatida
                  beriladi, ban ham shu id'ni kutadi. */}
              <button
                className="icon-button destructive-icon"
                aria-label={`${participant.name || participant.identity}ni darsdan chetlashtirish`}
                title="Darsdan chetlashtirish"
                disabled={ban.isPending}
                onClick={() => ban.mutate(participant.identity)}
              >
                <UserRoundX size={16} />
              </button>
            </>
          ) : null}
        </article>
      ))}
      {!participants.length ? <p className="portal-muted">Hozircha hech kim yo‘q.</p> : null}
    </div>
  );
}
