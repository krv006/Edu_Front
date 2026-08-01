import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "../services/chat.service";
import { queryKeys } from "./use-conversations";

export function useChat(conversationId) {
  const queryClient = useQueryClient();
  const conversation = useQuery({
    queryKey: queryKeys.conversation(conversationId),
    queryFn: ({ signal }) =>
      chatService.getConversation(conversationId, { signal }),
    enabled: Boolean(conversationId),
  });
  const messages = useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: ({ signal }) =>
      chatService.getMessages(conversationId, { signal }),
    enabled: Boolean(conversationId),
  });
  const sendMessage = useMutation({
    mutationFn: (payload) => chatService.sendMessage(conversationId, payload),
    onSuccess: (message) => {
      queryClient.setQueryData(
        queryKeys.messages(conversationId),
        (current = []) => [...current, message]
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });

  const updateMessage = useMutation({
    mutationFn: ({ messageId, text }) =>
      chatService.updateMessage(conversationId, messageId, text),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        queryKeys.messages(conversationId),
        (current = []) =>
          current.map((message) =>
            message.id === updated.id ? updated : message
          )
      );
    },
  });

  const deleteMessage = useMutation({
    mutationFn: ({ messageId, scope }) =>
      chatService.deleteMessage(conversationId, messageId, scope),
    onSuccess: ({ id }) => {
      queryClient.setQueryData(
        queryKeys.messages(conversationId),
        (current = []) => current.filter((message) => message.id !== id)
      );
    },
  });

  const toggleReaction = useMutation({
    mutationFn: ({ messageId, emoji }) =>
      chatService.toggleReaction(conversationId, messageId, emoji),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        queryKeys.messages(conversationId),
        (current = []) =>
          current.map((message) =>
            message.id === updated.id ? updated : message
          )
      );
    },
  });

  return {
    conversation,
    messages,
    sendMessage,
    updateMessage,
    deleteMessage,
    toggleReaction,
  };
}
