import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationApi, conversationKeys } from "@/modules/conversation";
import { messageApi } from "../api/message.api";
import { messageKeys } from "./message.keys";

export function useChat(conversationId, { role = "teacher", senderId = "teacher-1" } = {}) {
  const queryClient = useQueryClient();
  const messagesKey = messageKeys.all(conversationId, role);
  const conversation = useQuery({ queryKey: conversationKeys.detail(conversationId, role), queryFn: ({ signal }) => conversationApi.getById(conversationId, { signal, role }), enabled: Boolean(conversationId) });
  const messages = useQuery({ queryKey: messagesKey, queryFn: ({ signal }) => messageApi.getAll(conversationId, { signal, role }), enabled: Boolean(conversationId) });
  const sendMessage = useMutation({ mutationFn: (payload) => messageApi.send(conversationId, payload, { role, senderId }), onSuccess: (message) => { queryClient.setQueryData(messagesKey, (current = []) => [...current, message]); queryClient.invalidateQueries({ queryKey: conversationKeys.list(role) }); } });
  const updateMessage = useMutation({ mutationFn: ({ messageId, text }) => messageApi.update(conversationId, messageId, text, { role }), onSuccess: (updated) => queryClient.setQueryData(messagesKey, (current = []) => current.map((message) => message.id === updated.id ? updated : message)) });
  const deleteMessage = useMutation({ mutationFn: ({ messageId, scope }) => messageApi.remove(conversationId, messageId, scope, { role }), onSuccess: ({ id }) => queryClient.setQueryData(messagesKey, (current = []) => current.filter((message) => message.id !== id)) });
  const toggleReaction = useMutation({ mutationFn: ({ messageId, emoji }) => messageApi.toggleReaction(conversationId, messageId, emoji, { role }), onSuccess: (updated) => queryClient.setQueryData(messagesKey, (current = []) => current.map((message) => message.id === updated.id ? updated : message)) });
  return { conversation, messages, sendMessage, updateMessage, deleteMessage, toggleReaction };
}
