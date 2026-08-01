import { useQuery } from '@tanstack/react-query'
import { chatService } from '../services/chat.service'

export const queryKeys = {
  conversations: ['conversations'],
  conversation: (id) => ['conversations', id],
  messages: (id) => ['conversations', id, 'messages'],
}

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: ({ signal }) => chatService.getConversations({ signal }),
  })
}

