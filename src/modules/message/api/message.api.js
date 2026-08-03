import { AppError, API_ERROR_CODES, apiClient } from "@/shared/api";
import { messageEndpoints } from "./message.endpoints";
import { mapMessageDto } from "../lib/message.mappers";

const unsupported = (label) => Promise.reject(new AppError({ code: API_ERROR_CODES.NOT_FOUND, message: `${label} backend API’da mavjud emas` }));
export const messageApi = {
  async getAll(roomId, options = {}) { return (await apiClient.get(messageEndpoints.history(roomId), options)).map(mapMessageDto); },
  async getAfter(roomId, after, options = {}) { return (await apiClient.get(messageEndpoints.history(roomId), { ...options, query: { after } })).map(mapMessageDto); },
  async send(roomId, payload) {
    if (payload.attachment) throw new AppError({ code: API_ERROR_CODES.VALIDATION_ERROR, message: "Chat fayl yuborish backendda mavjud emas" });
    const text = payload.replyTo ? `↪ ${payload.replyTo.author}: ${payload.replyTo.text.replace(/\n/g, " ")}\n${payload.text}` : payload.text;
    return mapMessageDto(await apiClient.post(messageEndpoints.send(roomId), { text }));
  },
  update: () => unsupported("Xabarni tahrirlash"), remove: () => unsupported("Xabarni o‘chirish"),
  toggleReaction: () => unsupported("Reaksiya"),
};
