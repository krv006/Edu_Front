import { normalizePagination } from "@/shared/api";

const tones = ["violet", "blue", "emerald", "amber", "rose"];

export function mapCourseDto(dto) {
  const teacher = dto?.teacher ?? {};
  return {
    id: String(dto.id),
    title: dto.title,
    subject: dto.subject || "Umumiy",
    description: dto.description || "",
    teacher: [teacher.first_name, teacher.last_name].filter(Boolean).join(" ") || teacher.username || "O‘qituvchi",
    teacherUser: teacher.id ? mapCourseUserDto(teacher) : null,
    students: Number(dto.student_count ?? 0),
    studentCount: Number(dto.student_count ?? 0),
    status: dto.my_status ?? "joined",
    enrollmentStatus: dto.my_status ?? null,
    isActive: dto.is_active !== false,
    createdAt: dto.created_at ?? null,
    color: tones[Math.abs(String(dto.id).charCodeAt(0) || 0) % tones.length],
  };
}

export function mapCourseUserDto(dto) {
  return {
    id: String(dto.id), username: dto.username,
    name: [dto.first_name, dto.last_name].filter(Boolean).join(" ") || dto.username,
    firstName: dto.first_name || "", lastName: dto.last_name || "",
    role: dto.role, phone: dto.phone ?? null, inviteCode: dto.invite_code ?? null,
    avatarTone: tones[Math.abs(String(dto.id).charCodeAt(0) || 0) % tones.length],
    status: "offline",
  };
}

export function mapEnrollmentDto(dto) {
  return {
    id: String(dto.id), courseId: String(dto.course), courseTitle: dto.course_title,
    student: mapCourseUserDto(dto.student), status: dto.status, createdAt: dto.created_at,
  };
}

export function mapCoursePage(dto, options) {
  const page = normalizePagination(dto, options);
  return { ...page, items: page.items.map(mapCourseDto) };
}

export function mapCourseRequest(form) {
  return { title: form.name ?? form.title, subject: form.subject ?? "", description: form.description ?? "" };
}
