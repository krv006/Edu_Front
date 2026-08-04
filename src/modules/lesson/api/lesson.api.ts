import { apiClient, type RequestOptions } from "@/shared/api";
import { lessonEndpoints } from "./lesson.endpoints";
import type { LessonDto, LessonFormInput } from "./lesson.dto";
import { mapLessonDto, mapLessonPage, mapLessonRequest } from "../lib/lesson.mappers";

export const lessonApi = {
  async getAll(options: RequestOptions = {}) {
    return mapLessonPage(await apiClient.get(lessonEndpoints.list, options), options.query);
  },
  async getById(id: string, options?: RequestOptions) {
    return mapLessonDto(await apiClient.get<LessonDto>(lessonEndpoints.detail(id), options));
  },
  async create(form: LessonFormInput) {
    return mapLessonDto(await apiClient.post<LessonDto>(lessonEndpoints.list, mapLessonRequest(form)));
  },
  async update(id: string, form: LessonFormInput) {
    return mapLessonDto(await apiClient.patch<LessonDto>(lessonEndpoints.detail(id), mapLessonRequest(form)));
  },
  async remove(id: string) {
    await apiClient.delete(lessonEndpoints.detail(id));
    return id;
  },
  async finish(id: string) {
    return mapLessonDto(await apiClient.post<LessonDto>(lessonEndpoints.finish(id), {}));
  },
};
