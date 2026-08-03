export const API_ERROR_CODES = Object.freeze({
  NETWORK_ERROR: "NETWORK_ERROR",
  OFFLINE: "OFFLINE",
  TIMEOUT: "TIMEOUT",
  REQUEST_ABORTED: "REQUEST_ABORTED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
});

const STATUS_CODES = {
  400: API_ERROR_CODES.VALIDATION_ERROR,
  401: API_ERROR_CODES.UNAUTHORIZED,
  403: API_ERROR_CODES.FORBIDDEN,
  404: API_ERROR_CODES.NOT_FOUND,
  409: API_ERROR_CODES.CONFLICT,
  413: API_ERROR_CODES.FILE_TOO_LARGE,
  422: API_ERROR_CODES.VALIDATION_ERROR,
  429: API_ERROR_CODES.RATE_LIMITED,
};

export class AppError extends Error {
  constructor({
    code = API_ERROR_CODES.UNKNOWN_ERROR,
    message = "So‘rovni bajarib bo‘lmadi",
    status = 0,
    fields = null,
    detail = null,
    requestId = null,
    originalError = null,
  }) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.fields = fields;
    this.detail = detail;
    this.requestId = requestId;
    this.originalError = originalError;
  }
}

export const ApiError = AppError;

function extractFields(details) {
  if (!details || typeof details !== "object" || Array.isArray(details))
    return null;
  const source =
    details.fields && typeof details.fields === "object"
      ? details.fields
      : details;
  const fields = Object.fromEntries(
    Object.entries(source).filter(
      ([key, value]) =>
        key !== "detail" && (typeof value === "string" || Array.isArray(value))
    )
  );
  return Object.keys(fields).length > 0 ? fields : null;
}

export function createApiError({
  payload,
  status = 0,
  requestId = null,
  originalError = null,
}) {
  const backendError = payload?.error ?? null;
  const details = backendError?.details ?? payload?.details ?? null;
  const code =
    backendError?.code ??
    STATUS_CODES[status] ??
    (status >= 500
      ? API_ERROR_CODES.SERVER_ERROR
      : API_ERROR_CODES.UNKNOWN_ERROR);
  return new AppError({
    code,
    status,
    requestId,
    fields: backendError?.fields ?? extractFields(details),
    detail: details?.detail ?? payload?.detail ?? null,
    message:
      backendError?.message ??
      payload?.message ??
      payload?.detail ??
      defaultMessage(status),
    originalError,
  });
}

export function createTransportError(
  error,
  { aborted = false, timedOut = false, offline = false } = {}
) {
  if (timedOut)
    return new AppError({
      code: API_ERROR_CODES.TIMEOUT,
      message: "So‘rov vaqti tugadi. Qayta urinib ko‘ring.",
      originalError: error,
    });
  if (aborted)
    return new AppError({
      code: API_ERROR_CODES.REQUEST_ABORTED,
      message: "So‘rov bekor qilindi",
      originalError: error,
    });
  if (offline)
    return new AppError({
      code: API_ERROR_CODES.OFFLINE,
      message: "Internet aloqasi mavjud emas",
      originalError: error,
    });
  return new AppError({
    code: API_ERROR_CODES.NETWORK_ERROR,
    message: "Server bilan bog‘lanib bo‘lmadi",
    originalError: error,
  });
}

function defaultMessage(status) {
  if (status === 401) return "Sessiya tugagan. Qayta kiring.";
  if (status === 403) return "Bu amal uchun ruxsat yetarli emas.";
  if (status === 404) return "So‘ralgan ma’lumot topilmadi.";
  if (status === 429) return "Juda ko‘p so‘rov yuborildi. Biroz kuting.";
  if (status >= 500) return "Serverda xatolik yuz berdi.";
  return "So‘rovni bajarib bo‘lmadi";
}
