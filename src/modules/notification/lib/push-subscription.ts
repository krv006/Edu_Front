import { pushApi, type PushSubscriptionPayload } from "../api/push.api";

/** Push uchun uchala narsa ham kerak — biri bo'lmasa imkoniyat yo'q. */
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * VAPID kaliti base64url ko'rinishida keladi, `applicationServerKey` esa
 * baytlar massivini kutadi — shuning uchun qo'lda o'giriladi.
 */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);
  /* Bufer aniq `ArrayBuffer` bo'lishi kerak: `applicationServerKey`
     `SharedArrayBuffer` ustidagi ko'rinishni qabul qilmaydi. */
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

/**
 * Service worker'ni ro'yxatdan o'tkazadi.
 *
 * `ready` kutiladi: `register()` qaytgani bilan worker hali faol bo'lmasligi
 * mumkin, faol bo'lmagan worker'da esa `pushManager` ishlamaydi.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready;
}

function toPayload(subscription: PushSubscription): PushSubscriptionPayload {
  const json = subscription.toJSON() as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  const keys = json.keys ?? {};
  if (!json.endpoint || !keys.p256dh || !keys.auth) {
    throw new Error("Brauzer obunasi to'liq emas");
  }
  return { endpoint: json.endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
}

/** Ruxsat so'raladi, obuna ochiladi va serverga saqlanadi. */
export async function enablePush(): Promise<void> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Bildirishnomalarga ruxsat berilmagan — brauzer sozlamalaridan yoqing."
        : "Bildirishnomalarga ruxsat olinmadi."
    );
  }

  const registration = await registerServiceWorker();
  /* Obuna allaqachon bor bo'lishi mumkin (masalan boshqa hisobda ochilgan) —
     uni qayta ishlatamiz, aks holda brauzer xato beradi. */
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(await pushApi.getVapidKey()),
    }));

  await pushApi.subscribe(toPayload(subscription));
}

/**
 * Serverdagi yozuv avval o'chiriladi, brauzerdagisi keyin: teskarisi bo'lsa,
 * server so'rovi yiqilganda obuna serverda qolib, xabar kelaverardi.
 */
export async function disablePush(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  await pushApi.unsubscribe(subscription.endpoint);
  await subscription.unsubscribe();
}

/** Shu brauzerda obuna ochiqmi — sozlamalar tugmasining holati uchun. */
export async function hasPushSubscription(): Promise<boolean> {
  if (!isPushSupported() || Notification.permission !== "granted") return false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;
  return Boolean(await registration.pushManager.getSubscription());
}
