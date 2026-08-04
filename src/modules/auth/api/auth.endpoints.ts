export const authEndpoints = Object.freeze({
  login: "/api/v1/auth/login/",
  refresh: "/api/v1/auth/token/refresh/",
  me: "/api/v1/auth/me/",
  register: "/api/v1/auth/register/",
  children: "/api/v1/auth/children/",
  links: "/api/v1/auth/links/",
  requestLink: "/api/v1/auth/links/request/",
  respondLink: (id: string) => `/api/v1/auth/links/${id}/respond/`,
  consents: "/api/v1/auth/consents/",
});
