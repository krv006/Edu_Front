import { apiClient, type RequestOptions } from "@/shared/api";
import { attendanceApi } from "@/modules/attendance";
import { courseApi } from "@/modules/course";
import { homeworkApi } from "@/modules/homework";
import { authEndpoints, type CreateChildRequestDto, type LinkAction } from "@/modules/auth";
import type { Assignment } from "@/shared/types";
import type {
  Consent,
  ConsentDto,
  ParentLinkDto,
  SetConsentInput,
} from "./parent.dto";
import { createParentDashboard, mapChildFromLink, mapParentLinkDto } from "../lib/parent.mappers";

export interface ParentDashboardOptions extends RequestOptions {
  selectedChildId?: string | null;
}

function mapConsentDto(item: ConsentDto): Consent {
  return {
    id: String(item.id),
    studentId: String(item.student),
    kind: item.kind,
    granted: Boolean(item.granted),
    updatedAt: item.updated_at,
  };
}

export const parentApi = {
  async getLinks(options?: RequestOptions) {
    const items = await apiClient.get<ParentLinkDto[]>(authEndpoints.links, options);
    return items.map(mapParentLinkDto);
  },

  /** Faqat tasdiqlangan bog'lanishlar — rozilik modeli (docs/ARCHITECTURE.md §5). */
  async getChildren(options?: RequestOptions) {
    const links = await this.getLinks(options);
    const approved = links.filter((item) => item.status === "approved");
    // Tasdiqlangan farzand yo'q ekan, davomat so'rovi ortiqcha: uni filtrlab
    // beradigan o'quvchi yo'q, server esa bunday so'rovni rad etadi va butun
    // sahifa xatoga aylanadi. Bo'sh ro'yxat — xato emas, oddiy boshlang'ich holat.
    if (!approved.length) return [];
    const attendancePage = await attendanceApi.getAll({ ...options, query: { page_size: 100 } });
    return approved.map((link) => mapChildFromLink(link, attendancePage.items));
  },

  async getDashboard(options: ParentDashboardOptions = {}) {
    const { selectedChildId, ...requestOptions } = options;
    const links = await this.getLinks(requestOptions);
    // Yuqoridagi sabab: farzand biriktirilmagan ota-onaga davomat so'ralmaydi.
    if (!links.some((item) => item.status === "approved")) {
      return createParentDashboard(links, []);
    }
    const attendancePage = await attendanceApi.getAll({
      ...requestOptions,
      query: { page_size: 100, ...(selectedChildId ? { student: selectedChildId } : {}) },
    });
    return createParentDashboard(links, attendancePage.items);
  },

  async createChild(dto: CreateChildRequestDto) {
    return apiClient.post(authEndpoints.children, dto);
  },

  async requestLink(inviteCode: string) {
    return mapParentLinkDto(
      await apiClient.post<ParentLinkDto>(authEndpoints.requestLink, { invite_code: inviteCode })
    );
  },

  async respondLink(id: string, action: LinkAction) {
    return mapParentLinkDto(
      await apiClient.post<ParentLinkDto>(authEndpoints.respondLink(id), { action })
    );
  },

  async getConsents(options?: RequestOptions) {
    const items = await apiClient.get<ConsentDto[]>(authEndpoints.consents, options);
    return items.map(mapConsentDto);
  },

  async setConsent(dto: SetConsentInput) {
    const item = await apiClient.post<ConsentDto>(authEndpoints.consents, {
      student: dto.studentId,
      kind: dto.kind,
      granted: dto.granted,
    });
    return mapConsentDto(item);
  },

  /**
   * Backendda "farzandimning vazifalari" endpointi yo'q — kurslar bo'yicha yig'iladi
   * va har bir vazifaning topshiriqlaridan tanlangan bolaniki ajratiladi.
   */
  async getHomework(selectedChildId: string, options: RequestOptions = {}): Promise<Assignment[]> {
    const coursePage = await courseApi.getAll({ ...options, query: { page_size: 100 } });
    const assignments = (
      await Promise.all(
        coursePage.items.map((course) =>
          homeworkApi.getAssignments(course.id, options).catch((): Assignment[] => [])
        )
      )
    ).flat();
    const details = await Promise.all(
      assignments.map((item) => homeworkApi.getAssignment(item.id, options).catch(() => item))
    );
    return details.map((item) => ({
      ...item,
      mySubmission:
        item.submissions?.find((submission) => submission.studentId === selectedChildId) ?? null,
    }));
  },
};
