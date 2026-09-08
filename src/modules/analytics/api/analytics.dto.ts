export interface TopCourseDto {
  id: string;
  title: string;
  teacher_name: string;
  student_count: number;
  avg_rating: number | null;
  attendance_rate: number | null;
}

export interface TopTeacherDto {
  id: string;
  name: string;
  course_count: number;
  lessons_this_month: number;
  avg_rating: number | null;
  reliability: number | null;
}

export interface DashboardSummaryDto {
  active_students: number;
  active_teachers: number;
  active_courses: number;
  avg_rating: number | null;
  rating_count: number;
  top_courses: TopCourseDto[];
  top_teachers: TopTeacherDto[];
}

export type DashboardPeriodDto = "day" | "week" | "month" | "year";

export interface DashboardTrendsDto {
  period: DashboardPeriodDto;
  labels: string[];
  enrollments: number[];
  lessons_completed: number[];
  lessons_cancelled: number[];
  quiz_avg_score: Array<number | null>;
  attendance_rate: Array<number | null>;
}
