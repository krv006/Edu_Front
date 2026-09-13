import { apiClient, type RequestOptions } from "@/shared/api";
import { notificationEndpoints } from "./notification.endpoints";

/** `PushSubscription.toJSON()` dan olinadigan, serverga yuboriladigan shakl. */
export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * `GET .../push/vapid-key/` javobi: `{ public_key: "<base64url>" }`.
 *
 * Sxemada bu endpoint hujjatlanmagan (drf-spectacular uni `InboxItem` deb
 * belgilab qo'ygan), shuning uchun maydon shu yerda qo'lda tekshiriladi —
 * kalit bo'lmasa obuna ochish bosqichida tushunarsiz xato chiqmasin.
 */
function readVapidKey(payload: unknown): string {
  const key = (payload as { public_key?: unknown } | null)?.public_key;
  if (typeof key !== "string" || !key) {
    throw new Error("VAPID kaliti kelmadi: javobda `public_key` yo'q");
  }
  return key;
}

export const pushApi = {
  async getVapidKey(options?: RequestOptions): Promise<string> {
    return readVapidKey(await apiClient.get(notificationEndpoints.pushVapidKey, options));
  },

  subscribe(subscription: PushSubscriptionPayload) {
    return apiClient.post(notificationEndpoints.pushSubscribe, subscription);
  },

  /** `endpoint` yuboriladi: server qaysi obunani o'chirishni shundan biladi. */
  unsubscribe(endpoint: string) {
    return apiClient.post(notificationEndpoints.pushUnsubscribe, { endpoint });
  },
};
