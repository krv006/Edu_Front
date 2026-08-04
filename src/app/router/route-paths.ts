function segment(value) {
  return encodeURIComponent(String(value));
}

export const ROUTES = Object.freeze({
  root: "/",
  auth: Object.freeze({
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
  }),
  teacher: Object.freeze({
    root: "/teacher",
    dashboard: "/teacher/dashboard",
    chats: "/teacher/chats",
    chat: (conversationId) => `/teacher/chats/${segment(conversationId)}`,
    courses: "/teacher/courses",
    course: (courseId) => `/teacher/courses/${segment(courseId)}`,
    courseLessons: (courseId) => `/teacher/courses/${segment(courseId)}/lessons`,
    attendance: "/teacher/attendance",
    schedule: "/teacher/schedule",
    profile: "/teacher/profile",
    settings: "/teacher/settings",
  }),
  student: Object.freeze({
    root: "/student",
    dashboard: "/student/dashboard",
    courses: "/student/courses",
    course: (courseId) => `/student/courses/${segment(courseId)}`,
    assignments: "/student/assignments",
    grades: "/student/grades",
    schedule: "/student/schedule",
    chats: "/student/chats",
  }),
  parent: Object.freeze({
    root: "/parent",
    dashboard: "/parent/dashboard",
    children: "/parent/children",
    child: (childId) => `/parent/children/${segment(childId)}`,
    attendance: "/parent/attendance",
    homework: "/parent/homework",
    grades: "/parent/grades",
    payments: "/parent/payments",
    chats: "/parent/chats",
  }),
  admin: Object.freeze({
    root: "/admin",
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    courses: "/admin/courses",
    payments: "/admin/payments",
    reports: "/admin/reports",
  }),
  errors: Object.freeze({
    forbidden: "/forbidden",
    notFound: "/not-found",
  }),
});
