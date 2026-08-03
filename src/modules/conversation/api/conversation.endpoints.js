export const conversationEndpoints = Object.freeze({
  rooms: "/api/v1/chat/rooms/", detail: (id) => `/api/v1/chat/rooms/${id}/`,
  teachers: "/api/v1/chat/rooms/teachers/", directRequest: "/api/v1/chat/rooms/direct/request/",
  directRespond: "/api/v1/chat/rooms/direct/respond/",
});
