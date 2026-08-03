import { AppError, API_ERROR_CODES } from "@/shared/api";
import { ASSIGNMENT_EXTENSIONS, HOMEWORK_EXTENSIONS, HOMEWORK_MAX_FILE_SIZE } from "../constants/homework.constants";
export function validateHomeworkFile(file, { assignment = false, speaking = false } = {}) {
  if (!file) throw new AppError({ code: API_ERROR_CODES.VALIDATION_ERROR, message: "Faylni tanlang", fields: { file: "Fayl majburiy" } });
  const extension = file.name.split(".").pop()?.toLowerCase(); const allowed = assignment ? ASSIGNMENT_EXTENSIONS : HOMEWORK_EXTENSIONS;
  if (!allowed.includes(extension)) throw new AppError({ code: API_ERROR_CODES.VALIDATION_ERROR, message: "Fayl turi qo‘llab-quvvatlanmaydi", fields: { file: `Mumkin: ${allowed.join(", ")}` } });
  if (["mp3", "wav", "m4a", "ogg"].includes(extension) && !speaking) throw new AppError({ code: API_ERROR_CODES.VALIDATION_ERROR, message: "Audio faqat Speaking vazifasi uchun" });
  if (file.size > HOMEWORK_MAX_FILE_SIZE) throw new AppError({ code: API_ERROR_CODES.FILE_TOO_LARGE, message: "Fayl 25 MB dan katta" });
  return true;
}
