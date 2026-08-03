import { describe, expect, it } from "vitest";
import { API_ERROR_CODES, createApiError } from "./api-error";

describe("createApiError", () => {
  it("backend error formatini yagona AppError ga o‘giradi", () => {
    const error = createApiError({
      status: 401,
      payload: { success: false, error: { code: "authentication_failed", message: "Login xato", details: { username: ["Topilmadi"] } } },
    });
    expect(error.code).toBe("authentication_failed");
    expect(error.status).toBe(401);
    expect(error.fields).toEqual({ username: ["Topilmadi"] });
  });

  it("server xatosini to‘g‘ri tasniflaydi", () => {
    expect(createApiError({ status: 503 }).code).toBe(API_ERROR_CODES.SERVER_ERROR);
  });
});
