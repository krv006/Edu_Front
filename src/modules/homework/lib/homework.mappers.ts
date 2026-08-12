import type { AiResult, Assignment, Submission } from "@/shared/types";
import type {
  AiResultDto,
  AssignmentDto,
  AssignmentFormInput,
  SubmissionDto,
} from "../api/homework.dto";

export function mapAiResultDto(dto: AiResultDto | null | undefined): AiResult | null {
  if (!dto) return null;
  return {
    overallScore: dto.overall_score ?? null,
    grade: dto.grade ?? "",
    questions: (dto.questions ?? []).map((item) => ({
      questionNumber: item.question_number,
      question: item.question,
      studentAnswer: item.student_answer,
      expectedSolution: item.expected_solution,
      analysis: item.analysis,
      mistakes: item.mistakes ?? [],
      errorCategories: item.error_categories ?? [],
      correctAnswer: item.correct_answer,
      suggestions: item.suggestions ?? [],
      difficulty: item.difficulty,
      score: item.score,
    })),
    summary: dto.summary
      ? {
          strengths: dto.summary.strengths ?? [],
          weaknesses: dto.summary.weaknesses ?? [],
          topicsToReview: dto.summary.topics_to_review ?? [],
          recommendations: dto.summary.recommendations ?? [],
        }
      : null,
  };
}

export function mapSubmissionDto(dto: SubmissionDto | null | undefined): Submission | null {
  if (!dto) return null;
  return {
    id: String(dto.id),
    assignmentId: String(dto.assignment_id),
    studentId: String(dto.student_id),
    studentName: dto.student_name,
    fileName: dto.file_name,
    status: dto.status,
    overallScore: dto.overall_score,
    grade: dto.grade,
    error: dto.error || "",
    isLate: Boolean(dto.is_late),
    createdAt: dto.created_at,
    checkedAt: dto.checked_at,
    result: mapAiResultDto(dto.result),
  };
}

export function mapAssignmentDto(dto: AssignmentDto): Assignment {
  return {
    id: String(dto.id),
    courseId: String(dto.course_id),
    courseTitle: dto.course_title,
    subject: dto.subject,
    title: dto.title,
    description: dto.description || "",
    body: dto.body || "",
    attachmentName: dto.attachment_name || "",
    hasAttachment: Boolean(dto.has_attachment),
    dueAt: dto.due_at,
    skillKey: dto.skill_key || "",
    lessonId: dto.lesson_id == null ? null : String(dto.lesson_id),
    lessonTitle: dto.lesson_title || "",
    createdAt: dto.created_at,
    submissionsCount: dto.submissions_count ?? null,
    mySubmission: mapSubmissionDto(dto.my_submission),
    submissions: (dto.submissions ?? [])
      .map(mapSubmissionDto)
      .filter((item): item is Submission => item !== null),
    stats: dto.stats
      ? {
          studentsCount: dto.stats.students_count ?? null,
          submittedCount: dto.stats.submitted_count ?? null,
          averageScore: dto.stats.avg_score ?? null,
        }
      : null,
  };
}

/** Vazifa multipart bilan yuboriladi — matn ham, biriktirilgan fayl ham bitta so'rovda. */
export function mapAssignmentRequest(form: AssignmentFormInput): FormData {
  const data = new FormData();
  data.set("course_id", String(form.courseId ?? ""));
  data.set("title", form.title);
  data.set("description", form.description || "");
  data.set("body", form.body || form.description || "");
  if (form.dueAt) data.set("due_at", form.dueAt);
  if (form.skillKey) data.set("skill_key", form.skillKey);
  // Faqat TUGAGAN darsga bog'lasa bo'ladi — aks holda backend 400 qaytaradi.
  if (form.lessonId) data.set("lesson_id", form.lessonId);
  if (form.extraInstructions) data.set("extra_instructions", form.extraInstructions);
  if (form.file) data.set("attachment", form.file);
  return data;
}
