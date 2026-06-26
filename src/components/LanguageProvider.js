"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/lib/translations";

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key, params) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("language");
      if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
        setLanguageState(stored);
      }
      // Default stays Indonesian ("id"); we no longer auto-switch based on
      // the browser locale so the app is consistently Indonesian-first.
    } catch (error) {
      // ignore localStorage errors in private browsing
    }
  }, []);

  const setLanguage = (value) => {
    if (!SUPPORTED_LANGUAGES.includes(value)) return;
    setLanguageState(value);
    try {
      window.localStorage.setItem("language", value);
    } catch (error) {
      // ignore localStorage failures
    }
  };

  const t = useMemo(
    () => (key, params = {}) => {
      const path = key.split(".");
      let result = translations[language];

      for (const part of path) {
        if (!result) break;
        result = result[part];
      }

      if (typeof result !== "string") {
        return key;
      }

      return result.replace(/\{(\w+)\}/g, (_, name) => {
        if (params[name] === undefined) return `{${name}}`;
        return params[name];
      });
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
