export { quizApi } from "./api/quiz.api";
export { quizEndpoints } from "./api/quiz.endpoints";
export type {
  QuizAttemptAnswerDto,
  QuizAttemptResultDto,
  QuizAttemptSummaryDto,
  QuizDto,
  QuizOptionDto,
  QuizQuestionDto,
  QuizSummaryDto,
} from "./api/quiz.dto";
export {
  mapQuizAttemptAnswerDto,
  mapQuizAttemptResultDto,
  mapQuizAttemptSummaryDto,
  mapQuizDto,
  mapQuizOptionDto,
  mapQuizQuestionDto,
  mapQuizRequest,
  mapQuizSummaryDto,
} from "./lib/quiz.mappers";
export {
  quizKeys,
  useCreateQuiz,
  useDeleteQuiz,
  useQuiz,
  useQuizAttempts,
  useQuizzes,
  useSubmitQuizAttempt,
} from "./model/quiz.queries";
export { QuizAttemptDialog } from "./ui/quiz-attempt-dialog";
export { QuizAttemptsDialog } from "./ui/quiz-attempts-dialog";
