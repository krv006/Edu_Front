import { describe, expect, it } from "vitest";
import { getHomeworkPollingInterval } from "../model/homework.queries";
import { validateHomeworkFile } from "./homework-validation";

describe("homework upload validation", () => {
  it("ruxsat etilgan PDFni qabul qiladi", () => { expect(validateHomeworkFile(new File(["answer"], "answer.pdf", { type: "application/pdf" }))).toBe(true); });
  it("audio faylni faqat speaking uchun qabul qiladi", () => { const audio = new File(["voice"], "voice.mp3", { type: "audio/mpeg" }); expect(() => validateHomeworkFile(audio)).toThrow("Audio faqat Speaking"); expect(validateHomeworkFile(audio, { speaking: true })).toBe(true); });
  it("noma’lum kengaytmani rad etadi", () => { expect(() => validateHomeworkFile(new File(["x"], "answer.exe"))).toThrow(); });
  it("polling faqat checking davomida ishlaydi", () => { expect(getHomeworkPollingInterval({ status: "checking" }, 1_000, 300_000)).toBe(2500); expect(getHomeworkPollingInterval({ status: "done" }, 1_000, 300_000)).toBe(false); expect(getHomeworkPollingInterval({ status: "error" }, 1_000, 300_000)).toBe(false); expect(getHomeworkPollingInterval({ status: "checking" }, 300_001, 300_000)).toBe(false); });
});
