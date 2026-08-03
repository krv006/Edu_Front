import { apiClient, selectApiTransport } from "@/shared/api";
import { messageSeed, studentMessageSeed } from "./adapters/message.mock-data";

const delay = (ms = 220) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));
const stores = { teacher: structuredClone(messageSeed), student: structuredClone(studentMessageSeed) };
const getStore = (role = "teacher") => stores[role] ?? stores.teacher;

const mockMessageApi = {
  async getAll(conversationId, { signal, role = "teacher" } = {}) { await delay(); if (signal?.aborted) throw new DOMException("Aborted", "AbortError"); return structuredClone(getStore(role)[conversationId] ?? []); },
  async send(conversationId, payload, { role = "teacher", senderId = "teacher-1" } = {}) { await delay(160); const store = getStore(role); const message = { id: crypto.randomUUID(), conversationId, senderId, text: payload.text, type: payload.attachment ? "file" : "text", attachment: payload.attachment, replyTo: payload.replyTo, createdAt: new Date().toISOString(), status: "sent" }; store[conversationId] = [...(store[conversationId] ?? []), message]; return structuredClone(message); },
  async update(conversationId, messageId, text, { role = "teacher" } = {}) { await delay(150); const messages = getStore(role)[conversationId] ?? []; const index = messages.findIndex((message) => message.id === messageId); if (index < 0) throw new Error("Xabar topilmadi"); messages[index] = { ...messages[index], text, editedAt: new Date().toISOString() }; return structuredClone(messages[index]); },
  async remove(conversationId, messageId, scope = "me", { role = "teacher" } = {}) { await delay(140); const store = getStore(role); store[conversationId] = (store[conversationId] ?? []).filter((message) => message.id !== messageId); return { id: messageId, scope }; },
  async toggleReaction(conversationId, messageId, emoji, { role = "teacher" } = {}) { await delay(100); const messages = getStore(role)[conversationId] ?? []; const index = messages.findIndex((message) => message.id === messageId); if (index < 0) throw new Error("Xabar topilmadi"); const reactions = [...(messages[index].reactions ?? [])]; const reactionIndex = reactions.findIndex((item) => item.emoji === emoji); if (reactionIndex >= 0 && reactions[reactionIndex].reacted) { const count = reactions[reactionIndex].count - 1; if (count <= 0) reactions.splice(reactionIndex, 1); else reactions[reactionIndex] = { ...reactions[reactionIndex], count, reacted: false }; } else if (reactionIndex >= 0) reactions[reactionIndex] = { ...reactions[reactionIndex], count: reactions[reactionIndex].count + 1, reacted: true }; else reactions.push({ emoji, count: 1, reacted: true }); messages[index] = { ...messages[index], reactions }; return structuredClone(messages[index]); },
};

const remoteMessageApi = {
  async getAll(conversationId, options) { const result = await apiClient.get(`/conversations/${conversationId}/messages`, options); return result.data ?? result; },
  async send(conversationId, payload) { const result = await apiClient.post(`/conversations/${conversationId}/messages`, payload); return result.data ?? result; },
  async update(conversationId, messageId, text) { const result = await apiClient.patch(`/conversations/${conversationId}/messages/${messageId}`, { text }); return result.data ?? result; },
  async remove(conversationId, messageId, scope) { const result = await apiClient.delete(`/conversations/${conversationId}/messages/${messageId}`, { query: { scope } }); return result.data ?? result; },
  async toggleReaction(conversationId, messageId, emoji) { const result = await apiClient.post(`/conversations/${conversationId}/messages/${messageId}/reactions`, { emoji }); return result.data ?? result; },
};

export const messageApi = selectApiTransport({ mock: mockMessageApi, remote: remoteMessageApi });
