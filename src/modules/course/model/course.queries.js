import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { courseApi } from "../api/course.api";

export const courseKeys = Object.freeze({ all: ["courses"], lists: () => ["courses", "list"], list: (params = {}) => ["courses", "list", params], catalog: (params = {}) => ["courses", "catalog", params], detail: (id) => ["courses", "detail", id], students: (id, params = {}) => ["courses", id, "students", params], requests: ["courses", "requests"] });
export function useCourses(params = {}) { return useQuery({ queryKey: courseKeys.list(params), queryFn: ({ signal }) => courseApi.getAll({ signal, query: params }), select: (data) => data.items }); }
export function useCoursePage(params = {}) { return useQuery({ queryKey: courseKeys.list(params), queryFn: ({ signal }) => courseApi.getAll({ signal, query: params }) }); }
export function useCourseCatalog(params = {}) { return useQuery({ queryKey: courseKeys.catalog(params), queryFn: ({ signal }) => courseApi.getCatalog({ signal, query: params }) }); }
export function useCourse(id) { return useQuery({ queryKey: courseKeys.detail(id), queryFn: ({ signal }) => courseApi.getById(id, { signal }), enabled: Boolean(id) }); }
export function useCourseStudents(id, params = {}) { return useQuery({ queryKey: courseKeys.students(id, params), queryFn: ({ signal }) => courseApi.getStudents(id, { signal, query: params }), enabled: Boolean(id) }); }
export function useCourseRequests(params = {}) { return useQuery({ queryKey: [...courseKeys.requests, params], queryFn: ({ signal }) => courseApi.getRequests({ signal, query: params }) }); }
export function useCreateCourse() { const client = useQueryClient(); return useMutation({ mutationFn: courseApi.create, onSuccess: () => { client.invalidateQueries({ queryKey: courseKeys.all }); toast.success("Kurs yaratildi"); } }); }
export function useUpdateCourse() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, form }) => courseApi.update(id, form), onSuccess: (course) => { client.invalidateQueries({ queryKey: courseKeys.all }); client.setQueryData(courseKeys.detail(course.id), course); toast.success("Kurs yangilandi"); } }); }
export function useDeleteCourse() { const client = useQueryClient(); return useMutation({ mutationFn: courseApi.remove, onSuccess: () => { client.invalidateQueries({ queryKey: courseKeys.all }); toast.success("Kurs o‘chirildi"); } }); }
export function useCreateEnrollment() { const client = useQueryClient(); return useMutation({ mutationFn: ({ courseId, payload }) => courseApi.enroll(courseId, payload), onSuccess: () => { client.invalidateQueries({ queryKey: courseKeys.all }); toast.success("Yozilish so‘rovi yuborildi"); } }); }
export function useRespondCourseRequest() { const client = useQueryClient(); return useMutation({ mutationFn: ({ enrollmentId, action }) => courseApi.respondRequest(enrollmentId, action), onSuccess: () => { client.invalidateQueries({ queryKey: courseKeys.all }); toast.success("Yozilish so‘rovi yangilandi"); } }); }
