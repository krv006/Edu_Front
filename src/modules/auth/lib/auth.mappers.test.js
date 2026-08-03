import { describe, expect, it } from "vitest";
import { mapLoginRequest, mapTokenPairDto, mapUserDto } from "./auth.mappers";

describe("auth mappers", () => {
  it("formani Swagger login DTO siga o‘giradi", () => {
    expect(mapLoginRequest({ login: " teacher ", password: "secret" })).toEqual(
      { username: "teacher", password: "secret" }
    );
  });

  it("token va user DTO larini UI modeliga o‘giradi", () => {
    expect(mapTokenPairDto({ access: "a", refresh: "r" })).toEqual({
      accessToken: "a",
      refreshToken: "r",
    });
    expect(
      mapUserDto({
        id: "1",
        username: "teacher",
        first_name: "Malika",
        last_name: "Karimova",
        role: "teacher",
        phone: null,
        invite_code: null,
      })
    ).toMatchObject({
      id: "1",
      username: "teacher",
      name: "Malika Karimova",
      role: "TEACHER",
    });
  });
});
