import { describe, expect, it } from "vitest";
import { getSocketClosePolicy } from "./chat-socket-manager";
import { mapMessageDto, markMessageFailed, parseSocketEvent, upsertMessage } from "./message.mappers";

const dto = { id: "m1", room: "r1", sender: { id: "u1", username: "sardor", first_name: "Sardor", last_name: "Aliyev" }, text: "Salom", created_at: "2026-08-03T10:00:00Z" };
describe("message and WebSocket mapping", () => {
  it("REST va WebSocket message modelini bir xil qiladi", () => { expect(parseSocketEvent(JSON.stringify({ type: "message", message: dto })).message).toEqual(mapMessageDto(dto)); });
  it("takroriy message idni deduplikatsiya qiladi", () => { const first = mapMessageDto(dto); const updated = { ...first, text: "Yangilandi" }; expect(upsertMessage([first], updated)).toEqual([updated]); });
  it("typing va noma’lum eventlarni ajratadi", () => { expect(parseSocketEvent({ type: "typing", user_id: 7, name: "Sardor" })).toEqual({ type: "typing", userId: "7", name: "Sardor" }); expect(parseSocketEvent({ type: "unknown" })).toBeNull(); });
  it("4401 refresh va reconnect, 4403 esa to‘liq stop qiladi", () => { expect(getSocketClosePolicy(4401)).toEqual({ refresh: true, reconnect: true }); expect(getSocketClosePolicy(4403)).toEqual({ refresh: false, reconnect: false }); });
  it("optimistik xabarni retry uchun failed holatida saqlaydi", () => { expect(markMessageFailed([{ id: "temp-1", pending: true, status: "pending" }], "temp-1")).toEqual([{ id: "temp-1", pending: false, failed: true, status: "failed" }]); });
});
