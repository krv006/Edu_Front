import { describe, expect, it } from "vitest";
import { resolveHomeRoute } from "./resolve-home-route";

describe("resolveHomeRoute", () => {
  it.each([
    ["teacher", "/teacher/dashboard"],
    ["student", "/student/dashboard"],
    ["parent", "/parent/dashboard"],
    ["admin", "/admin/dashboard"],
    ["super_admin", "/admin/dashboard"],
  ])("%s rolini %s ga yo‘naltiradi", (role, route) => {
    expect(resolveHomeRoute({ role })).toBe(route);
  });
});
