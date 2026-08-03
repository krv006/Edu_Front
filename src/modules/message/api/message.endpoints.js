export const messageEndpoints = Object.freeze({
  history: (roomId) => `/api/v1/chat/rooms/${roomId}/messages/`,
  send: (roomId) => `/api/v1/chat/rooms/${roomId}/send/`,
});
