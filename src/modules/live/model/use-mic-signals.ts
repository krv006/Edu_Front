import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalParticipantPermissions, useRoomContext } from "@livekit/components-react";
import { toast } from "sonner";
import { useBoardChannel, type BoardSocketEvent } from "@/modules/board";
import { canPublishSource, MICROPHONE_SOURCE } from "../lib/live-permissions";
import { useDenyMic, useGrantMic, useRequestMic } from "./live.queries";

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
 * Navbat FIFO: birinchi so'ragan birinchi turadi. So'rov navbatdan faqat ikki
 * holatda chiqadi — ruxsat berilsa yoki rad etilsa; shundan keyingina o'quvchi
 * qayta so'ray oladi.
 */
export function useMicSignals(lessonId: string, isTeacher: boolean) {
  const room = useRoomContext();
  const permissions = useLocalParticipantPermissions();
  const grant = useGrantMic(lessonId);
  const deny = useDenyMic(lessonId);
  const request = useRequestMic(lessonId);

  const [requests, setRequests] = useState<MicRequest[]>([]);
  /** O'quvchida: so'rov yuborilgan, javob kutilmoqda (takror so'rash bloklanadi). */
  const [waiting, setWaiting] = useState(false);

  const canSpeak = canPublishSource(permissions, MICROPHONE_SOURCE);
  /** Ruxsat keldi-yu, LiveKit huquqlari hali yetib kelmadi — yetganda yoqamiz. */
  const pendingEnable = useRef(false);

  const enableMic = useCallback(() => {
    room.localParticipant.setMicrophoneEnabled(true).catch(() => undefined);
  }, [room]);

  const { mutate: grantMic } = grant;
  const { mutate: denyMic } = deny;

  /** Signal aynan shu foydalanuvchi haqidami (token'da identity — o'quvchi id'si). */
  const isMine = useCallback(
    (studentId: string) => !isTeacher && studentId === room.localParticipant.identity,
    [isTeacher, room]
  );

  const handleEvent = useCallback(
    (event: BoardSocketEvent) => {
      if (event.type === "mic_request") {
        // O'quvchiga boshqa o'quvchining so'rovi ko'rinmasligi kerak.
        if (!isTeacher) return;
        const incoming: MicRequest = { studentId: event.studentId, name: event.name || "O‘quvchi" };
        setRequests((current) =>
          // Bitta o'quvchi bir vaqtda bitta so'rovga ega — takrorini qo'shmaymiz.
          // Yangisi oxiriga qo'shiladi: navbat kelish tartibida turadi.
          current.some((item) => item.studentId === incoming.studentId)
            ? current
            : [...current, incoming]
        );
        toast(`${incoming.name} gapirmoqchi`, {
          description: "Mikrofon uchun ruxsat so‘rayapti.",
          duration: 12_000,
          action: { label: "Ruxsat berish", onClick: () => grantMic(incoming.studentId) },
          cancel: { label: "Rad etish", onClick: () => denyMic(incoming.studentId) },
        });
        return;
      }

      if (event.type !== "mic_granted" && event.type !== "mic_denied") return;

      // Ikkala javob ham so'rovni navbatdan chiqaradi.
      setRequests((current) => current.filter((item) => item.studentId !== event.studentId));
      if (!isMine(event.studentId)) return;
      setWaiting(false);

      if (event.type === "mic_denied") {
        toast.error("O‘qituvchi hozircha ruxsat bermadi");
        return;
      }

      toast.success("O‘qituvchi mikrofoningizni yoqdi");
      if (canSpeak) enableMic();
      else pendingEnable.current = true;
    },
    [canSpeak, denyMic, enableMic, grantMic, isMine, isTeacher]
  );

  useBoardChannel(lessonId, Boolean(lessonId), handleEvent);

  // Huquqlar server tomondan yangilanadi — signal bilan bir vaqtda kelmasligi mumkin.
  useEffect(() => {
    if (!pendingEnable.current || !canSpeak) return;
    pendingEnable.current = false;
    enableMic();
  }, [canSpeak, enableMic]);

  const { mutate: sendRequest } = request;
  const requestMic = useCallback(
    () => sendRequest(undefined, { onSuccess: () => setWaiting(true) }),
    [sendRequest]
  );

  return {
    /** O'qituvchi uchun: navbat (FIFO) va javob berish. */
    requests,
    grant,
    deny,
    /** O'quvchi uchun: so'rov yuborish va kutish holati. */
    requestMic,
    requesting: request.isPending,
    waiting,
  };
}
