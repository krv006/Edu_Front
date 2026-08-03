import { apiConfig } from "./api-config";
import { AppError, createTransportError } from "./api-error";
import { buildRequestUrl, createRequestInit } from "./request-interceptor";
import { handleApiResponse } from "./response-interceptor";
import { refreshTokenManager } from "./refresh-token-manager";

function createRequestId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `req-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function createSignal(externalSignal, timeoutMs) {
  const controller = new AbortController();
  let timedOut = false;
  const abortFromExternal = () => controller.abort(externalSignal?.reason);
  externalSignal?.addEventListener("abort", abortFromExternal, { once: true });
  const timeoutId = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  return {
    signal: controller.signal,
    didTimeOut: () => timedOut,
    cleanup() {
      globalThis.clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", abortFromExternal);
    },
  };
}

export class ApiClient {
  constructor({
    baseUrl = apiConfig.baseUrl,
    timeoutMs = apiConfig.timeoutMs,
  } = {}) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
  }

  async request(path, options = {}, isRetry = false) {
    const requestId = options.requestId ?? createRequestId();
    const requestUrl = buildRequestUrl(this.baseUrl, path, options.query);
    const requestOptions = { ...options, requestId };
    const requestSignal = createSignal(
      options.signal,
      options.timeoutMs ?? this.timeoutMs
    );

    try {
      const response = await fetch(
        requestUrl,
        createRequestInit(
          requestOptions,
          requestSignal.signal,
          apiConfig.defaultHeaders
        )
      );
      if (
        response.status === 401 &&
        !isRetry &&
        !options.skipAuth &&
        !options.skipRefresh &&
        (await refreshTokenManager.refresh())
      ) {
        return this.request(path, options, true);
      }
      return await handleApiResponse(response, {
        responseType: options.responseType,
        requestId,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw createTransportError(error, {
        timedOut: requestSignal.didTimeOut(),
        aborted: requestSignal.signal.aborted,
        offline: typeof navigator !== "undefined" && navigator.onLine === false,
      });
    } finally {
      requestSignal.cleanup();
    }
  }

  get(path, options) {
    return this.request(path, { ...options, method: "GET" });
  }
  post(path, body, options) {
    return this.request(path, { ...options, method: "POST", body });
  }
  put(path, body, options) {
    return this.request(path, { ...options, method: "PUT", body });
  }
  patch(path, body, options) {
    return this.request(path, { ...options, method: "PATCH", body });
  }
  delete(path, options) {
    return this.request(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
