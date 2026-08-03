export const homeworkEndpoints = Object.freeze({
  assignments: "/api/v1/homework/assignments/", assignment: (id) => `/api/v1/homework/assignments/${id}/`,
  assignmentFile: (id) => `/api/v1/homework/assignments/${id}/file/`, submit: (id) => `/api/v1/homework/assignments/${id}/submit/`,
  submission: (id) => `/api/v1/homework/submissions/${id}/`, submissionFile: (id) => `/api/v1/homework/submissions/${id}/file/`,
  recheck: (id) => `/api/v1/homework/submissions/${id}/recheck/`,
});
