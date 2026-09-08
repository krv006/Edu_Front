import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE, useLanguageStore } from "@/shared/model";
import enAuth from "./locales/en/auth.json";
import enBoard from "./locales/en/board.json";
import enChat from "./locales/en/chat.json";
import enCommon from "./locales/en/common.json";
import enHomework from "./locales/en/homework.json";
import enLesson from "./locales/en/lesson.json";
import enNav from "./locales/en/nav.json";
import ruAuth from "./locales/ru/auth.json";
import ruBoard from "./locales/ru/board.json";
import ruChat from "./locales/ru/chat.json";
import ruCommon from "./locales/ru/common.json";
import ruHomework from "./locales/ru/homework.json";
import ruLesson from "./locales/ru/lesson.json";
import ruNav from "./locales/ru/nav.json";
import uzAuth from "./locales/uz/auth.json";
import uzBoard from "./locales/uz/board.json";
import uzChat from "./locales/uz/chat.json";
import uzCommon from "./locales/uz/common.json";
import uzHomework from "./locales/uz/homework.json";
import uzLesson from "./locales/uz/lesson.json";
import uzNav from "./locales/uz/nav.json";

/**
 * Tarjimalar hozircha "common" (umumiy UI), "auth" (kirish/ro'yxatdan o'tish),
 * "nav" (rol navigatsiyasi), "lesson" (darslar/kalendar), "homework"
 * (vazifalar), "chat" (suhbat/xabarlar) va "board" (doska) nomlar
 * maydonlariga bo'lingan — qolgan modullar bosqichma-bosqich, har biri o'z
 * alohida PR'ida shu yerga qo'shiladi.
 */
void i18next.use(initReactI18next).init({
  resources: {
    uz: { common: uzCommon, auth: uzAuth, nav: uzNav, lesson: uzLesson, homework: uzHomework, chat: uzChat, board: uzBoard },
    en: { common: enCommon, auth: enAuth, nav: enNav, lesson: enLesson, homework: enHomework, chat: enChat, board: enBoard },
    ru: { common: ruCommon, auth: ruAuth, nav: ruNav, lesson: ruLesson, homework: ruHomework, chat: ruChat, board: ruBoard },
  },
  lng: useLanguageStore.getState().language,
  fallbackLng: DEFAULT_LANGUAGE,
  ns: ["common", "auth", "nav", "lesson", "homework", "chat", "board"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
  returnNull: false,
});

/*
 * Til do'koni (foydalanuvchi tanlovi, zustand + localStorage) yagona haqiqat
 * manbai — i18next shunga OBUNA bo'ladi, aksincha emas. Shu tufayli
 * `Accept-Language` sarlavhasini qo'yadigan `request-interceptor.ts` ham
 * xuddi shu do'kondan o'qiydi va ikkalasi hech qachon bir-biridan ajralib
 * qolmaydi.
 */
useLanguageStore.subscribe((state) => {
  if (i18next.language !== state.language) void i18next.changeLanguage(state.language);
});

export { i18next as i18n };
