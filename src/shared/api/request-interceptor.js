import { tokenStorage } from "./token-storage";

export function appendQuery(url, query) {
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

export function buildRequestUrl(baseUrl, path, query) {
  const absolute = /^https?:\/\//.test(path);
  const normalizedPath = absolute ? path : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  return appendQuery(normalizedPath, query);
}

export function createRequestInit(options, signal, defaultHeaders) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const hasBody = options.body !== undefined && options.body !== null;
  const token = options.skipAuth ? null : tokenStorage.getAccessToken();
  return {
    method: options.method ?? (hasBody ? "POST" : "GET"),
    body: hasBody ? (isFormData || typeof options.body === "string" || options.body instanceof Blob ? options.body : JSON.stringify(options.body)) : undefined,
    credentials: options.credentials ?? "omit",
    headers: {
      ...defaultHeaders,
      ...(hasBody && !isFormData && typeof options.body !== "string" ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.requestId ? { "X-Request-ID": options.requestId } : {}),
      ...options.headers,
    },
    signal,
  };
}
