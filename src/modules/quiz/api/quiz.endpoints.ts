export const quizEndpoints = Object.freeze({
  list: "/api/v1/quizzes/",
  detail: (id: string) => `/api/v1/quizzes/${id}/`,
  /** GET — urinishlar tarixi, POST — javob topshirish (natija darhol keladi). */
  attempts: (id: string) => `/api/v1/quizzes/${id}/attempts/`,
  /** `.docx` yoki `.xlsx` fayldan savol parse qilib preview qaytaradi — hech narsa saqlanmaydi. */
  import: "/api/v1/quizzes/import/",
  /** Bo'sh shablon fayl (.docx / .xlsx) — to'ldirib qaytadan `import`ga yuborish uchun. */
  template: "/api/v1/quizzes/template/",
});
