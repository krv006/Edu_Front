export const quizEndpoints = Object.freeze({
  list: "/api/v1/quizzes/",
  detail: (id: string) => `/api/v1/quizzes/${id}/`,
  attempts: (id: string) => `/api/v1/quizzes/${id}/attempts/`,
  import: "/api/v1/quizzes/import/",
  template: "/api/v1/quizzes/template/",
});
