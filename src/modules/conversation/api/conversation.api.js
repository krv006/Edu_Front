import { apiClient, selectApiTransport } from "@/shared/api";
import { conversationSeed, studentConversationSeed } from "./adapters/conversation.mock-data";

const delay = (ms = 260) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));
const stores = { teacher: structuredClone(conversationSeed), student: structuredClone(studentConversationSeed) };
const getStore = (role = "teacher") => stores[role] ?? stores.teacher;

const mockConversationApi = {
  async getAll({ signal, role = "teacher" } = {}) {
    await delay();
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    return structuredClone(getStore(role));
  },
  async getById(id, { signal, role = "teacher" } = {}) {
    await delay(160);
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    return structuredClone(getStore(role).find((item) => item.id === id) ?? null);
  },
  async createDirect(user) {
    await delay(300);
    const store = getStore("teacher");
    const existing = store.find((item) => item.participantId === user.id);
    if (existing) return structuredClone(existing);
    const conversation = { id: user.username.replace("@", "") || user.id, type: "direct", title: user.name, participantId: user.id, lastMessage: "Yangi suhbat", updatedAt: new Date().toISOString(), unreadCount: 0, status: user.status, avatarTone: user.avatarTone, typing: false };
    store.unshift(conversation);
    return structuredClone(conversation);
  },
  async createGroup(payload) {
    await delay(380);
    const store = getStore("teacher");
    const slug = payload.name.toLowerCase().replace(/[^a-z0-9а-яёқғҳў]+/gi, "-").replace(/^-|-$/g, "") || crypto.randomUUID();
    const conversation = { id: `${slug}-${Date.now().toString().slice(-4)}`, type: "group", title: payload.name, subject: payload.subject, description: payload.description || "Yangi o‘quv guruhi", memberCount: 1, lastMessage: "Guruh yaratildi", updatedAt: new Date().toISOString(), unreadCount: 0, status: "online", avatarTone: "violet", typing: false };
    store.unshift(conversation);
    return structuredClone(conversation);
  },
};

const remoteConversationApi = {
  async getAll(options) { const result = await apiClient.get("/conversations", options); return result.data ?? result; },
  async getById(id, options) { const result = await apiClient.get(`/conversations/${id}`, options); return result.data ?? result; },
  async createDirect(user) { const result = await apiClient.post("/conversations", { type: "direct", participantId: user.id }); return result.data ?? result; },
  async createGroup(payload) { const result = await apiClient.post("/conversations", { type: "group", ...payload }); return result.data ?? result; },
};

export const conversationApi = selectApiTransport({ mock: mockConversationApi, remote: remoteConversationApi });
