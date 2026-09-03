import { apiClient, type RequestOptions } from "@/shared/api";
import type { QuizFormValues } from "@/shared/types";
import { quizEndpoints } from "./quiz.endpoints";
import type { QuizAttemptResultDto, QuizAttemptSummaryDto, QuizDto, QuizSummaryDto } from "./quiz.dto";
import {
  mapQuizAttemptRequest,
  mapQuizAttemptResultDto,
  mapQuizAttemptSummaryDto,
  mapQuizDto,
  mapQuizRequest,
  mapQuizSummaryDto,
} from "../lib/quiz.mappers";

export const quizApi = {
  /** Rolga qarab avtomatik filtrlanadi — backend `course` bo'yicha ham cheklaydi. */
  async getAll(courseId: string | null, options: RequestOptions = {}) {
    const items = await apiClient.get<QuizSummaryDto[]>(quizEndpoints.list, {
      ...options,
      query: { course: courseId },
    });
    return items.map(mapQuizSummaryDto);
  },
  /** O'qituvchi/adminda `is_correct` bilan, o'quvchi/ota-onada javob kaliti yashiringan. */
  async getById(id: string, options?: RequestOptions) {
    return mapQuizDto(await apiClient.get<QuizDto>(quizEndpoints.detail(id), options));
  },
  async create(form: QuizFormValues) {
    return mapQuizDto(await apiClient.post<QuizDto>(quizEndpoints.list, mapQuizRequest(form)));
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
    const items = await apiClient.get<QuizAttemptSummaryDto[]>(
      quizEndpoints.attempts(quizId),
      options
    );
    return items.map(mapQuizAttemptSummaryDto);
  },
};
