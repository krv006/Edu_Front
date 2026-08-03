import { describe, expect, it, vi } from "vitest";
import { applyApiFieldErrors } from "./apply-api-field-errors";
import { normalizeMediaUrl } from "./media-url";
describe("shared API mapping utils", () => {
  it("backend field xatolarini form fieldiga map qiladi", () => { const setError = vi.fn(); expect(applyApiFieldErrors({ fields: { username: ["Band"], non_field_errors: "Xato" } }, setError, { username: "login" })).toBe(true); expect(setError).toHaveBeenCalledWith("login", { type: "server", message: "Band" }); expect(setError).toHaveBeenCalledWith("root", { type: "server", message: "Xato" }); });
  it("relative media URLni API origin bilan birlashtiradi", () => { expect(normalizeMediaUrl("/media/file.pdf")).toBe("https://edu.thesofmebel.uz/media/file.pdf"); expect(normalizeMediaUrl("https://cdn.example/file.pdf")).toBe("https://cdn.example/file.pdf"); });
});
