import { currentTeacher } from "../mocks/users.mock";

const SESSION_KEY = "fokus_teacher_session";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async login(credentials) {
    await delay(650);
    const supportedTeacherLogins = ["teacher", "teacher@fokus.uz"];
    if (
      !supportedTeacherLogins.includes(credentials.login.toLowerCase()) ||
      credentials.password !== "1"
    ) {
      throw new Error("Login yoki parol noto‘g‘ri");
    }
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(currentTeacher));
    return currentTeacher;
  },
  async logout() {
    await delay(200);
    window.localStorage.removeItem(SESSION_KEY);
  },
  getCurrentUser() {
    const session = window.localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },
  async refreshSession() {
    return this.getCurrentUser();
  },
};
