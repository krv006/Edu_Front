import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationApi, conversationKeys } from "@/modules/conversation";
import { messageApi } from "../api/message.api";
import { ChatSocketManager } from "../lib/chat-socket-manager";
import { markMessageFailed, upsertMessage } from "../lib/message.mappers";
import { messageKeys } from "./message.keys";

export function useChat(conversationId, { role = "teacher", senderId = "teacher-1" } = {}) {
  const queryClient = useQueryClient(); const messagesKey = useMemo(() => messageKeys.all(conversationId, role), [conversationId, role]); const [socketState, setSocketState] = useState("idle"); const [typing, setTyping] = useState(null);
  const conversation = useQuery({ queryKey: conversationKeys.detail(conversationId, role), queryFn: ({ signal }) => conversationApi.getById(conversationId, { signal }), enabled: Boolean(conversationId) });
  const messages = useQuery({ queryKey: messagesKey, queryFn: ({ signal }) => messageApi.getAll(conversationId, { signal }), enabled: Boolean(conversationId) });
  const socket = useMemo(() => conversationId ? new ChatSocketManager({ roomId: conversationId, onState: setSocketState, onEvent: (event) => {
    if (event.type === "message") queryClient.setQueryData(messagesKey, (current = []) => upsertMessage(current, event.message));
    if (event.type === "typing" && event.userId !== String(senderId)) { setTyping(event.name); globalThis.setTimeout(() => setTyping(null), 2600); }
  } }) : null, [conversationId, messagesKey, queryClient, senderId]);
  useEffect(() => { socket?.start(); return () => socket?.stop(); }, [socket]);
  const sendMessage = useMutation({
    mutationFn: (payload) => messageApi.send(conversationId, payload),
    onMutate: async (payload) => { const temporaryId = `temp-${crypto.randomUUID()}`; const optimistic = { id: temporaryId, conversationId, senderId, text: payload.text, type: "text", createdAt: new Date().toISOString(), status: "pending", pending: true, retryPayload: payload }; queryClient.setQueryData(messagesKey, (current = []) => upsertMessage(current, optimistic)); return { temporaryId }; },
    onSuccess: (message, _payload, context) => { queryClient.setQueryData(messagesKey, (current = []) => upsertMessage(current.filter((item) => item.id !== context.temporaryId), message)); queryClient.invalidateQueries({ queryKey: conversationKeys.all }); },
    onError: (_error, _payload, context) => queryClient.setQueryData(messagesKey, (current = []) => markMessageFailed(current, context.temporaryId)),
  });
  const updateMessage = useMutation({ mutationFn: ({ messageId, text }) => messageApi.update(conversationId, messageId, text) });
  const deleteMessage = useMutation({ mutationFn: ({ messageId, scope }) => messageApi.remove(conversationId, messageId, scope) });
  const toggleReaction = useMutation({ mutationFn: ({ messageId, emoji }) => messageApi.toggleReaction(conversationId, messageId, emoji) });
  function retryMessage(message) { queryClient.setQueryData(messagesKey, (current = []) => current.filter((item) => item.id !== message.id)); sendMessage.mutate(message.retryPayload ?? { text: message.text }); }
  return { conversation: { ...conversation, data: conversation.data ? { ...conversation.data, typing: Boolean(typing), typingName: typing } : conversation.data }, messages, sendMessage, retryMessage, updateMessage, deleteMessage, toggleReaction, socketState, sendTyping: () => socket?.sendTyping() };
}
