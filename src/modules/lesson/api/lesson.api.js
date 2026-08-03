import { apiClient } from "@/shared/api";
import { lessonEndpoints } from "./lesson.endpoints";
import { mapLessonDto, mapLessonPage, mapLessonRequest } from "../lib/lesson.mappers";

export const lessonApi = {
  async getAll(options = {}) { return mapLessonPage(await apiClient.get(lessonEndpoints.list, options), options.query); },
  async getById(id, options) { return mapLessonDto(await apiClient.get(lessonEndpoints.detail(id), options)); },
  async create(form) { return mapLessonDto(await apiClient.post(lessonEndpoints.list, mapLessonRequest(form))); },
  async update(id, form) { return mapLessonDto(await apiClient.patch(lessonEndpoints.detail(id), mapLessonRequest(form))); },
  async remove(id) { await apiClient.delete(lessonEndpoints.detail(id)); return id; },
  async finish(id) { return mapLessonDto(await apiClient.post(lessonEndpoints.finish(id), {})); },
};
