import { apiClient } from "@/shared/api";
import { boardEndpoints } from "./board.endpoints";
import { mapBoardDto } from "../lib/board.mappers";
export const boardApi = {
  async getState(lessonId, options) { return mapBoardDto(await apiClient.get(boardEndpoints.state(lessonId), options)); },
  addStroke: (lessonId, sheet, stroke) => apiClient.post(boardEndpoints.stroke(lessonId), { sheet, stroke }),
  addSheet: (lessonId) => apiClient.post(boardEndpoints.sheet(lessonId), {}),
  erase: (lessonId, sheet, strokeIds, reason) => apiClient.post(boardEndpoints.erase(lessonId), { sheet, stroke_ids: strokeIds, reason }),
  grant: (lessonId, studentId) => apiClient.post(boardEndpoints.grant(lessonId), { student_id: studentId }),
  solve: (lessonId, expression) => apiClient.post(boardEndpoints.solve(lessonId), { expr: expression }),
  downloadPdf: (lessonId, options) => apiClient.get(boardEndpoints.pdf(lessonId), { ...options, responseType: "blob" }),
};
