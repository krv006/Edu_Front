import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalParticipantPermissions, useRoomContext } from "@livekit/components-react";
import { toast } from "sonner";
import { useBoardChannel, type BoardSocketEvent } from "@/modules/board";
import { canPublishSource, MICROPHONE_SOURCE } from "../lib/live-permissions";
import { useGrantMic } from "./live.queries";

export interface MicRequest {
  studentId: string;
  name: string;
}

/**
 * Mikrofon so'rov/ruxsat signallari (MIC_REQUEST_GRANT.md).
 *
 * Signallar doska kanalidan keladi — dars davomida ochiq turgan yagona kanal
 * shu. Doska paneli yopiq bo'lsa ham ulanish turadi: obunani `useBoardChannel`
 * boshqaradi va ikkala tomon bitta WebSocket'ni bo'lishadi.
 *
 * O'qituvchida — kutayotgan o'quvchilar ro'yxati, o'quvchida — ruxsat kelganda
 * mikrofonni yoqish.
 */
export function useMicSignals(lessonId: string, isTeacher: boolean) {
  const room = useRoomContext();
  const permissions = useLocalParticipantPermissions();
  const grant = useGrantMic(lessonId);
  const [requests, setRequests] = useState<MicRequest[]>([]);

  const canSpeak = canPublishSource(permissions, MICROPHONE_SOURCE);
  /** Ruxsat keldi-yu, LiveKit huquqlari hali yetib kelmadi — yetganda yoqamiz. */
  const pendingEnable = useRef(false);

  const enableMic = useCallback(() => {
    room.localParticipant.setMicrophoneEnabled(true).catch(() => undefined);
  }, [room]);

  const { mutate: grantMic } = grant;

  const handleEvent = useCallback(
    (event: BoardSocketEvent) => {
      if (event.type === "mic_request") {
        // O'quvchiga boshqa o'quvchining so'rovi ko'rinmasligi kerak.
        if (!isTeacher) return;
        const request: MicRequest = { studentId: event.studentId, name: event.name || "O‘quvchi" };
        setRequests((current) =>
          current.some((item) => item.studentId === request.studentId)
            ? current
            : [...current, request]
        );
        toast(`${request.name} gapirmoqchi`, {
          description: "Mikrofon uchun ruxsat so‘rayapti.",
          duration: 12_000,
          action: { label: "Ruxsat berish", onClick: () => grantMic(request.studentId) },
        });
        return;
      }

      if (event.type !== "mic_granted") return;
      setRequests((current) => current.filter((item) => item.studentId !== event.studentId));

      // Ruxsat menikimi? Token'da identity — o'quvchi id'si (live token shartnomasi).
      if (isTeacher || event.studentId !== room.localParticipant.identity) return;
      toast.success("O‘qituvchi mikrofoningizni yoqdi");
      if (canSpeak) enableMic();
      else pendingEnable.current = true;
    },
    [canSpeak, enableMic, grantMic, isTeacher, room]
  );

  useBoardChannel(lessonId, Boolean(lessonId), handleEvent);

  // Huquqlar server tomondan yangilanadi — signal bilan bir vaqtda kelmasligi mumkin.
  useEffect(() => {
    if (!pendingEnable.current || !canSpeak) return;
    pendingEnable.current = false;
    enableMic();
  }, [canSpeak, enableMic]);

  const dismiss = useCallback(
    (studentId: string) =>
      setRequests((current) => current.filter((item) => item.studentId !== studentId)),
    []
  );

  return { requests, grant, dismiss };
}
