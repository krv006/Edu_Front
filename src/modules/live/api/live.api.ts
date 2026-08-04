import { apiClient, type RequestOptions } from "@/shared/api";
import { liveEndpoints } from "./live.endpoints";
import type { AttentionAnswerDto, AttentionResponseDto, FocusKind, RoomTokenDto } from "./live.dto";
import { mapAttentionDto, mapRoomTokenDto } from "../lib/live.mappers";

export const liveApi = {
  async getToken(lessonId: string) {
    return mapRoomTokenDto(await apiClient.post<RoomTokenDto>(liveEndpoints.token, { lesson_id: lessonId }));
  },
  async leave(lessonId: string) {
    return apiClient.post(liveEndpoints.leave, { lesson_id: lessonId });
  },
  async getAttention(lessonId: string, options?: RequestOptions) {
    return mapAttentionDto(
      await apiClient.get<AttentionResponseDto>(liveEndpoints.attention, {
        ...options,
        query: { lesson_id: lessonId },
      })
    );
  },
  async answerAttention(checkId: string) {
    const dto = await apiClient.post<AttentionAnswerDto>(liveEndpoints.attention, { check_id: checkId });
    return { answeredAt: dto.answered_at };
  },
  async sendFocus(lessonId: string, kind: FocusKind) {
    return apiClient.post(liveEndpoints.focus, { lesson_id: lessonId, kind });
  },
  async allowShare(lessonId: string, identity: string) {
    return apiClient.post(liveEndpoints.allowShare, { lesson_id: lessonId, identity });
  },
};
