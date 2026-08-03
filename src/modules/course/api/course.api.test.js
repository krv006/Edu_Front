import { afterEach, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/api";
import { courseApi } from "./course.api";
afterEach(() => vi.restoreAllMocks());
it("course create formani backend DTOga o‘giradi", async () => { vi.spyOn(apiClient, "post").mockResolvedValue({ id: "c1", title: "Algebra", subject: "Matematika", teacher: { id: "t1", username: "teacher" }, student_count: 0 }); await expect(courseApi.create({ name: "Algebra", subject: "Matematika", description: "7-sinf" })).resolves.toMatchObject({ id: "c1", title: "Algebra" }); expect(apiClient.post).toHaveBeenCalledWith("/api/v1/courses/", { title: "Algebra", subject: "Matematika", description: "7-sinf" }); });
