export function mapMessageDto(dto) {
  const sender = dto.sender ?? {};
  const replyMatch = String(dto.text ?? "").match(/^↪ ([^:]+): (.*?)\n([\s\S]*)$/);
  return {
    id: String(dto.id), conversationId: String(dto.room), senderId: String(sender.id),
    senderName: [sender.first_name, sender.last_name].filter(Boolean).join(" ") || sender.username,
    senderUsername: sender.username, text: replyMatch ? replyMatch[3] : dto.text,
    replyTo: replyMatch ? { author: replyMatch[1], text: replyMatch[2] } : undefined,
    type: "text", createdAt: dto.created_at,
    status: "sent", pending: false, failed: false,
  };
}
export function parseSocketEvent(raw) {
  const event = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!event || !["message", "typing", "error"].includes(event.type)) return null;
  if (event.type === "message" && event.message) return { type: "message", message: mapMessageDto(event.message) };
  if (event.type === "typing") return { type: "typing", userId: String(event.user_id), name: event.name };
  return { type: "error", detail: event.detail || "WebSocket xatosi" };
}
export function upsertMessage(messages = [], message) {
  const index = messages.findIndex((item) => item.id === message.id);
  if (index >= 0) return messages.map((item, i) => i === index ? { ...item, ...message } : item);
  return [...messages, message].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}
export function markMessageFailed(messages = [], temporaryId) { return messages.map((item) => item.id === temporaryId ? { ...item, pending: false, failed: true, status: "failed" } : item); }
