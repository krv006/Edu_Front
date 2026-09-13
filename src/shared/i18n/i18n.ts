import i18next, { type Resource } from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE, useLanguageStore } from "@/shared/model";

const localeModules = import.meta.glob<{ default: Record<string, string> }>(
  "./locales/*/*.json",
  { eager: true }
);

const resources: Resource = {};
const namespaces = new Set<string>();

for (const [path, mod] of Object.entries(localeModules)) {
  const match = /\/locales\/([a-z]+)\/([a-z]+)\.json$/.exec(path);
  if (!match) continue;
  const [, language, namespace] = match;
  resources[language] ??= {};
  resources[language][namespace] = mod.default;
  namespaces.add(namespace);
}

void i18next.use(initReactI18next).init({
  resources,
  lng: useLanguageStore.getState().language,
  fallbackLng: DEFAULT_LANGUAGE,
  ns: [...namespaces],
  defaultNS: "common",
  interpolation: { escapeValue: false },
  returnNull: false,
});

useLanguageStore.subscribe((state) => {
  if (i18next.language !== state.language) void i18next.changeLanguage(state.language);
});

export { i18next as i18n };
