import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { liveApi } from "../api/live.api";
export const liveKeys = Object.freeze({ all: ["live"], token: (id) => ["live", "token", id], attention: (id) => ["live", "attention", id] });
export function useLiveToken(lessonId, enabled) { return useQuery({ queryKey: liveKeys.token(lessonId), queryFn: () => liveApi.getToken(lessonId), enabled: Boolean(lessonId && enabled), staleTime: 90 * 60_000, retry: false }); }
export function useAttentionCheck(lessonId, enabled) { return useQuery({ queryKey: liveKeys.attention(lessonId), queryFn: ({ signal }) => liveApi.getAttention(lessonId, { signal }), enabled: Boolean(lessonId && enabled), refetchInterval: 3000 }); }
export function useAnswerAttention(lessonId) { const client = useQueryClient(); return useMutation({ mutationFn: liveApi.answerAttention, onSuccess: () => client.setQueryData(liveKeys.attention(lessonId), null) }); }
export function useAllowShare(lessonId) { return useMutation({ mutationFn: (identity) => liveApi.allowShare(lessonId, identity), onSuccess: () => toast.success("Ekran ulashish ruxsati berildi") }); }
