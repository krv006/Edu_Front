import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  disablePush,
  enablePush,
  hasPushSubscription,
  isPushSupported,
} from "../lib/push-subscription";

export const pushKeys = Object.freeze({
  status: ["push", "status"] as const,
});

export interface PushNotificationsState {
  /** Brauzer push'ni umuman qo'llab-quvvatlaydimi. */
  supported: boolean;
  /** Shu brauzerda obuna ochiqmi. */
  enabled: boolean;
  /** Ruxsat butunlay rad etilgan — endi faqat brauzer sozlamalaridan tiklanadi. */
  blocked: boolean;
  pending: boolean;
  error: string | null;
  toggle: (next: boolean) => void;
}

/**
 * Push obunasining holati.
 *
 * Holat brauzerdan o'qiladi, serverdan emas: obuna qurilmaga bog'liq, serverda
 * esa boshqa brauzerdagi obuna ham turgan bo'lishi mumkin. So'rov sifatida
 * yozilgan — shunda yoqib/o'chirgandan keyin holat o'zi yangilanadi.
 */
export function usePushNotifications(): PushNotificationsState {
  const supported = isPushSupported();
  const queryClient = useQueryClient();

  const status = useQuery({
    queryKey: pushKeys.status,
    queryFn: async () => ({
      subscribed: await hasPushSubscription(),
      permission: Notification.permission,
    }),
    enabled: supported,
    staleTime: 0,
  });

  const toggle = useMutation({
    mutationFn: async (next: boolean) => {
      if (next) await enablePush();
      else await disablePush();
    },
    // Xato bo'lsa ham qayta o'qiymiz: obuna yarim holatda qolgan bo'lishi mumkin.
    onSettled: () => queryClient.invalidateQueries({ queryKey: pushKeys.status }),
  });

  return {
    supported,
    enabled: Boolean(status.data?.subscribed),
    blocked: status.data?.permission === "denied",
    pending: toggle.isPending || status.isLoading,
    error: toggle.error instanceof Error ? toggle.error.message : null,
    toggle: (next) => toggle.mutate(next),
  };
}
