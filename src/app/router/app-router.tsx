import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "@/app/layouts/auth-layout";
import { RootLayout } from "@/app/layouts/root-layout";
import { useCurrentUser } from "@/modules/auth";
import { ROLES, type Role } from "@/shared/constants";
import { LoadingFallback } from "@/shared/ui/legacy";
import { ProtectedRoute } from "./protected-route";
import { PublicRoute } from "./public-route";
import { RoleRoute } from "./role-route";
import { RouteErrorBoundary } from "./route-error-boundary";
import { ForbiddenPage, NotFoundPage } from "./route-status-pages";
import { ROUTES } from "@/shared/config";

const LoginPage = lazy(() =>
  import("@/pages/auth/login-page").then((module) => ({
    default: module.LoginPage,
  }))
);
const RegisterPage = lazy(() =>
  import("@/pages/auth/register-page").then((module) => ({ default: module.RegisterPage }))
);
/*
 * Asosiy yo'ldagi bo'laklar oldindan yuklanishi uchun import funksiyalari
 * alohida nomlangan — `usePrefetchRoutes` aynan shularni chaqiradi.
 */
const loadTeacherLayout = () => import("@/app/layouts/teacher-layout");
const loadChatsPage = () => import("@/pages/teacher/chats-page");
const loadConversationPage = () => import("@/pages/teacher/conversation-page");
const loadStudentLayout = () => import("@/app/layouts/student-layout");
const loadStudentConversationPage = () => import("@/pages/student/conversation-page");

const TeacherLayout = lazy(() =>
  loadTeacherLayout().then((module) => ({ default: module.TeacherLayout }))
);
const ChatsPage = lazy(() => loadChatsPage().then((module) => ({ default: module.ChatsPage })));
const ConversationPage = lazy(() =>
  loadConversationPage().then((module) => ({ default: module.ConversationPage }))
);
const StudentLayout = lazy(() =>
  loadStudentLayout().then((module) => ({ default: module.StudentLayout }))
);
const StudentConversationPage = lazy(() =>
  loadStudentConversationPage().then((module) => ({ default: module.StudentConversationPage }))
);
const ParentLayout = lazy(() =>
  import("@/app/layouts/parent-layout").then((module) => ({
    default: module.ParentLayout,
  }))
);
const ParentDashboardPage = lazy(() =>
  import("@/pages/parent/dashboard/parent-dashboard-page").then((module) => ({
    default: module.ParentDashboardPage,
  }))
);
const ParentChildrenPage = lazy(() =>
  import("@/pages/parent/children/parent-children-page").then((module) => ({
    default: module.ParentChildrenPage,
  }))
);
const ParentAttendancePage = lazy(() =>
  import("@/pages/parent/attendance/parent-attendance-page").then((module) => ({
    default: module.ParentAttendancePage,
  }))
);
const ParentHomeworkPage = lazy(() => import("@/pages/parent/homework/parent-homework-page").then((module) => ({ default: module.ParentHomeworkPage })));
const AdminDashboardPage = lazy(() => import("@/pages/admin/admin-dashboard-page").then((module) => ({ default: module.AdminDashboardPage })));
const LiveLessonPage = lazy(() => import("@/pages/live/live-lesson-page").then((module) => ({ default: module.LiveLessonPage })));
const DesignSystemPage = lazy(() => import("@/pages/design-system/design-system-page").then((module) => ({ default: module.DesignSystemPage })));
const BoardPage = lazy(() => import("@/pages/board/board-page").then((module) => ({ default: module.BoardPage })));
const RecordingPage = lazy(() => import("@/pages/recording/recording-page").then((module) => ({ default: module.RecordingPage })));
const SchedulePage = lazy(() => import("@/pages/schedule/schedule-page").then((module) => ({ default: module.SchedulePage })));
const AiPage = lazy(() => import("@/pages/ai/ai-page").then((module) => ({ default: module.AiPage })));
const StudentReportPage = lazy(() => import("@/pages/student/report/student-report-page").then((module) => ({ default: module.StudentReportPage })));
const ParentReportPage = lazy(() => import("@/pages/parent/report/parent-report-page").then((module) => ({ default: module.ParentReportPage })));

type ChunkLoader = () => Promise<unknown>;

/** Rolga qarab keyingi bosiladigan sahifalarning bo'laklari. */
const PREFETCH_BY_ROLE: Partial<Record<Role, ChunkLoader[]>> = {
  [ROLES.TEACHER]: [loadTeacherLayout, loadChatsPage, loadConversationPage],
  [ROLES.STUDENT]: [loadStudentLayout, loadChatsPage, loadStudentConversationPage],
};

/** `requestIdleCallback` hamma brauzerda yo'q — bo'lmasa oddiy taymer. */
function scheduleIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(task, { timeout: 3000 });
    return () => window.cancelIdleCallback?.(handle);
  }
  const handle = window.setTimeout(task, 1500);
  return () => window.clearTimeout(handle);
}

/**
 * Sahifa bo'laklarini brauzer bo'sh turganda oldindan yuklaydi.
 *
 * Aks holda suhbat birinchi marta ochilganda bo'lak endi yuklana boshlaydi va
 * shu vaqt ichida butun ilova (yon panel bilan birga) `LoadingFallback`ga
 * almashadi. Jonli dars va doska bo'laklari ataylab yuklanmaydi — ular og'ir
 * (LiveKit, MathLive) va kamdan-kam kerak bo'ladi.
 */
function usePrefetchRoutes(role: Role | undefined) {
  useEffect(() => {
    const loaders = role ? PREFETCH_BY_ROLE[role] : undefined;
    if (!loaders) return undefined;
    return scheduleIdle(() => {
      for (const load of loaders) void load().catch(() => undefined);
    });
  }, [role]);
}

export function AppRouter() {
  usePrefetchRoutes(useCurrentUser()?.role);

  return (
    <BrowserRouter>
      <RouteErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route
                index
                element={<Navigate to={ROUTES.auth.login} replace />}
              />
              <Route element={<PublicRoute />}>
                <Route element={<AuthLayout />}>
                  <Route path={ROUTES.auth.login} element={<LoginPage />} />
                  <Route path={ROUTES.auth.register} element={<RegisterPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                {/* Doska va yozuv havolalari chat xabaridan keladi — rol cheklovi backend tomonda. */}
                <Route path="/boards/:lessonId" element={<BoardPage />} />
                <Route path="/recordings/:lessonId" element={<RecordingPage />} />

                <Route element={<RoleRoute allowedRoles={[ROLES.TEACHER]} />}>
                  <Route
                    path={ROUTES.teacher.root}
                    element={<Navigate to={ROUTES.teacher.dashboard} replace />}
                  />
                  <Route
                    path={ROUTES.teacher.dashboard}
                    element={<Navigate to={ROUTES.teacher.chats} replace />}
                  />
                  <Route
                    path={ROUTES.teacher.chats}
                    element={<TeacherLayout />}
                  >
                    <Route index element={<ChatsPage />} />
                    {/* Statik yo'llar dinamikdan ustun turadi — "schedule"
                        hech qachon suhbat id'si sifatida talqin qilinmaydi. */}
                    <Route path="schedule" element={<SchedulePage />} />
                    <Route path="ai" element={<AiPage />} />
                    <Route
                      path=":conversationId"
                      element={<ConversationPage />}
                    />
                  </Route>
                </Route>

                <Route element={<RoleRoute allowedRoles={[ROLES.STUDENT]} />}>
                  <Route
                    path={ROUTES.student.root}
                    element={<Navigate to={ROUTES.student.chats} replace />}
                  />
                  <Route
                    path={ROUTES.student.dashboard}
                    element={<Navigate to={ROUTES.student.chats} replace />}
                  />
                  <Route
                    path={ROUTES.student.courses}
                    element={<Navigate to={ROUTES.student.chats} replace />}
                  />
                  <Route
                    path={ROUTES.student.assignments}
                    element={<Navigate to={ROUTES.student.chats} replace />}
                  />
                  <Route
                    path={ROUTES.student.grades}
                    element={<Navigate to={`${ROUTES.student.chats}/report`} replace />}
                  />
                  <Route
                    path={ROUTES.student.schedule}
                    element={<Navigate to={ROUTES.student.chats} replace />}
                  />
                  <Route
                    path={ROUTES.student.chats}
                    element={<StudentLayout />}
                  >
                    <Route index element={<ChatsPage />} />
                    {/* Statik yo'llar dinamikdan ustun turadi — "schedule"
                        hech qachon suhbat id'si sifatida talqin qilinmaydi. */}
                    <Route path="schedule" element={<SchedulePage />} />
                    <Route path="ai" element={<AiPage />} />
                    <Route path="report" element={<StudentReportPage />} />
                    <Route
                      path=":conversationId"
                      element={<StudentConversationPage />}
                    />
                  </Route>
                </Route>

                <Route element={<RoleRoute allowedRoles={[ROLES.PARENT]} />}>
                  <Route path={ROUTES.parent.root} element={<ParentLayout />}>
                    <Route
                      index
                      element={
                        <Navigate to={ROUTES.parent.dashboard} replace />
                      }
                    />
                    <Route path="dashboard" element={<ParentDashboardPage />} />
                    <Route path="children" element={<ParentChildrenPage />} />
                    <Route
                      path="attendance"
                      element={<ParentAttendancePage />}
                    />
                    <Route path="homework" element={<ParentHomeworkPage />} />
                    <Route path="grades" element={<ParentReportPage />} />
                  </Route>
                </Route>

                <Route path="/live/:lessonId" element={<LiveLessonPage />} />

                <Route
                  element={
                    <RoleRoute
                      allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
                    />
                  }
                >
                  <Route
                    path={ROUTES.admin.root}
                    element={<Navigate to={ROUTES.admin.dashboard} replace />}
                  />
                  <Route
                    path={ROUTES.admin.dashboard}
                    element={<AdminDashboardPage />}
                  />
                </Route>
              </Route>

              <Route
                path={ROUTES.designSystem}
                element={<DesignSystemPage />}
              />
              <Route
                path={ROUTES.errors.forbidden}
                element={<ForbiddenPage />}
              />
              <Route path={ROUTES.errors.notFound} element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  );
}
