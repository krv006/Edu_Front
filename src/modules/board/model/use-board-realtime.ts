import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { SocketState } from "@/shared/api";
import type { BoardState, StrokeDto } from "../api/board.dto";
import { BoardSocketManager, type BoardSocketEvent } from "../lib/board-socket-manager";
import { boardKeys } from "./board.queries";

/** Sahifadagi stroke ro'yxatini o'zgartiradigan sof yordamchi. */
function updateSheet(
  state: BoardState,
  index: number,
  update: (strokes: StrokeDto[]) => StrokeDto[]
): BoardState {
  return {
    ...state,
    sheets: state.sheets.map((sheet) =>
      sheet.index === index ? { ...sheet, strokes: update(sheet.strokes) } : sheet
    ),
  };
}

function applyEvent(state: BoardState | undefined, event: BoardSocketEvent): BoardState | undefined {
  if (!state) return state;

  switch (event.type) {
    case "stroke":
      return updateSheet(state, event.sheet, (strokes) =>
        // Bir xil stroke REST javobi bilan ham kelishi mumkin — takrorlamaymiz.
        strokes.some((item) => item.id === event.stroke.id) ? strokes : [...strokes, event.stroke]
      );

    case "erase":
      return updateSheet(state, event.sheet, (strokes) =>
        strokes.filter((item) => !event.strokeIds.includes(item.id))
      );

    case "sheet":
      return state.sheets.some((sheet) => sheet.index === event.index)
        ? state
        : { ...state, sheets: [...state.sheets, { index: event.index, strokes: [] }] };

    default:
      return state;
  }
}

/**
 * Doska real-time kanali (docs/PROJECT.md §5.2).
 *
 * Kelgan hodisalarni to'g'ridan-to'g'ri react-query keshiga qo'llaydi, shuning uchun
 * `useBoard` qayta so'rov yubormaydi. Kanal ulanmasa (masalan server `/ws/*` ni
 * proksilamasa) `connected` `false` bo'ladi va `useBoard` pollingga qaytadi.
 */
export function useBoardRealtime(lessonId: string, enabled = true) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SocketState>("idle");

  const socket = useMemo(
    () =>
      enabled && lessonId
        ? new BoardSocketManager({
            lessonId,
            onState: setState,
            onEvent: (event) => {
              if (event.type === "error") return;
              queryClient.setQueryData<BoardState>(boardKeys.state(lessonId), (current) =>
                applyEvent(current, event)
              );
            },
          })
        : null,
    [enabled, lessonId, queryClient]
  );

  useEffect(() => {
    socket?.start();
    return () => socket?.stop();
  }, [socket]);

  return { socket, state, connected: state === "connected" };
}
