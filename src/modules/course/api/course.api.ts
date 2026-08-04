import { apiClient, normalizePagination, type Page, type RequestOptions } from "@/shared/api";
import type { CourseStudentSearchResult, Enrollment } from "@/shared/types";
import { courseEndpoints } from "./course.endpoints";
import type {
  CourseDto,
  CourseFormInput,
  CourseStudentSearchDto,
  EnrollmentAction,
  EnrollmentDto,
  EnrollPayload,
} from "./course.dto";
import {
  mapCourseDto,
  mapCoursePage,
  mapCourseRequest,
  mapCourseUserDto,
  mapEnrollmentDto,
} from "../lib/course.mappers";

function mapEnrollmentPage(payload: unknown, options?: RequestOptions["query"]): Page<Enrollment> {
  const page = normalizePagination<EnrollmentDto>(payload, options);
  return { ...page, items: page.items.map(mapEnrollmentDto) };
}

export const courseApi = {
  async getAll(options: RequestOptions = {}) {
    return mapCoursePage(await apiClient.get(courseEndpoints.list, options), options.query);
  },
  async getCatalog(options: RequestOptions = {}) {
    return mapCoursePage(await apiClient.get(courseEndpoints.catalog, options), options.query);
  },
  async getById(id: string, options?: RequestOptions) {
    return mapCourseDto(await apiClient.get<CourseDto>(courseEndpoints.detail(id), options));
  },
  async create(form: CourseFormInput) {
    return mapCourseDto(await apiClient.post<CourseDto>(courseEndpoints.list, mapCourseRequest(form)));
  },
  async update(id: string, form: CourseFormInput) {
    return mapCourseDto(
      await apiClient.patch<CourseDto>(courseEndpoints.detail(id), mapCourseRequest(form))
    );
  },
  async remove(id: string) {
    await apiClient.delete(courseEndpoints.detail(id));
    return id;
  },
  async getStudents(id: string, options: RequestOptions = {}) {
    return mapEnrollmentPage(await apiClient.get(courseEndpoints.students(id), options), options.query);
  },
  /** O'qituvchi username bo'yicha bazadan qidiradi (EduTech.docx talabi). */
  async searchStudents(
    id: string,
    query: string,
    options: RequestOptions = {}
  ): Promise<CourseStudentSearchResult[]> {
    const items = await apiClient.get<CourseStudentSearchDto[]>(courseEndpoints.searchStudents(id), {
      ...options,
      query: { q: query },
    });
    return items.map((item) => ({
      ...mapCourseUserDto(item),
      enrollStatus: item.enroll_status ?? null,
    }));
  },
  async enroll(id: string, payload: EnrollPayload = {}) {
    return mapEnrollmentDto(await apiClient.post<EnrollmentDto>(courseEndpoints.enroll(id), payload));
  },
  async unenroll(id: string, studentId?: string) {
    return apiClient.post(courseEndpoints.unenroll(id), studentId ? { student_id: studentId } : {});
  },
  async getRequests(options: RequestOptions = {}) {
    return mapEnrollmentPage(await apiClient.get(courseEndpoints.requests, options), options.query);
  },
  async respondRequest(enrollmentId: string, action: EnrollmentAction) {
    return mapEnrollmentDto(
      await apiClient.post<EnrollmentDto>(courseEndpoints.respondRequest, {
        enrollment_id: enrollmentId,
        action,
      })
    );
  },
};
