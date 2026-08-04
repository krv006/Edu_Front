import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationApi } from "../api/conversation.api";
import type { DirectAction } from "../api/conversation.dto";
import { conversationKeys } from "./conversation.keys";

export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.list(),
    queryFn: ({ signal }) => conversationApi.getAll({ signal }),
    select: (page) => page.items,
  });
}

export function useTeachersForDirect() {
  return useQuery({
    queryKey: ["conversations", "teachers"],
    queryFn: ({ signal }) => conversationApi.getTeachers({ signal }),
  });
}

export function useRequestDirect() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (teacherId: string) => conversationApi.requestDirect(teacherId),
    onSuccess: () => client.invalidateQueries({ queryKey: conversationKeys.all }),
  });
}

export function useRespondDirect() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, action }: { roomId: string; action: DirectAction }) =>
      conversationApi.respondDirect(roomId, action),
    onSuccess: () => client.invalidateQueries({ queryKey: conversationKeys.all }),
  });
}
