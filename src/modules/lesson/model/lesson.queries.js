import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { lessonApi } from "../api/lesson.api";

export const lessonKeys = Object.freeze({ all: ["lessons"], list: (params = {}) => ["lessons", "list", params], detail: (id) => ["lessons", "detail", id] });
export function useLessons(params = {}) { return useQuery({ queryKey: lessonKeys.list(params), queryFn: ({ signal }) => lessonApi.getAll({ signal, query: params }), select: (page) => page.items }); }
export function useLessonPage(params = {}) { return useQuery({ queryKey: lessonKeys.list(params), queryFn: ({ signal }) => lessonApi.getAll({ signal, query: params }) }); }
export function useLesson(id) { return useQuery({ queryKey: lessonKeys.detail(id), queryFn: ({ signal }) => lessonApi.getById(id, { signal }), enabled: Boolean(id) }); }
export function useCreateLesson() { const client = useQueryClient(); return useMutation({ mutationFn: lessonApi.create, onSuccess: () => { client.invalidateQueries({ queryKey: lessonKeys.all }); toast.success("Dars saqlandi"); } }); }
export function useUpdateLesson() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, form }) => lessonApi.update(id, form), onSuccess: () => { client.invalidateQueries({ queryKey: lessonKeys.all }); toast.success("Dars yangilandi"); } }); }
export function useDeleteLesson() { const client = useQueryClient(); return useMutation({ mutationFn: lessonApi.remove, onSuccess: () => { client.invalidateQueries({ queryKey: lessonKeys.all }); toast.success("Dars o‘chirildi"); } }); }
export function useFinishLesson() { const client = useQueryClient(); return useMutation({ mutationFn: lessonApi.finish, onSuccess: () => { client.invalidateQueries({ queryKey: lessonKeys.all }); toast.success("Dars yakunlandi"); } }); }
