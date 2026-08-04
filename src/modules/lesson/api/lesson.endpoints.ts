export const lessonEndpoints = Object.freeze({
  list: "/api/v1/lessons/",
  detail: (id: string) => `/api/v1/lessons/${id}/`,
  finish: (id: string) => `/api/v1/lessons/${id}/finish/`,
});
