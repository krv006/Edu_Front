import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppError } from "@/shared/api";
import { liveApi } from "../api/live.api";

export const liveKeys = Object.freeze({
  all: ["live"] as const,
  token: (id: string) => ["live", "token", id] as const,
  attention: (id: string) => ["live", "attention", id] as const,
});

export function useLiveToken(lessonId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: liveKeys.token(lessonId ?? ""),
    queryFn: () => liveApi.getToken(lessonId as string),
    enabled: Boolean(lessonId && enabled),
    staleTime: 90 * 60_000,
    retry: false,
  });
}

export function useAttentionCheck(lessonId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: liveKeys.attention(lessonId ?? ""),
    queryFn: ({ signal }) => liveApi.getAttention(lessonId as string, { signal }),
    enabled: Boolean(lessonId && enabled),
    refetchInterval: 3000,
  });
}

export function useAnswerAttention(lessonId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (checkId: string) => liveApi.answerAttention(checkId),
    onSuccess: () => client.setQueryData(liveKeys.attention(lessonId), null),
  });
}

export function useAllowShare(lessonId: string) {
  return useMutation({
    mutationFn: (identity: string) => liveApi.allowShare(lessonId, identity),
    onSuccess: () => toast.success("Ekran ulashish ruxsati berildi"),
  });
}


function moderationError(error: unknown): string {
  if (error instanceof AppError && error.status === 404) {
    return "Bu imkoniyat serverda hali yoqilmagan.";
  }
  return error instanceof Error ? error.message : "Amalni bajarib bo‘lmadi";
}

export function useInviteToLesson(lessonId: string) {
  return useMutation({
    mutationFn: (studentId?: string) => liveApi.invite(lessonId, studentId),
    onSuccess: (invited, studentId) => {
      toast.success(
        studentId ? "Taklif yuborildi" : `${invited} ta o‘quvchiga taklif yuborildi`
      );
    },
    onError: (error) => toast.error(moderationError(error)),
  });
}

export function useBanFromLesson(lessonId: string) {
  return useMutation({
    mutationFn: (studentId: string) => liveApi.ban(lessonId, studentId),
    onSuccess: () => toast.success("O‘quvchi darsdan chetlashtirildi"),
    onError: (error) => toast.error(moderationError(error)),
  });
}

export function useUnbanFromLesson(lessonId: string) {
  return useMutation({
    mutationFn: (studentId: string) => liveApi.unban(lessonId, studentId),
    onSuccess: (unbanned) =>
      toast.success(unbanned ? "Chetlashtirish bekor qilindi" : "Chetlashtirish topilmadi"),
    onError: (error) => toast.error(moderationError(error)),
  });
}
