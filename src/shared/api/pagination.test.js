import { describe, expect, it } from "vitest";
import { normalizePagination } from "./pagination";

describe("normalizePagination", () => {
  it("DRF pagination javobini ichki modelga map qiladi", () => {
    expect(normalizePagination({ count: 21, next: "https://api.test/items?page=2", previous: null, results: [{ id: 1 }] }, { pageSize: 10 })).toEqual({
      items: [{ id: 1 }], page: 1, pageSize: 10, total: 21, totalPages: 3,
      next: "https://api.test/items?page=2", previous: null,
    });
  });
});
