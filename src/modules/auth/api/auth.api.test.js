import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient, AppError } from "@/shared/api";
import { authApi } from "./auth.api";
afterEach(() => vi.restoreAllMocks());
describe("authApi login", () => {
  it("login success javobini qaytaradi", async () => { vi.spyOn(apiClient, "post").mockResolvedValue({ access: "a", refresh: "r" }); await expect(authApi.login({ username: "teacher", password: "secret" })).resolves.toEqual({ access: "a", refresh: "r" }); expect(apiClient.post).toHaveBeenCalledWith("/api/v1/auth/login/", { username: "teacher", password: "secret" }, { skipAuth: true, skipRefresh: true }); });
  it("login errorni yutib yubormaydi", async () => { vi.spyOn(apiClient, "post").mockRejectedValue(new AppError({ status: 401, message: "Login xato" })); await expect(authApi.login({ username: "bad", password: "bad" })).rejects.toMatchObject({ status: 401, message: "Login xato" }); });
});
