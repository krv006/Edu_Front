import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { QueryParams } from "@/shared/api";
import { lessonApi } from "../api/lesson.api";
import type { LessonFormInput } from "../api/lesson.dto";

export const lessonKeys = Object.freeze({
  all: ["lessons"] as const,
  list: (params: QueryParams = {}) => ["lessons", "list", params] as const,
  detail: (id: string) => ["lessons", "detail", id] as const,
  recording: (id: string) => ["lessons", "recording", id] as const,
});

/** Egress MP4 ni yozib tugatguncha holat `processing` — shu vaqtda sekin polling qilamiz. */
const RECORDING_POLL_MS = 15_000;

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
    mutationFn: ({ id, recordingTitle }: { id: string; recordingTitle?: string }) =>
      lessonApi.finish(id, recordingTitle),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: lessonKeys.all });
      toast.success("Dars yakunlandi — yozuv guruh chatiga tushadi");
    },
  });
}

export function useLessonRecording(id: string | null) {
  return useQuery({
    queryKey: lessonKeys.recording(id ?? ""),
    queryFn: ({ signal }) => lessonApi.getRecording(id as string, { signal }),
    enabled: Boolean(id),
    // Havola 3 soatlik va imzolangan — keshdan eskirgan URL bilan pleer ochilib qolmasin.
    staleTime: 0,
    // Dars davomida egress hali yozmoqda — tayyor bo'lgunicha kuzatib turamiz.
    refetchInterval: (query) => (query.state.data?.status === "recording" ? RECORDING_POLL_MS : false),
  });
}

export function useDeleteRecording() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lessonApi.removeRecording(id),
    onSuccess: (id) => {
      client.invalidateQueries({ queryKey: lessonKeys.recording(id) });
      toast.success("Video yozuv o‘chirildi");
    },
  });
}
