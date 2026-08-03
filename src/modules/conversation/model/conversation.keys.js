export const conversationKeys = Object.freeze({
  all: ["conversations"],
  list: (role = "teacher") => ["conversations", role],
  detail: (id, role = "teacher") => ["conversations", role, id],
});
