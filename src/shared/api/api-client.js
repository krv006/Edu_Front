import { apiConfig } from "./api-config";
import { API_ERROR_CODES, ApiError, createApiError } from "./api-error";
import { tokenStorage } from "./token-storage";

function createRequestId() {
  return globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function appendQuery(url, query) {
  if (!query) return url;
  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) value.forEach((item) => search.append(key, String(item)));
    else search.set(key, String(value));
  });
  const queryString = search.toString();
  return queryString ? `${url}${url.includes("?") ? "&" : "?"}${queryString}` : url;
}

function createSignal(externalSignal, timeoutMs) {
  const controller = new AbortController();
  const abortFromExternal = () => controller.abort(externalSignal?.reason);
  externalSignal?.addEventListener("abort", abortFromExternal, { once: true });
  const timeoutId = globalThis.setTimeout(() => controller.abort(new DOMException("Request timed out", "TimeoutError")), timeoutMs);

  return {
    signal: controller.signal,
    cleanup() {
      globalThis.clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", abortFromExternal);
    },
  };
}

async function readPayload(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json")
    ? response.json().catch(() => null)
    : response.text().catch(() => null);
}

export class ApiClient {
  constructor({ baseUrl = apiConfig.baseUrl, timeoutMs = apiConfig.timeoutMs } = {}) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
    this.unauthorizedHandler = null;
    this.refreshPromise = null;
  }

  setUnauthorizedHandler(handler) {
    this.unauthorizedHandler = handler;
  }

  async refreshSession() {
    if (!this.unauthorizedHandler) return false;
    if (!this.refreshPromise) {
      this.refreshPromise = Promise.resolve(this.unauthorizedHandler())
        .finally(() => { this.refreshPromise = null; });
    }
    return Boolean(await this.refreshPromise);
  }

  async request(path, options = {}, isRetry = false) {
    if (!this.baseUrl && !/^https?:\/\//.test(path)) {
      throw new ApiError({
        code: API_ERROR_CODES.NETWORK_ERROR,
        message: "API manzili sozlanmagan",
      });
    }

    const requestId = options.requestId ?? createRequestId();
    const requestUrl = appendQuery(/^https?:\/\//.test(path) ? path : `${this.baseUrl}${path}`, options.query);
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    const token = options.skipAuth ? null : tokenStorage.getAccessToken();
    const { signal, cleanup } = createSignal(options.signal, options.timeoutMs ?? this.timeoutMs);

    try {
      const response = await fetch(requestUrl, {
        method: options.method ?? (options.body ? "POST" : "GET"),
        body: options.body && !isFormData ? JSON.stringify(options.body) : options.body,
        credentials: options.credentials ?? "same-origin",
        headers: {
          ...apiConfig.defaultHeaders,
          ...(isFormData || !options.body ? {} : { "Content-Type": "application/json" }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "X-Request-ID": requestId,
          ...options.headers,
        },
        signal,
      });

      const payload = await readPayload(response);

      if (response.status === 401 && !isRetry && !options.skipAuth && await this.refreshSession()) {
        return this.request(path, options, true);
      }

      if (!response.ok || payload?.success === false) {
        throw createApiError({ payload, status: response.status, requestId });
      }

      if (payload?.success === true) {
        return { data: payload.data, meta: payload.meta ?? null, requestId };
      }
      return payload;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      const aborted = signal.aborted || error?.name === "AbortError" || error?.name === "TimeoutError";
      throw new ApiError({
        code: aborted ? API_ERROR_CODES.REQUEST_ABORTED : API_ERROR_CODES.NETWORK_ERROR,
        message: aborted ? "So‘rov bekor qilindi" : "Tarmoq bilan bog‘lanib bo‘lmadi",
        requestId,
        originalError: error,
      });
    } finally {
      cleanup();
    }
  }

  get(path, options) {
    return this.request(path, { ...options, method: "GET" });
  }

  post(path, body, options) {
    return this.request(path, { ...options, method: "POST", body });
  }

  patch(path, body, options) {
    return this.request(path, { ...options, method: "PATCH", body });
  }

  delete(path, options) {
    return this.request(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
