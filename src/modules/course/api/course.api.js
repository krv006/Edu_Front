import { apiClient, selectApiTransport } from "@/shared/api";
import { courseSeed, courseWorkspaceSeed } from "./adapters/course.mock-data";

const wait = () =>
  new Promise((resolve) => globalThis.setTimeout(resolve, 180));
const mock = {
  async getAll() {
    await wait();
    return structuredClone(courseSeed);
  },
  async getById(id) {
    await wait();
    const course = courseSeed.find((item) => item.id === id);
    return course
      ? { ...structuredClone(courseWorkspaceSeed), ...course }
      : null;
  },
};
const remote = {
  async getAll(options) {
    const result = await apiClient.get("/courses", options);
    return result.data ?? result;
  },
  async getById(id, options) {
    const result = await apiClient.get(`/courses/${id}`, options);
    return result.data ?? result;
  },
};
export const courseApi = selectApiTransport({ mock, remote });
