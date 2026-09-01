import { useEffect, useRef, useState } from "react";
import {
  createTeacherVideoRecording,
  releaseTeacherVideoRecording,
  type TeacherVideoRecordingSession,
  type TeacherVideoRecordingSnapshot,
} from "../lib/teacher-video-recording";

const INITIAL_SNAPSHOT: TeacherVideoRecordingSnapshot = {
  phase: "idle",
  pendingChunks: 0,
  uploadedChunks: 0,
  error: null,
};

/**
 * `stream` — o'qituvchining LiveKit'ga PUBLISH qilingan "Ekranni ulashish"
 * trekidan olingan oqim (`null` bo'lsa ekran ulashish hali yoqilmagan yoki
 * o'chirilgan — bu holda video yozuvi shunchaki ishlamaydi, audio davom
 * etadi). Trek darsning istalgan vaqtida yoqilishi/o'chirilishi mumkin —
 * har safar `stream` `null`dan haqiqiy oqimga o'tganda yangi yozuv sessiyasi
 * boshlanadi (backend bunday ko'p-segmentli fayllarni birlashtirish paytida
 * to'g'ri ulaydi).
 */
export function useTeacherVideoRecording(
  lessonId: string,
  stream: MediaStream | null,
  enabled: boolean
): TeacherVideoRecordingSnapshot {
  const sessionRef = useRef<TeacherVideoRecordingSession | null>(null);
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT);

  useEffect(() => {
    if (!enabled || !stream) return;
    const session = createTeacherVideoRecording(lessonId);
    sessionRef.current = session;
    const unsubscribe = session.subscribe(setSnapshot);
    session.start(stream);

    return () => {
      unsubscribe();
      sessionRef.current = null;
      releaseTeacherVideoRecording(session);
    };
  }, [enabled, lessonId, stream]);

  return snapshot;
}
