import { apiClient } from "@/shared/api";
import { attendanceApi } from "@/modules/attendance";
import { courseApi } from "@/modules/course";
import { homeworkApi } from "@/modules/homework";
import { authEndpoints } from "@/modules/auth";
import { createParentDashboard, mapChildFromLink, mapParentLinkDto } from "../lib/parent.mappers";

export const parentApi = {
  async getLinks(options) { return (await apiClient.get(authEndpoints.links, options)).map(mapParentLinkDto); },
  async getChildren(options) { const [links, attendancePage] = await Promise.all([this.getLinks(options), attendanceApi.getAll({ ...options, query: { page_size: 100 } })]); return links.filter((item) => item.status === "approved").map((link) => mapChildFromLink(link, attendancePage.items)); },
  async getDashboard(options = {}) { const { selectedChildId, ...requestOptions } = options; const [links, attendancePage] = await Promise.all([this.getLinks(requestOptions), attendanceApi.getAll({ ...requestOptions, query: { page_size: 100, ...(selectedChildId ? { student: selectedChildId } : {}) } })]); return createParentDashboard(links, attendancePage.items); },
  async createChild(dto) { return apiClient.post(authEndpoints.children, dto); },
  async requestLink(inviteCode) { return mapParentLinkDto(await apiClient.post(authEndpoints.requestLink, { invite_code: inviteCode })); },
  async respondLink(id, action) { return mapParentLinkDto(await apiClient.post(authEndpoints.respondLink(id), { action })); },
  async getConsents(options) { return (await apiClient.get(authEndpoints.consents, options)).map((item) => ({ id: String(item.id), studentId: String(item.student), kind: item.kind, granted: Boolean(item.granted), updatedAt: item.updated_at })); },
  async setConsent(dto) { const item = await apiClient.post(authEndpoints.consents, { student: dto.studentId, kind: dto.kind, granted: dto.granted }); return { id: String(item.id), studentId: String(item.student), kind: item.kind, granted: Boolean(item.granted), updatedAt: item.updated_at }; },
  async getHomework(selectedChildId, options = {}) { const coursePage = await courseApi.getAll({ ...options, query: { page_size: 100 } }); const assignments = (await Promise.all(coursePage.items.map((course) => homeworkApi.getAssignments(course.id, options).catch(() => [])))).flat(); const details = await Promise.all(assignments.map((item) => homeworkApi.getAssignment(item.id, options).catch(() => item))); return details.map((item) => ({ ...item, mySubmission: item.submissions?.find((submission) => submission.studentId === selectedChildId) ?? null })); },
};
