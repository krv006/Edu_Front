import type { SubmissionStatus } from "@/shared/types";

/** Gemini savolma-savol tahlili (docs/PROJECT.md §6) — barcha matnlar o'zbekcha. */
export interface AiQuestionDto {
  question_number?: number;
  question?: string;
  student_answer?: string;
  expected_solution?: string;
  analysis?: string;
  mistakes?: unknown[];
  error_categories?: unknown[];
  correct_answer?: string;
  suggestions?: unknown[];
  difficulty?: string;
  score?: number | null;
}

export interface AiSummaryDto {
  strengths?: unknown[];
  weaknesses?: unknown[];
  topics_to_review?: unknown[];
  recommendations?: unknown[];
}

export interface AiResultDto {
  overall_score?: number | null;
  grade?: string;
  questions?: AiQuestionDto[];
  summary?: AiSummaryDto | null;
}

export interface SubmissionDto {
  id: string | number;
  assignment_id: string | number;
  student_id: string | number;
  student_name: string;
  file_name: string;
  status: SubmissionStatus;
  overall_score: number | null;
  grade: string;
  error?: string;
  is_late?: boolean;
  created_at: string;
  checked_at: string | null;
  result?: AiResultDto | null;
}

export interface AssignmentStatsDto {
  students_count?: number | null;
  submitted_count?: number | null;
  avg_score?: number | null;
}

export interface AssignmentDto {
  id: string | number;
  course_id: string | number;
  course_title: string;
  subject: string;
  title: string;
  description?: string;
  body?: string;
  attachment_name?: string;
  has_attachment?: boolean;
  due_at: string | null;
  skill_key?: string;
  created_at: string;
  submissions_count?: number | null;
  my_submission?: SubmissionDto | null;
  submissions?: SubmissionDto[];
  stats?: AssignmentStatsDto | null;
}

/** `AddAssignmentDialog` yuboradigan forma. */
export interface AssignmentFormInput {
  courseId: string | null;
  title: string;
  description?: string;
  body?: string;
  dueAt?: string;
  skillKey?: string;
  extraInstructions?: string;
  file?: File | null;
}
