import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "./api-client";

afterEach(() => vi.unstubAllGlobals());

describe("ApiClient endpoint calls", () => {
  it("POST body va backend base URLni to‘g‘ri yuboradi", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ access: "a", refresh: "r" }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const client = new ApiClient({ baseUrl: "https://api.example.uz", timeoutMs: 1000 });
    await client.post("/api/v1/auth/login/", { username: "teacher", password: "secret" }, { skipAuth: true, skipRefresh: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example.uz/api/v1/auth/login/");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ username: "teacher", password: "secret" });
  });

  it("405 javobini HTML fallback emas AppError sifatida qaytaradi", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json" } })));
    const client = new ApiClient({ baseUrl: "https://api.example.uz", timeoutMs: 1000 });
    await expect(client.post("/api/v1/auth/login/", {}, { skipAuth: true, skipRefresh: true })).rejects.toMatchObject({ status: 405, message: "Method not allowed" });
  });
});
