export const endpoints = {
  auth: { login: '/auth/login', me: '/auth/me', logout: '/auth/logout' },
  conversations: '/conversations',
  messages: (conversationId) => `/conversations/${conversationId}/messages`,
}

