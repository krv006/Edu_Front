import { AppError, API_ERROR_CODES, apiClient } from "@/shared/api";
import { courseApi } from "@/modules/course";
import { conversationEndpoints } from "./conversation.endpoints";
import { mapConversationDto, mapConversationPage, mapTeacherDto } from "../lib/conversation.mappers";

export const conversationApi = {
  async getAll(options = {}) { return mapConversationPage(await apiClient.get(conversationEndpoints.rooms, { ...options, query: { page_size: 100, ...options.query } }), options.query); },
  async getById(id, options) { return mapConversationDto(await apiClient.get(conversationEndpoints.detail(id), options)); },
  async createGroup(payload) {
    const course = await courseApi.create(payload);
    const rooms = await this.getAll();
    const room = rooms.items.find((item) => item.courseId === course.id);
    if (!room) throw new AppError({ code: API_ERROR_CODES.NOT_FOUND, message: "Kurs yaratildi, chat xonasi hali tayyor emas" });
    return room;
  },
  async getTeachers(options) { return (await apiClient.get(conversationEndpoints.teachers, options)).map(mapTeacherDto); },
  async requestDirect(teacher) { return mapConversationDto(await apiClient.post(conversationEndpoints.directRequest, { teacher })); },
  async respondDirect(roomId, action) { return mapConversationDto(await apiClient.post(conversationEndpoints.directRespond, { room_id: roomId, action })); },
  async createDirect() { throw new AppError({ code: API_ERROR_CODES.FORBIDDEN, message: "Shaxsiy chat so‘rovini o‘quvchi yuboradi" }); },
};
