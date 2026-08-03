import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardApi } from "../api/board.api";
export const boardKeys = Object.freeze({ all: ["board"], state: (id) => ["board", id] });
export function useBoard(lessonId, enabled = true) { return useQuery({ queryKey: boardKeys.state(lessonId), queryFn: ({ signal }) => boardApi.getState(lessonId, { signal }), enabled: Boolean(lessonId && enabled), refetchInterval: 2000 }); }
export function useAddStroke(lessonId) { const client = useQueryClient(); return useMutation({ mutationFn: ({ sheet, stroke }) => boardApi.addStroke(lessonId, sheet, stroke), onSuccess: () => client.invalidateQueries({ queryKey: boardKeys.state(lessonId) }) }); }
export function useAddSheet(lessonId) { const client = useQueryClient(); return useMutation({ mutationFn: () => boardApi.addSheet(lessonId), onSuccess: () => client.invalidateQueries({ queryKey: boardKeys.state(lessonId) }) }); }
export function useEraseStrokes(lessonId) { const client = useQueryClient(); return useMutation({ mutationFn: ({ sheet, strokeIds, reason }) => boardApi.erase(lessonId, sheet, strokeIds, reason), onSuccess: () => client.invalidateQueries({ queryKey: boardKeys.state(lessonId) }) }); }
export function useGrantDraw(lessonId) { return useMutation({ mutationFn: (studentId) => boardApi.grant(lessonId, studentId) }); }
export function useSolveFormula(lessonId) { return useMutation({ mutationFn: (expression) => boardApi.solve(lessonId, expression) }); }
