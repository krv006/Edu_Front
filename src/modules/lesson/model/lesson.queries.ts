import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { QueryParams } from "@/shared/api";
import { lessonApi } from "../api/lesson.api";
import type { LessonFormInput, LessonRatingInput } from "../api/lesson.dto";

export const lessonKeys = Object.freeze({
  all: ["lessons"] as const,
  list: (params: QueryParams = {}) => ["lessons", "list", params] as const,
  detail: (id: string) => ["lessons", "detail", id] as const,
  recording: (id: string) => ["lessons", "recording", id] as const,
  ratings: (id: string) => ["lessons", "ratings", id] as const,
});

/** Egress MP4 ni yozib tugatguncha holat `processing` — shu vaqtda sekin polling qilamiz. */
const RECORDING_POLL_MS = 15_000;

/** `enabled` — chaqiruvchi ko'rinmayotgan bo'lim uchun so'rov yubormasligi mumkin. */
export function useLessons(params: QueryParams = {}, enabled = true) {
  return useQuery({
    queryKey: lessonKeys.list(params),
    queryFn: ({ signal }) => lessonApi.getAll({ signal, query: params }),
    select: (page) => page.items,
    enabled,
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

/**
 * Takrorlanuvchi jadval bo'yicha bir nechta dars yaratadi.
 *
 * Amal atomik emas, shuning uchun natija ikki qismdan iborat: yaratilganlar
 * va xato berganlar. Foydalanuvchiga ikkalasi ham aytiladi — "hammasi
 * saqlandi" deb noto'g'ri xabar bermaslik uchun.
 */
export function useCreateLessonSchedule() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ dates, form }: { dates: string[]; form: LessonFormInput }) =>
      lessonApi.createMany(dates, form),
    onSuccess: ({ created, failed }) => {
      client.invalidateQueries({ queryKey: lessonKeys.all });
      if (!failed.length) {
        toast.success(`${created.length} ta dars jadvalga qo‘shildi`);
        return;
      }
      if (created.length) {
        toast.warning(`${created.length} ta dars qo‘shildi, ${failed.length} tasi saqlanmadi`);
        return;
      }
      toast.error("Darslarni saqlab bo‘lmadi");
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

/**
 * Darsga qo'yilgan baholar.
 *
 * Ro'yxatni ko'rish huquqi rolga bog'liq — o'quvchida 403 kelishi mumkin.
 * Bu xato emas: forma shunchaki "avval baholaganmisiz" ma'lumotisiz ochiladi,
 * shuning uchun qayta urinilmaydi va global toast ko'rsatilmaydi.
 */
export function useLessonRatings(lessonId: string | null, enabled = true) {
  return useQuery({
    queryKey: lessonKeys.ratings(lessonId ?? ""),
    queryFn: ({ signal }) => lessonApi.getRatings(lessonId as string, { signal }),
    enabled: Boolean(lessonId) && enabled,
    retry: false,
  });
}

/** Xatoni chaqiruvchi forma ichida ko'rsatadi (masalan "dars hali tugamagan"). */
export function useRateLesson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: LessonRatingInput }) =>
      lessonApi.rate(id, input),
    onSuccess: () => {
      // Ro'yxatdagi `avg_rating`/`rating_count` ham yangilanishi kerak.
      client.invalidateQueries({ queryKey: lessonKeys.all });
      toast.success("Bahoyingiz uchun rahmat!");
    },
  });
}
