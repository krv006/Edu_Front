import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { QueryParams } from "@/shared/api";
import { lessonApi } from "../api/lesson.api";
import type { LessonFormInput } from "../api/lesson.dto";

export const lessonKeys = Object.freeze({
  all: ["lessons"] as const,
  list: (params: QueryParams = {}) => ["lessons", "list", params] as const,
  detail: (id: string) => ["lessons", "detail", id] as const,
});

export function useLessons(params: QueryParams = {}) {
  return useQuery({
    queryKey: lessonKeys.list(params),
    queryFn: ({ signal }) => lessonApi.getAll({ signal, query: params }),
    select: (page) => page.items,
  });
}

export function useLessonPage(params: QueryParams = {}) {
  return useQuery({
    queryKey: lessonKeys.list(params),
    queryFn: ({ signal }) => lessonApi.getAll({ signal, query: params }),
  });
}

export function useLesson(id: string | null) {
  return useQuery({
    queryKey: lessonKeys.detail(id ?? ""),
    queryFn: ({ signal }) => lessonApi.getById(id as string, { signal }),
    enabled: Boolean(id),
  });
}

export function useCreateLesson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (form: LessonFormInput) => lessonApi.create(form),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: lessonKeys.all });
      toast.success("Dars saqlandi");
    },
  });
}

export function useUpdateLesson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: LessonFormInput }) => lessonApi.update(id, form),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: lessonKeys.all });
      toast.success("Dars yangilandi");
    },
  });
}

export function useDeleteLesson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lessonApi.remove(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: lessonKeys.all });
      toast.success("Dars o‘chirildi");
    },
  });
}

export function useFinishLesson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lessonApi.finish(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: lessonKeys.all });
      toast.success("Dars yakunlandi");
    },
  });
}
