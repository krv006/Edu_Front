import { describe, expect, it, vi } from "vitest";
import { RefreshTokenManager } from "./refresh-token-manager";

describe("RefreshTokenManager", () => {
  it("parallel 401 holatlar uchun bitta refresh so‘rovi yuboradi", async () => {
    const manager = new RefreshTokenManager();
    const refresh = vi.fn(async () => Promise.resolve());
    manager.configure(refresh);
    const result = await Promise.all([manager.refresh(), manager.refresh(), manager.refresh()]);
    expect(result).toEqual([true, true, true]);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
