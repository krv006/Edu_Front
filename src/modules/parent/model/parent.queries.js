import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { parentApi } from "../api/parent.api";

export const parentKeys = Object.freeze({ all: ["parent"], dashboard: (childId) => ["parent", "dashboard", childId ?? "all"], children: ["parent", "children"], links: ["parent", "links"], consents: ["parent", "consents"], homework: (childId) => ["parent", "homework", childId] });
export function useParentDashboard(selectedChildId) { return useQuery({ queryKey: parentKeys.dashboard(selectedChildId), queryFn: ({ signal }) => parentApi.getDashboard({ signal, selectedChildId }) }); }
export function useParentChildren() { return useQuery({ queryKey: parentKeys.children, queryFn: ({ signal }) => parentApi.getChildren({ signal }) }); }
export function useParentLinks() { return useQuery({ queryKey: parentKeys.links, queryFn: ({ signal }) => parentApi.getLinks({ signal }) }); }
export function useParentConsents() { return useQuery({ queryKey: parentKeys.consents, queryFn: ({ signal }) => parentApi.getConsents({ signal }) }); }
export function useParentHomework(selectedChildId) { return useQuery({ queryKey: parentKeys.homework(selectedChildId), queryFn: ({ signal }) => parentApi.getHomework(selectedChildId, { signal }), enabled: Boolean(selectedChildId) }); }
export function useRequestChildLink() { const client = useQueryClient(); return useMutation({ mutationFn: parentApi.requestLink, onSuccess: () => { client.invalidateQueries({ queryKey: parentKeys.all }); toast.success("Bog‘lash so‘rovi yuborildi"); } }); }
export function useCreateChild() { const client = useQueryClient(); return useMutation({ mutationFn: parentApi.createChild, onSuccess: () => { client.invalidateQueries({ queryKey: parentKeys.all }); toast.success("Bola hisobi yaratildi"); } }); }
export function useRespondParentLink() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, action }) => parentApi.respondLink(id, action), onSuccess: () => { client.invalidateQueries({ queryKey: parentKeys.all }); toast.success("So‘rov yangilandi"); } }); }
export function useSetParentConsent() { const client = useQueryClient(); return useMutation({ mutationFn: parentApi.setConsent, onSuccess: () => { client.invalidateQueries({ queryKey: parentKeys.consents }); toast.success("Maxfiylik ruxsati saqlandi"); } }); }
