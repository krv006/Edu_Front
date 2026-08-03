import { useQuery } from "@tanstack/react-query";
import { conversationApi } from "../api/conversation.api";
import { conversationKeys } from "./conversation.keys";

export function useConversations(role = "teacher") {
  return useQuery({ queryKey: conversationKeys.list(role), queryFn: ({ signal }) => conversationApi.getAll({ signal, role }) });
}
