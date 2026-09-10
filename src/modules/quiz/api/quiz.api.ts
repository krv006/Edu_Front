import { apiClient, normalizePagination, type RequestOptions } from "@/shared/api";
import type { QuizFormValues } from "@/shared/types";
import { quizEndpoints } from "./quiz.endpoints";
import type {
  QuizAttemptResultDto,
  QuizAttemptSummaryDto,
  QuizDto,
  QuizImportPreviewDto,
  QuizSummaryDto,
} from "./quiz.dto";
import {
  mapQuizAttemptRequest,
  mapQuizAttemptResultDto,
  mapQuizAttemptSummaryDto,
  mapQuizDto,
  mapQuizImportPreviewDto,
  mapQuizRequest,
  mapQuizSummaryDto,
} from "../lib/quiz.mappers";

export const quizApi = {
  /**
   * Rolga qarab avtomatik filtrlanadi — backend `course` bo'yicha ham cheklaydi.
   * Javob massiv ham, DRF `{count, results}` sahifalangan shakl ham bo'lishi
   * mumkin — `normalizePagination` ikkalasini ham bir xil qiladi.
   */
  async getAll(courseId: string | null, options: RequestOptions = {}) {
    const dto = await apiClient.get<unknown>(quizEndpoints.list, {
      ...options,
      query: { course: courseId },
    });
    return normalizePagination<QuizSummaryDto>(dto).items.map(mapQuizSummaryDto);
  },
  /** O'qituvchi/adminda `is_correct` bilan, o'quvchi/ota-onada javob kaliti yashiringan. */
  async getById(id: string, options?: RequestOptions) {
    return mapQuizDto(await apiClient.get<QuizDto>(quizEndpoints.detail(id), options));
  },
  async create(form: QuizFormValues) {
    return mapQuizDto(await apiClient.post<QuizDto>(quizEndpoints.list, mapQuizRequest(form)));
  },
  /** `.docx` yoki `.xlsx` — kengaytmaga qarab backend o'zi tanlaydi.
   * Hech narsa saqlanmaydi — faqat parse qilingan preview qaytadi. */
  async importDocx(file: File) {
    const body = new FormData();
    body.set("file", file);
    return mapQuizImportPreviewDto(
      await apiClient.post<QuizImportPreviewDto>(quizEndpoints.import, body)
    );
  },
  /** Bo'sh shablon fayl — to'ldirib qaytadan `importDocx`ga yuborish uchun mo'ljallangan. */
  async downloadTemplate(type: "docx" | "xlsx", count: number) {
    return apiClient.get<Blob>(quizEndpoints.template, {
      responseType: "blob",
      query: { type, count },
    });
  },
  async remove(id: string) {
    await apiClient.delete(quizEndpoints.detail(id));
    return id;
  },
  async submitAttempt(
    quizId: string,
    answers: Array<{ questionId: string; selectedOptionId: string | null }>
  ) {
    return mapQuizAttemptResultDto(
      await apiClient.post<QuizAttemptResultDto>(
        quizEndpoints.attempts(quizId),
        mapQuizAttemptRequest(answers)
      )
    );
  },
  /** Cheklanmagan qayta urinish — har safar yangi qator, eskisi o'chmaydi. */
  async getAttempts(quizId: string, options?: RequestOptions) {
    const dto = await apiClient.get<unknown>(quizEndpoints.attempts(quizId), options);
    return normalizePagination<QuizAttemptSummaryDto>(dto).items.map(mapQuizAttemptSummaryDto);
  },
};
