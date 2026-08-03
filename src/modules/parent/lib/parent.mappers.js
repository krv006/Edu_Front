const tones = ["blue", "violet", "emerald", "amber"];
const fullName = (user = {}) => [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;

export function mapParentLinkDto(dto) {
  const student = dto.student ?? {}; const parent = dto.parent ?? {};
  return { id: String(dto.id), parentId: String(parent.id), studentId: String(student.id), status: dto.status, createdAt: dto.created_at, respondedAt: dto.responded_at, parent: { id: String(parent.id), name: fullName(parent), username: parent.username }, student: { id: String(student.id), name: fullName(student), username: student.username, phone: student.phone ?? null, inviteCode: student.invite_code ?? null } };
}
export function mapChildFromLink(link, attendance = []) {
  const rows = attendance.filter((item) => item.studentId === link.studentId); const minutes = rows.reduce((sum, item) => sum + item.minutes, 0);
  return { id: link.studentId, linkId: link.id, name: link.student.name, username: `@${link.student.username}`, grade: "O‘quvchi", lessons: rows.length, minutes, lastActivity: rows[0]?.lesson ?? "Faollik yo‘q", status: link.status === "approved" ? "verified" : link.status, avatarTone: tones[Math.abs(link.studentId.charCodeAt(0) || 0) % tones.length] };
}
export function createParentDashboard(links, attendance) {
  const approved = links.filter((item) => item.status === "approved");
  return { metrics: [
    { id: "children", label: "Farzandlar", value: String(approved.length), icon: "children" },
    { id: "requests", label: "Kutilayotgan so‘rov", value: String(links.filter((item) => item.status === "pending").length), icon: "requests" },
    { id: "lessons", label: "Qatnashgan darslar", value: String(attendance.length), icon: "lessons" },
    { id: "minutes", label: "Jami daqiqa", value: String(attendance.reduce((sum, item) => sum + item.minutes, 0)), icon: "minutes" },
  ] };
}
