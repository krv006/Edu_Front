import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "@/app/layouts/auth-layout";
import { RootLayout } from "@/app/layouts/root-layout";
import { ROLES } from "@/shared/constants";
import { LoadingFallback } from "@/shared/ui/legacy";
import { ProtectedRoute } from "./protected-route";
import { PublicRoute } from "./public-route";
import { RoleRoute } from "./role-route";
import { RouteErrorBoundary } from "./route-error-boundary";
import { ForbiddenPage, NotFoundPage } from "./route-status-pages";
import { ROUTES } from "./route-paths";

const LoginPage = lazy(() =>
  import("@/pages/auth/login-page").then((module) => ({
    default: module.LoginPage,
  }))
);
const RegisterPage = lazy(() =>
  import("@/pages/auth/register-page").then((module) => ({ default: module.RegisterPage }))
);
const TeacherLayout = lazy(() =>
  import("@/app/layouts/teacher-layout").then((module) => ({
    default: module.TeacherLayout,
  }))
);
const ChatsPage = lazy(() =>
  import("@/pages/teacher/chats-page").then((module) => ({
    default: module.ChatsPage,
  }))
);
const ConversationPage = lazy(() =>
  import("@/pages/teacher/conversation-page").then((module) => ({
    default: module.ConversationPage,
  }))
);
const StudentLayout = lazy(() =>
  import("@/app/layouts/student-layout").then((module) => ({
    default: module.StudentLayout,
  }))
);
const StudentConversationPage = lazy(() =>
  import("@/pages/student/conversation-page").then((module) => ({
    default: module.StudentConversationPage,
  }))
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
const DesignSystemPage = lazy(() => import("@/pages/design-system/design-system-page").then((module) => ({ default: module.DesignSystemPage })));
const BoardPage = lazy(() => import("@/pages/board/board-page").then((module) => ({ default: module.BoardPage })));

export function AppRouter() {
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
                {/* Doska havolasi chat xabaridan keladi — rol cheklovi backend tomonda. */}
                <Route path="/boards/:lessonId" element={<BoardPage />} />

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
                    element={<Navigate to={ROUTES.student.chats} replace />}
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
                  </Route>
                </Route>

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
