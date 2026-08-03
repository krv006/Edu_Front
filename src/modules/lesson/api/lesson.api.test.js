import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/api";
import { lessonApi } from "./lesson.api";
afterEach(() => vi.restoreAllMocks());
describe("lessonApi create", () => { it("timezone aniq starts_at DTO yuboradi", async () => { vi.spyOn(apiClient, "post").mockResolvedValue({ id: "l1", course: "c1", course_title: "Algebra", title: "Kvadrat tenglama", starts_at: "2026-08-04T15:30:00+05:00", duration_min: 45, status: "scheduled" }); await lessonApi.create({ courseId: "c1", title: "Kvadrat tenglama", startsAt: "2026-08-04T15:30:00+05:00", durationMinutes: 45 }); expect(apiClient.post).toHaveBeenCalledWith("/api/v1/lessons/", { course: "c1", title: "Kvadrat tenglama", starts_at: "2026-08-04T15:30:00+05:00", duration_min: 45 }); }); });
