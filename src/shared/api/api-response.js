export async function readApiResponse(response, responseType = "json") {
  if (response.status === 204) return null;
  if (responseType === "blob") return response.blob();
  if (responseType === "text") return response.text();
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json"))
    return response.json().catch(() => null);
  return response.text().catch(() => null);
}

export function unwrapApiResponse(payload) {
  return payload?.success === true ? payload.data : payload;
}
