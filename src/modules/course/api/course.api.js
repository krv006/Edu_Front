import { apiClient, normalizePagination } from "@/shared/api";
import { courseEndpoints } from "./course.endpoints";
import { mapCourseDto, mapCoursePage, mapCourseRequest, mapCourseUserDto, mapEnrollmentDto } from "../lib/course.mappers";

export const courseApi = {
  async getAll(options = {}) { return mapCoursePage(await apiClient.get(courseEndpoints.list, options), options.query); },
  async getCatalog(options = {}) { return mapCoursePage(await apiClient.get(courseEndpoints.catalog, options), options.query); },
  async getById(id, options) { return mapCourseDto(await apiClient.get(courseEndpoints.detail(id), options)); },
  async create(form) { return mapCourseDto(await apiClient.post(courseEndpoints.list, mapCourseRequest(form))); },
  async update(id, form) { return mapCourseDto(await apiClient.patch(courseEndpoints.detail(id), mapCourseRequest(form))); },
  async remove(id) { await apiClient.delete(courseEndpoints.detail(id)); return id; },
  async getStudents(id, options = {}) { const page = normalizePagination(await apiClient.get(courseEndpoints.students(id), options), options.query); return { ...page, items: page.items.map(mapEnrollmentDto) }; },
  async searchStudents(id, query, options = {}) { return (await apiClient.get(courseEndpoints.searchStudents(id), { ...options, query: { q: query } })).map((item) => ({ ...mapCourseUserDto(item), enrollStatus: item.enroll_status ?? null })); },
  async enroll(id, payload = {}) { return mapEnrollmentDto(await apiClient.post(courseEndpoints.enroll(id), payload)); },
  async unenroll(id, studentId) { return apiClient.post(courseEndpoints.unenroll(id), studentId ? { student_id: studentId } : {}); },
  async getRequests(options = {}) { const page = normalizePagination(await apiClient.get(courseEndpoints.requests, options), options.query); return { ...page, items: page.items.map(mapEnrollmentDto) }; },
  async respondRequest(enrollmentId, action) { return mapEnrollmentDto(await apiClient.post(courseEndpoints.respondRequest, { enrollment_id: enrollmentId, action })); },
};
