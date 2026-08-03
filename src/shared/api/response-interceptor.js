import { createApiError } from "./api-error";
import { readApiResponse, unwrapApiResponse } from "./api-response";

export async function handleApiResponse(response, options = {}) {
  const payload = await readApiResponse(response, options.responseType);
  const requestId = response.headers.get("x-request-id") ?? options.requestId ?? null;
  if (!response.ok || payload?.success === false) throw createApiError({ payload, status: response.status, requestId });
  return unwrapApiResponse(payload);
}
