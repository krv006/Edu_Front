import { apiClient } from "@/shared/api";
import { liveEndpoints } from "./live.endpoints";
import { mapAttentionDto, mapRoomTokenDto } from "../lib/live.mappers";
export const liveApi = {
  async getToken(lessonId) { return mapRoomTokenDto(await apiClient.post(liveEndpoints.token, { lesson_id: lessonId })); },
  async leave(lessonId) { return apiClient.post(liveEndpoints.leave, { lesson_id: lessonId }); },
  async getAttention(lessonId, options) { return mapAttentionDto(await apiClient.get(liveEndpoints.attention, { ...options, query: { lesson_id: lessonId } })); },
  async answerAttention(checkId) { const dto = await apiClient.post(liveEndpoints.attention, { check_id: checkId }); return { answeredAt: dto.answered_at }; },
  async sendFocus(lessonId, kind) { return apiClient.post(liveEndpoints.focus, { lesson_id: lessonId, kind }); },
  async allowShare(lessonId, identity) { return apiClient.post(liveEndpoints.allowShare, { lesson_id: lessonId, identity }); },
};
