import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./app/auth-context";

const LoginPage = lazy(() => import("./pages/auth/login-page").then((module) => ({ default: module.LoginPage })));
const TeacherLayout = lazy(() => import("./pages/teacher/teacher-layout").then((module) => ({ default: module.TeacherLayout })));
const ChatsPage = lazy(() => import("./pages/teacher/chats-page").then((module) => ({ default: module.ChatsPage })));
const ConversationPage = lazy(() => import("./pages/teacher/conversation-page").then((module) => ({ default: module.ConversationPage })));

function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Suspense fallback={<div className="app-loading" aria-label="Sahifa yuklanmoqda"><span /></div>}>
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/teacher"
          element={<Navigate to="/teacher/chats" replace />}
        />
        <Route path="/teacher/chats" element={<TeacherLayout />}>
          <Route index element={<ChatsPage />} />
          <Route path=":conversationId" element={<ConversationPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
