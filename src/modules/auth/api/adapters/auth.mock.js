import { currentParent, currentStudent, currentTeacher } from "@/modules/user";

const accounts = [
  {
    aliases: ["teacher", "teacher@fokus.uz"],
    passwords: ["teacher123", "1"],
    user: currentTeacher,
  },
  {
    aliases: ["student", "student@fokus.uz"],
    passwords: ["student123", "1"],
    user: currentStudent,
  },
  {
    aliases: ["parent", "parent@fokus.uz"],
    passwords: ["parent123", "1"],
    user: currentParent,
  },
];

export async function mockLogin(credentials) {
  await new Promise((resolve) => globalThis.setTimeout(resolve, 520));
  const login = credentials.login.trim().toLowerCase();
  const account = accounts.find(
    (item) =>
      item.aliases.includes(login) &&
      item.passwords.includes(credentials.password)
  );
  if (!account) throw new Error("Login yoki parol noto‘g‘ri");
  return structuredClone(account.user);
}
