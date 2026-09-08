import type { DashboardSummary, DashboardTrends, TopCourseStat, TopTeacherStat } from "@/shared/types";
import type { DashboardSummaryDto, DashboardTrendsDto, TopCourseDto, TopTeacherDto } from "../api/analytics.dto";

export function mapTopCourseDto(dto: TopCourseDto): TopCourseStat {
  return {
    id: String(dto.id),
    title: dto.title,
    teacherName: dto.teacher_name,
    studentCount: dto.student_count,
    avgRating: dto.avg_rating,
    attendanceRate: dto.attendance_rate,
  };
}

export function mapTopTeacherDto(dto: TopTeacherDto): TopTeacherStat {
  return {
    id: String(dto.id),
    name: dto.name,
    courseCount: dto.course_count,
    lessonsThisMonth: dto.lessons_this_month,
    avgRating: dto.avg_rating,
    reliability: dto.reliability,
  };
}

export function mapDashboardSummaryDto(dto: DashboardSummaryDto): DashboardSummary {
  return {
    activeStudents: dto.active_students,
    activeTeachers: dto.active_teachers,
    activeCourses: dto.active_courses,
    avgRating: dto.avg_rating,
    ratingCount: dto.rating_count,
    topCourses: (dto.top_courses ?? []).map(mapTopCourseDto),
    topTeachers: (dto.top_teachers ?? []).map(mapTopTeacherDto),
  };
}

export function mapDashboardTrendsDto(dto: DashboardTrendsDto): DashboardTrends {
  return {
    period: dto.period,
    labels: dto.labels,
    enrollments: dto.enrollments,
    lessonsCompleted: dto.lessons_completed,
    lessonsCancelled: dto.lessons_cancelled,
    quizAvgScore: dto.quiz_avg_score,
    attendanceRate: dto.attendance_rate,
  };
}
