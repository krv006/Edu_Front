import { env } from "@/shared/config";
import { refreshTokenManager } from "./refresh-token-manager";
import { tokenStorage } from "./token-storage";

export type SocketState = "idle" | "connecting" | "connected" | "disconnected" | "error";

export interface SocketClosePolicy {
  refresh: boolean;
  reconnect: boolean;
}

/**
 * Yopilish kodlari (docs/PROJECT.md §5) — chat va doska kanallari uchun bir xil:
 * `4401` — token yaroqsiz (refresh qilib qayta ulanamiz),
 * `4403` — xonaga a'zo emas (qayta urinmaymiz).
 */
export function getSocketClosePolicy(code: number): SocketClosePolicy {
  if (code === 4403) return { refresh: false, reconnect: false };
  if (code === 4401) return { refresh: true, reconnect: true };
  return { refresh: false, reconnect: true };
}

export interface RealtimeSocketInit {
  /** JWT'siz yo'l, masalan `/ws/chat/<room_id>/`. */
  path: string;
  onMessage?: (raw: string) => void;
  onState?: (state: SocketState) => void;
}

const MAX_RETRIES = 6;
const MAX_RETRY_DELAY_MS = 30_000;

/**
 * WebSocket ulanishini boshqaradi: JWT bilan ulanish, uzilganda eksponensial
 * qayta urinish, `4401` da tokenni yangilash, tarmoq/oyna holatiga reaksiya.
 *
 * Xabar formatini bilmaydi — xom matnni qaytaradi. Har bir modul (chat, doska)
 * o'z shartnomasini o'zi parse qiladi.
 */
export class RealtimeSocket {
  private readonly path: string;
  private readonly onMessage?: (raw: string) => void;
  private readonly onState?: (state: SocketState) => void;

  private socket: WebSocket | null = null;
  private retries = 0;
  private closed = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly handleOnline: () => void;
  private readonly handleVisibility: () => void;

  constructor({ path, onMessage, onState }: RealtimeSocketInit) {
    this.path = path;
    this.onMessage = onMessage;
    this.onState = onState;
    this.handleOnline = () => this.connect();
    this.handleVisibility = () => {
      if (document.visibilityState === "visible" && !this.socket) this.connect();
    };
  }

  get isOpen(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  start(): void {
    this.closed = false;
    globalThis.addEventListener?.("online", this.handleOnline);
    globalThis.document?.addEventListener?.("visibilitychange", this.handleVisibility);
    this.connect();
  }

  connect(): void {
    if (this.closed || this.socket || (typeof navigator !== "undefined" && !navigator.onLine)) return;
    const token = tokenStorage.getAccessToken();
    if (!token) return;

    this.onState?.("connecting");
    const socket = new WebSocket(`${env.wsUrl}${this.path}?token=${encodeURIComponent(token)}`);
    this.socket = socket;

    socket.onopen = () => {
      this.retries = 0;
      this.onState?.("connected");
    };

    socket.onmessage = (event: MessageEvent<string>) => this.onMessage?.(event.data);

    socket.onerror = () => this.onState?.("error");

    socket.onclose = async (event: CloseEvent) => {
      if (this.socket === socket) this.socket = null;
      this.onState?.("disconnected");
      const policy = getSocketClosePolicy(event.code);
      if (this.closed || !policy.reconnect) return;
      if (policy.refresh && !(await refreshTokenManager.refresh())) return;
      this.scheduleReconnect();
    };
  }

  /** Exponential backoff: 700ms, 1.4s, 2.8s … maksimum 30s, 6 martagacha. */
  private scheduleReconnect(): void {
    if (this.closed || this.retryTimer || this.retries >= MAX_RETRIES) return;
    const delay = Math.min(MAX_RETRY_DELAY_MS, 700 * 2 ** this.retries++);
    this.retryTimer = globalThis.setTimeout(() => {
      this.retryTimer = null;
      this.connect();
    }, delay);
  }

  /** Ulanish yopiq bo'lsa `false` qaytaradi — chaqiruvchi REST'ga o'tishi mumkin. */
  send(payload: unknown): boolean {
    if (!this.isOpen) return false;
    this.socket!.send(JSON.stringify(payload));
    return true;
  }

  stop(): void {
    this.closed = true;
    if (this.retryTimer) globalThis.clearTimeout(this.retryTimer);
    this.retryTimer = null;
    globalThis.removeEventListener?.("online", this.handleOnline);
    globalThis.document?.removeEventListener?.("visibilitychange", this.handleVisibility);
    const socket = this.socket;
    this.socket = null;
    socket?.close(1000, "Client closed");
  }
}
