import { API_ERROR_CODES, apiClient, AppError, type RequestOptions } from "@/shared/api";
import { lessonEndpoints } from "./lesson.endpoints";
import type { LessonDto, LessonFormInput, LessonRecordingDto } from "./lesson.dto";
import {
  mapLessonDto,
  mapLessonPage,
  mapLessonRecordingDto,
  mapLessonRequest,
} from "../lib/lesson.mappers";

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
  /** `recordingTitle` — o'qituvchi video yozuvga beradigan nom (bo'sh bo'lsa dars nomi olinadi). */
  async finish(id: string, recordingTitle?: string) {
    const title = recordingTitle?.trim();
    return mapLessonDto(
      await apiClient.post<LessonDto>(
        lessonEndpoints.finish(id),
        title ? { recording_title: title } : {}
      )
    );
  },
  /** Yozuv yo'q bo'lsa backend 404 qaytaradi — bu xato emas, shunchaki `null`. */
  async getRecording(id: string, options?: RequestOptions) {
    try {
      const dto = await apiClient.get<LessonRecordingDto>(lessonEndpoints.recording(id), options);
      return mapLessonRecordingDto(dto);
    } catch (error) {
      if (error instanceof AppError && error.status === 404) return null;
      if (error instanceof AppError && error.code === API_ERROR_CODES.NOT_FOUND) return null;
      throw error;
    }
  },
  async removeRecording(id: string) {
    await apiClient.delete(lessonEndpoints.recording(id));
    return id;
  },
};
