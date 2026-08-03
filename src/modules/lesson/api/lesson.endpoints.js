export const lessonEndpoints = Object.freeze({
  list: "/api/v1/lessons/",
  detail: (id) => `/api/v1/lessons/${id}/`,
  finish: (id) => `/api/v1/lessons/${id}/finish/`,
});
