import { describe, expect, it } from "vitest";
import { mapCourseDto, mapCourseRequest, mapEnrollmentDto } from "./course.mappers";

describe("course DTO mappers", () => {
  it("course create formasidan faqat backend maydonlarini oladi", () => {
    expect(mapCourseRequest({ name: "Algebra", subject: "Matematika", description: "7-sinf", ignored: true })).toEqual({ title: "Algebra", subject: "Matematika", description: "7-sinf" });
  });
  it("course va enrollment DTOlarini UI modeliga aylantiradi", () => {
    expect(mapCourseDto({ id: "c1", title: "Algebra", subject: "Matematika", teacher: { id: "t1", username: "malika", first_name: "Malika", last_name: "Karimova" }, student_count: 12, my_status: "approved" })).toMatchObject({ id: "c1", teacher: "Malika Karimova", students: 12, enrollmentStatus: "approved" });
    expect(mapEnrollmentDto({ id: "e1", course: "c1", course_title: "Algebra", student: { id: "s1", username: "sardor", first_name: "Sardor", last_name: "Aliyev" }, status: "pending" })).toMatchObject({ id: "e1", courseId: "c1", status: "pending", student: { name: "Sardor Aliyev" } });
  });
});
