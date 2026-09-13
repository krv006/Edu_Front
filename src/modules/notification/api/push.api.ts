import { apiClient, type RequestOptions } from "@/shared/api";
import { notificationEndpoints } from "./notification.endpoints";

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

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

  unsubscribe(endpoint: string) {
    return apiClient.post(notificationEndpoints.pushUnsubscribe, { endpoint });
  },
};
