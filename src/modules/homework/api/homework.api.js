import { apiClient } from "@/shared/api";
import { homeworkEndpoints } from "./homework.endpoints";
import { mapAssignmentDto, mapAssignmentRequest, mapSubmissionDto } from "../lib/homework.mappers";
import { validateHomeworkFile } from "../lib/homework-validation";
export const homeworkApi = {
  async getAssignments(courseId, options = {}) { return (await apiClient.get(homeworkEndpoints.assignments, { ...options, query: { course: courseId } })).map(mapAssignmentDto); },
  async getAssignment(id, options) { return mapAssignmentDto(await apiClient.get(homeworkEndpoints.assignment(id), options)); },
  async createAssignment(form) { if (form.file) validateHomeworkFile(form.file, { assignment: true }); return mapAssignmentDto(await apiClient.post(homeworkEndpoints.assignments, mapAssignmentRequest(form))); },
  async deleteAssignment(id) { await apiClient.delete(homeworkEndpoints.assignment(id)); return id; },
  async downloadAssignment(id, options) { return apiClient.get(homeworkEndpoints.assignmentFile(id), { ...options, responseType: "blob" }); },
  async submit(assignmentId, file, skillKey) { validateHomeworkFile(file, { speaking: skillKey === "speaking" }); const body = new FormData(); body.set("file", file); return mapSubmissionDto(await apiClient.post(homeworkEndpoints.submit(assignmentId), body)); },
  async getSubmission(id, options) { return mapSubmissionDto(await apiClient.get(homeworkEndpoints.submission(id), options)); },
  async downloadSubmission(id, options) { return apiClient.get(homeworkEndpoints.submissionFile(id), { ...options, responseType: "blob" }); },
  async recheck(id) { return mapSubmissionDto(await apiClient.post(homeworkEndpoints.recheck(id), {})); },
};
