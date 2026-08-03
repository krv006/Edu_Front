import { useQuery } from "@tanstack/react-query";
import { courseApi } from "../api/course.api";

export const courseKeys = Object.freeze({ all: ["courses"], detail: (id) => ["courses", id] });
export function useCourses() { return useQuery({ queryKey: courseKeys.all, queryFn: () => courseApi.getAll() }); }
export function useCourse(id) { return useQuery({ queryKey: courseKeys.detail(id), queryFn: () => courseApi.getById(id), enabled: Boolean(id) }); }
