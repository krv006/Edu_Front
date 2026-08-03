export const API_ERROR_CODES = Object.freeze({
  NETWORK_ERROR: "NETWORK_ERROR",
  REQUEST_ABORTED: "REQUEST_ABORTED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
});

const STATUS_CODES = {
  401: API_ERROR_CODES.UNAUTHORIZED,
  403: API_ERROR_CODES.FORBIDDEN,
  404: API_ERROR_CODES.NOT_FOUND,
  422: API_ERROR_CODES.VALIDATION_ERROR,
};

export class ApiError extends Error {
  constructor({ code, message, status = 0, fields = null, requestId = null, originalError = null }) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fields = fields;
    this.requestId = requestId;
    this.originalError = originalError;
  }
}

export function createApiError({ payload, status, requestId, originalError }) {
  const responseError = payload?.error;
  const code = responseError?.code
    ?? STATUS_CODES[status]
    ?? (status >= 500 ? API_ERROR_CODES.SERVER_ERROR : API_ERROR_CODES.UNKNOWN_ERROR);

  return new ApiError({
    code,
    status,
    requestId,
    fields: responseError?.fields ?? null,
    message: responseError?.message ?? payload?.message ?? "So‘rovni bajarib bo‘lmadi",
    originalError,
  });
}
